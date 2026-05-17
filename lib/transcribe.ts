/**
 * Voice-note transcription via OpenAI Whisper.
 *
 * Twilio sends voice notes as media URLs. We:
 *   1. Download the audio from Twilio (Basic auth with our Twilio creds).
 *   2. POST it to OpenAI Whisper for transcription.
 *   3. Return the recognized text (auto-detects language).
 *
 * Required env:
 *   OPENAI_API_KEY        (https://platform.openai.com/api-keys)
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 */

import OpenAI, { toFile } from "openai";

let cached: OpenAI | null = null;
function openai(): OpenAI {
  if (cached) return cached;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      "Missing OPENAI_API_KEY. Add it in Vercel env vars (or .env.local locally).",
    );
  }
  cached = new OpenAI({ apiKey: key });
  return cached;
}

/** Fetch audio bytes from a Twilio media URL (Basic auth required). */
async function fetchTwilioMedia(url: string): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error("Twilio credentials missing");
  }
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const res = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Twilio media fetch failed: ${res.status} ${res.statusText}`);
  }
  const contentType = res.headers.get("content-type") || "audio/ogg";
  const arrayBuffer = await res.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType };
}

/** Pick a sensible filename extension for Whisper based on content-type. */
function extFromContentType(contentType: string): string {
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("opus")) return "ogg";
  if (contentType.includes("mpeg") || contentType.includes("mp3")) return "mp3";
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("m4a")) return "m4a";
  if (contentType.includes("amr")) return "amr";
  if (contentType.includes("aac")) return "aac";
  return "ogg";
}

export async function transcribeTwilioMedia(
  mediaUrl: string,
): Promise<string> {
  const { buffer, contentType } = await fetchTwilioMedia(mediaUrl);
  const ext = extFromContentType(contentType);

  const file = await toFile(buffer, `voice.${ext}`, { type: contentType });

  const res = await openai().audio.transcriptions.create({
    file,
    model: "whisper-1",
    // omit `language` so Whisper auto-detects (supports Hindi, Tamil, etc.)
  });
  return (res.text || "").trim();
}
