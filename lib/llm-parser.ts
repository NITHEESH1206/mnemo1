/**
 * LLM-powered natural-language parser.
 *
 * Converts a free-form message into a structured reminder using GPT, with the
 * timezone math handled in our code (LLMs are unreliable at it). Falls back to
 * the regex parser when OPENAI_API_KEY is missing or the call fails.
 */

import OpenAI from "openai";
import {
  parseReminder,
  type ParseResult,
  type ParsedReminder,
  type Recurrence,
} from "./parser";

let cached: OpenAI | null = null;
function openai(): OpenAI {
  if (cached) return cached;
  cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return cached;
}

function tzOffsetMin(): number {
  const raw = process.env.TIMEZONE_OFFSET_MINUTES;
  if (raw) {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
  }
  return 330; // IST
}

/** Format a Date as the local wall-clock "YYYY-MM-DDTHH:mm" in the target tz. */
function localNowString(now: Date, offMin: number): string {
  const local = new Date(now.getTime() + offMin * 60_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${local.getUTCFullYear()}-${p(local.getUTCMonth() + 1)}-${p(local.getUTCDate())}` +
    `T${p(local.getUTCHours())}:${p(local.getUTCMinutes())}`
  );
}

/** Interpret "YYYY-MM-DDTHH:mm" as wall-clock in the target tz → UTC Date. */
function localStringToUTC(s: string, offMin: number): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const utcMs = Date.UTC(y, mo - 1, d, h, mi) - offMin * 60_000;
  return new Date(utcMs);
}

type LlmOut = {
  isReminder: boolean;
  task: string;
  fireAtLocal: string;
  recurrence: Recurrence;
  weekday: number | null;
  intervalMinutes: number | null;
  recipientName: string | null;
  isMeeting: boolean;
};

async function llmParse(
  text: string,
  now: Date,
  off: number,
): Promise<ParseResult> {
  const localNow = localNowString(now, off);

  const system = [
    "You convert a personal-assistant message into a reminder.",
    `The user's current local time is ${localNow} (UTC offset ${off} minutes).`,
    "Reply with STRICT JSON only, with these keys:",
    '- isReminder (boolean): true if the message asks to remember/schedule/be reminded of something.',
    '- task (string): the action only, without "remind me to". E.g. "call James".',
    '- fireAtLocal (string): when it should FIRST fire, as "YYYY-MM-DDTHH:mm" in the user\'s LOCAL time. If no time was given for a one-off, default to 1 hour from now. For any recurring reminder with no time, use 09:00. If only a date was given, use 09:00.',
    '- recurrence (string): one of "none","daily","weekly","monthly","weekday","interval". Use "weekday" for Monday–Friday only ("every weekday", "on weekdays", "standup every weekday"). Use "interval" for things that repeat every fixed gap ("twice a day", "three times a day", "every 3 hours", "every 30 minutes").',
    "- weekday (integer 0-6 Sunday-based, or null): only for weekly recurrence tied to a specific weekday.",
    '- intervalMinutes (integer or null): ONLY when recurrence is "interval" — the gap in minutes. "twice a day"=720, "three times a day"=480, "every 2 hours"=120, "every 30 minutes"=30. Otherwise null.',
    '- recipientName (string or null): a person\'s name if the reminder is FOR SOMEONE ELSE ("remind James..."), else null. "me"/"myself" => null.',
    "- isMeeting (boolean): true if it's a meeting/call/sync with a person that belongs on a calendar.",
    "Resolve relative dates (tomorrow, next Tuesday, in 2 hours) against the current local time. For \"weekday\" recurrence, make sure fireAtLocal is a Monday–Friday.",
  ].join("\n");

  const completion = await openai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: text },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const out = JSON.parse(raw) as Partial<LlmOut>;

  if (!out.isReminder) {
    return {
      ok: false,
      reason:
        "i'm best with reminders — try 'remind me to call James tomorrow at 3pm', or type *help*.",
    };
  }

  const fireAt =
    (out.fireAtLocal && localStringToUTC(out.fireAtLocal, off)) ||
    new Date(now.getTime() + 3_600_000);

  const task = (out.task || "").trim();
  if (!task) {
    return {
      ok: false,
      reason:
        "i caught the time but not the task. try: 'remind me to call James tomorrow at 3pm'.",
    };
  }

  const recurrence: Recurrence =
    out.recurrence &&
    ["none", "daily", "weekly", "monthly", "weekday", "interval"].includes(
      out.recurrence,
    )
      ? out.recurrence
      : "none";

  // Interval reminders need a sane gap; default to twice a day (12h).
  const intervalMinutes =
    recurrence === "interval"
      ? typeof out.intervalMinutes === "number" && out.intervalMinutes >= 15
        ? out.intervalMinutes
        : 720
      : undefined;

  const reminder: ParsedReminder = {
    task,
    fireAt,
    recurrence,
    weekday:
      typeof out.weekday === "number" && out.weekday >= 0 && out.weekday <= 6
        ? out.weekday
        : undefined,
    intervalMinutes,
    recipientName: out.recipientName ? String(out.recipientName).trim() : undefined,
    meeting: out.isMeeting
      ? { attendee: out.recipientName ?? null, summary: task }
      : undefined,
  };

  return { ok: true, reminder };
}

/** Parse a message — LLM first (if configured), regex fallback. */
export async function parseMessage(
  text: string,
  now: Date = new Date(),
  offsetMin: number = tzOffsetMin(),
): Promise<ParseResult> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await llmParse(text, now, offsetMin);
    } catch (e) {
      console.error("[llm-parser] falling back to regex:", e);
    }
  }
  return parseReminder(text, now, offsetMin);
}
