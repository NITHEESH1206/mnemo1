/**
 * "Ask your memory" — answer natural-language questions grounded ONLY in the
 * user's own saved data (pending reminders + lists). Uses GPT-4o-mini when an
 * OpenAI key is present; otherwise falls back to a plain dump of what's saved.
 */
import OpenAI from "openai";
import { listForUser, allListNames, getList } from "./store";

let cached: OpenAI | null = null;
function openai(): OpenAI {
  if (cached) return cached;
  cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return cached;
}

function fmt(iso: string, zone: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Generate a short, warm, task-aware "it's time to…" line, used when the
 * reminder fires (e.g. "it's time to drink water — stay hydrated 💧").
 * Generated once at creation and stored, so firing costs nothing extra.
 */
export async function nudgeForTask(task: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return "";
  try {
    const out = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Reply with ONLY a 2-4 word warm encouragement tag for the task. No punctuation, no quotes, do NOT repeat the task, do NOT say \"it's time\". Examples: task 'drink water' -> stay hydrated; task 'workout' -> you've got this; task 'call mom' -> she'll love it.",
        },
        { role: "user", content: `Task: ${task}` },
      ],
    });
    return (out.choices[0]?.message?.content || "")
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/[.!]+$/, "")
      .slice(0, 40);
  } catch (e) {
    console.error("[memory] nudge failed", e);
    return "";
  }
}

/** Fetch a URL and return a short bullet summary (read-later). */
export async function summarizeUrl(url: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "it's saved to your reading list 📚 (add an AI key to get summaries).";
  }
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (FeruAI)" },
    });
    if (!res.ok) return "couldn't open that link — but it's saved to read later.";
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000);
    if (!text) return "that page had nothing readable — saved it to read later.";
    const out = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Summarize this web page in 3–4 short bullet points. Lowercase, friendly, no preamble.",
        },
        { role: "user", content: text },
      ],
    });
    const s = (out.choices[0]?.message?.content || "").trim();
    return s || "couldn't summarize that one — but it's saved to read later.";
  } catch (e) {
    console.error("[memory] summarize failed", e);
    return "couldn't fetch that link right now — it's saved to read later.";
  }
}

export async function answerMemoryQuery(
  addr: string,
  question: string,
  zone: string,
): Promise<string> {
  const [reminders, listNames] = await Promise.all([
    listForUser(addr),
    allListNames(addr),
  ]);
  const lists: Record<string, string[]> = {};
  for (const n of listNames) lists[n] = await getList(addr, n);

  const remText = reminders.length
    ? reminders
        .map(
          (r) =>
            `- ${r.task} — ${fmt(r.fireAt, zone)}${
              r.recurrence !== "none" ? ` (repeats ${r.recurrence})` : ""
            }`,
        )
        .join("\n")
    : "(none)";
  const listText = listNames.length
    ? listNames
        .map((n) => `${n}: ${lists[n].join(", ") || "(empty)"}`)
        .join("\n")
    : "(none)";

  // No AI key → simple, honest fallback.
  if (!process.env.OPENAI_API_KEY) {
    return reminders.length
      ? `here's what's coming up:\n\n${remText}`
      : 'nothing saved yet — try "remind me to…" or "add milk to my grocery list".';
  }

  const now = new Date().toLocaleString("en-US", { timeZone: zone });
  try {
    const res = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are Feru AI, a warm WhatsApp memory assistant. Answer the user's question using ONLY the saved data provided. " +
            `Be concise, friendly, lowercase, minimal emoji. Right now it is ${now} (${zone}); resolve relative dates like "today", "tomorrow", "this week" from that. ` +
            "If nothing matches, say so kindly. Never invent reminders or list items that aren't shown.",
        },
        {
          role: "user",
          content: `MY REMINDERS:\n${remText}\n\nMY LISTS:\n${listText}\n\nQUESTION: ${question}`,
        },
      ],
    });
    return (
      (res.choices[0]?.message?.content || "").trim() ||
      "hmm, i couldn't find anything for that."
    );
  } catch (e) {
    console.error("[memory] query failed", e);
    return reminders.length
      ? `here's what's coming up:\n\n${remText}`
      : "i couldn't check that right now — try again in a moment.";
  }
}
