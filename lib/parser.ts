/**
 * Lightweight natural-language parser for reminder messages.
 * Handles common patterns without external dependencies.
 *
 * Timezone handling:
 *   - Clock-based times ("at 3pm", "tomorrow at 9am", weekly defaults)
 *     are interpreted in the timezone given by TIMEZONE_OFFSET_MINUTES
 *     (defaults to 330 = IST / Asia/Kolkata).
 *   - Relative times ("in 5 minutes", "in 2 hours") are timezone-agnostic.
 *
 * Examples it understands:
 *   "Remind me to call James tomorrow at 3pm"
 *   "Standup prep every Friday at 9am"
 *   "Pick up dry cleaning in 2 hours"
 *   "Pay rent on the 1st every month at 10am"     (partial — uses today + monthly)
 *   "Drink water every day at 8am"
 *
 * For richer parsing, swap the body of parseReminder() for an LLM call
 * (e.g., OpenAI / Anthropic) that returns the same ParsedReminder shape.
 */

export type Recurrence = "none" | "daily" | "weekly" | "monthly";

export type ParsedReminder = {
  task: string;
  fireAt: Date;
  recurrence: Recurrence;
  weekday?: number; // 0 = Sunday … 6 = Saturday
  meeting?: {
    /** Other person's name as parsed (e.g. "ashok"). null if not specified. */
    attendee: string | null;
    /** What the user actually said ("meet with ashok"); used as event title. */
    summary: string;
  };
};

export type ParseResult =
  | { ok: true; reminder: ParsedReminder }
  | { ok: false; reason: string };

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// --- Timezone helpers ---------------------------------------------------

/** Minutes east of UTC. 330 = IST (+5:30). Configurable via env var. */
function tzOffsetMin(): number {
  const raw = process.env.TIMEZONE_OFFSET_MINUTES;
  if (raw !== undefined && raw !== "") {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
  }
  return 330; // default Asia/Kolkata
}

/**
 * Build a Date representing `hour:minute` on the calendar date that is
 * `dayOffset` days after "today in the target timezone" — returned as a
 * UTC moment. So if the local timezone is IST and you ask for hour=16,
 * minute=22, dayOffset=0, you get the UTC instant that corresponds to
 * 4:22pm IST today (in IST).
 */
function dateInTimezone(
  now: Date,
  hour: number,
  minute: number,
  dayOffset = 0,
): Date {
  const offMin = tzOffsetMin();
  const offMs = offMin * 60 * 1000;

  // Shift `now` so that its UTC components reflect local-time components.
  const tzNow = new Date(now.getTime() + offMs);
  const y = tzNow.getUTCFullYear();
  const m = tzNow.getUTCMonth();
  const d = tzNow.getUTCDate();

  // Build "y-m-(d+offset) hour:minute" as if it were UTC, then translate
  // that "as-if-UTC" instant back to real UTC by subtracting the tz offset.
  const targetAsUtc = Date.UTC(y, m, d + dayOffset, hour, minute, 0);
  return new Date(targetAsUtc - offMs);
}

// --- Parser -------------------------------------------------------------

