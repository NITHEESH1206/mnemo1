/**
 * Screenshot / image → reminder, using GPT-4o vision.
 * Returns a natural reminder sentence (to feed the parser) or null.
 */

import OpenAI from "openai";

let cached: OpenAI | null = null;
function openai(): OpenAI {
  if (cached) return cached;
  cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return cached;
}

const PROMPT =
  "This image is something a person wants to remember — a poster, ticket, bill, appointment card, or screenshot. " +
  "Extract ONE actionable reminder as a short natural sentence I can schedule, including any date, time, and amount you see — " +
  'e.g. "Pay electricity bill of 1200 by June 15 at 9am" or "Dentist appointment on Friday at 4pm". ' +
  'If there is nothing actionable, reply with exactly "NONE".';

async function runVision(dataUrl: string): Promise<string | null> {
  const res = await openai().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PROMPT },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  });
  const text = (res.choices[0]?.message?.content || "").trim();
  if (!text || /^none$/i.test(text)) return null;
  return text;
}

/** From a raw image buffer (e.g. downloaded from Twilio). */
export async function extractReminderFromImage(
  buffer: Buffer,
  contentType = "image/jpeg",
): Promise<string | null> {
  const dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
  return runVision(dataUrl);
}

/** From a public image URL (e.g. a Telegram file URL). */
export async function extractReminderFromImageUrl(
  url: string,
): Promise<string | null> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`image fetch failed: ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  return extractReminderFromImage(buffer, contentType);
}