export function parseReminder(text: string, now: Date = new Date()): ParseResult {
  const original = text.trim();
  if (!original) {
    return {
      ok: false,
      reason:
        "Tell me what to remind you about. Try: 'Remind me to call James tomorrow at 3pm'.",
    };
  }

  let body = original
    .replace(/^remind\s+me\s+to\s+/i, "")
    .replace(/^remind\s+me\s+/i, "")
    .replace(/^remind\s+/i, "")
    .trim();

  let recurrence: Recurrence = "none";
  let weekday: number | undefined;

  // every <weekday>
  const wdMatch = body.match(
    new RegExp(`\\bevery\\s+(${WEEKDAYS.join("|")})\\b`, "i"),
  );
  if (wdMatch) {
    recurrence = "weekly";
    weekday = WEEKDAYS.indexOf(wdMatch[1].toLowerCase());
    body = body.replace(wdMatch[0], "").trim();
  } else if (/\bevery\s+day\b|\bdaily\b/i.test(body)) {
    recurrence = "daily";
    body = body.replace(/\bevery\s+day\b|\bdaily\b/i, "").trim();
  } else if (/\bevery\s+week\b|\bweekly\b/i.test(body)) {
    recurrence = "weekly";
    body = body.replace(/\bevery\s+week\b|\bweekly\b/i, "").trim();
  } else if (/\bevery\s+month\b|\bmonthly\b/i.test(body)) {
    recurrence = "monthly";
    body = body.replace(/\bevery\s+month\b|\bmonthly\b/i, "").trim();
  }

  let fireAt: Date | null = null;

  // "in N minutes/hours/days" — relative, timezone-agnostic.
  const inMatch = body.match(/\bin\s+(\d+)\s+(minute|min|hour|hr|day)s?\b/i);
  if (inMatch) {
    const n = parseInt(inMatch[1], 10);
    const unit = inMatch[2].toLowerCase();
    let ms = n * 60_000;
    if (unit.startsWith("hour") || unit.startsWith("hr")) ms = n * 3_600_000;
    if (unit.startsWith("day")) ms = n * 86_400_000;
    fireAt = new Date(now.getTime() + ms);
    body = body.replace(inMatch[0], "").trim();
  }

  // "tomorrow [at HH(:MM)?(am|pm)?]" — in user's timezone
  const tmrMatch = body.match(
    /\btomorrow\b(?:\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i,
  );
  if (!fireAt && tmrMatch) {
    if (tmrMatch[1]) {
      const t = parseTime(tmrMatch[1], tmrMatch[2], tmrMatch[3]);
      fireAt = dateInTimezone(now, t.h, t.m, 1);
    } else {
      fireAt = dateInTimezone(now, 9, 0, 1); // tomorrow 9am
    }
    body = body.replace(tmrMatch[0], "").trim();
  }

  // "today at HH..."
  const tdyMatch = body.match(
    /\btoday\b(?:\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i,
  );
  if (!fireAt && tdyMatch && tdyMatch[1]) {
    const t = parseTime(tdyMatch[1], tdyMatch[2], tdyMatch[3]);
    fireAt = dateInTimezone(now, t.h, t.m, 0);
    body = body.replace(tdyMatch[0], "").trim();
  }

  // "at HH(:MM)?(am|pm)?"
  const atMatch = body.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!fireAt && atMatch) {
    const t = parseTime(atMatch[1], atMatch[2], atMatch[3]);
    let candidate = dateInTimezone(now, t.h, t.m, 0);
    if (candidate <= now) candidate = dateInTimezone(now, t.h, t.m, 1);
    fireAt = candidate;
    body = body.replace(atMatch[0], "").trim();
  }

  // Weekly with explicit weekday: advance to that weekday (default 9am).
  if (recurrence === "weekly" && weekday !== undefined) {
    // If a time was already parsed, use that time-of-day; otherwise 9am.
    let h: number;
    let m: number;
    if (fireAt) {
      // Read back the time-of-day in the target timezone.
      const tzShifted = new Date(fireAt.getTime() + tzOffsetMin() * 60 * 1000);
      h = tzShifted.getUTCHours();
      m = tzShifted.getUTCMinutes();
    } else {
      h = 9;
      m = 0;
    }

    // Find the weekday of "now" in the target timezone.
    const tzNow = new Date(now.getTime() + tzOffsetMin() * 60 * 1000);
    const currentDay = tzNow.getUTCDay();
    let diff = (weekday - currentDay + 7) % 7;

    let candidate = dateInTimezone(now, h, m, diff);
    if (candidate <= now) {
      diff = diff === 0 ? 7 : diff;
      candidate = dateInTimezone(now, h, m, diff);
    }
    fireAt = candidate;
  }

  // Daily/monthly without an explicit time → 9am next slot.
  if ((recurrence === "daily" || recurrence === "monthly") && !fireAt) {
    let candidate = dateInTimezone(now, 9, 0, 0);
    if (candidate <= now) {
      if (recurrence === "daily") {
        candidate = dateInTimezone(now, 9, 0, 1);
      } else {
        // Approximate monthly by adding 30 days; the scheduler advances
        // properly on each fire via nextOccurrence().
        candidate = dateInTimezone(now, 9, 0, 30);
      }
    }
    fireAt = candidate;
  }

  // Default: 1 hour from now (timezone-agnostic).
  if (!fireAt) {
    fireAt = new Date(now.getTime() + 3_600_000);
  }

  body = body
    .replace(/^to\s+/i, "")
    .replace(/^that\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!body) {
    return {
      ok: false,
      reason:
        "I caught the time but not the task. Try: 'Remind me to call James tomorrow at 3pm'.",
    };
  }

  // Detect meeting intent ("meet with ashok", "google meet with ashok",
  // "zoom with ashok", "call with ashok", "1:1 with ashok", "sync with ashok").
  const meeting = detectMeetingIntent(body);

  return {
    ok: true,
    reminder: { task: body, fireAt, recurrence, weekday, meeting },
  };
}

function detectMeetingIntent(
  body: string,
): { attendee: string | null; summary: string } | undefined {
  const trigger =
    /\b(?:google\s+meet|gmeet|zoom|teams|meet|meeting|call|1:1|one\s+on\s+one|sync|catchup|catch\s+up)\s+with\s+([a-z][a-z0-9 .'_-]{0,30}?)\b/i;
  const triggerNoAttendee =
    /\b(?:google\s+meet|gmeet|zoom|teams|have\s+a\s+meet(?:ing)?|schedule\s+a\s+meet(?:ing)?)\b/i;

  const m = body.match(trigger);
  if (m) {
    const attendee = (m[1] || "").trim().replace(/\s+/g, " ") || null;
    return { attendee, summary: m[0].trim() };
  }
  if (triggerNoAttendee.test(body)) {
    return { attendee: null, summary: body };
  }
  return undefined;
}

function parseTime(
  hh: string,
  mm: string | undefined,
  ampm: string | undefined,
): { h: number; m: number } {
  let h = parseInt(hh, 10) % 24;
  const m = mm ? parseInt(mm, 10) : 0;
  if (ampm) {
    const isPm = ampm.toLowerCase() === "pm";
    if (h === 12) h = isPm ? 12 : 0;
    else if (isPm) h += 12;
  }
  return { h: Math.max(0, Math.min(23, h)), m: Math.max(0, Math.min(59, m)) };
}
