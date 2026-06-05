/**
 * Builds the wa.me deep link used by every "Try for Free" CTA.
 *
 * NEXT_PUBLIC_WHATSAPP_NUMBER — the number to message (with or without +)
 * NEXT_PUBLIC_WHATSAPP_JOIN_CODE — if set, the prefilled text becomes
 *   "join <code>" (required for Twilio sandbox users). In production with
 *   your own WhatsApp Business number, leave this empty.
 *
 * These are NEXT_PUBLIC_* so they are inlined at build time — set them in
 * `.env.local` and rebuild after changes.
 */

const FALLBACK_NUMBER = "+14155238886"; // Twilio public WhatsApp sandbox

export function whatsappCTAUrl(prefilled?: string): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_NUMBER;
  const num = raw.replace(/\D/g, "");
  const joinCode = process.env.NEXT_PUBLIC_WHATSAPP_JOIN_CODE;
  const text = joinCode
    ? `join ${joinCode}`
    : prefilled || "Hi Feru AI! I'd like to get started.";
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

export function whatsappDisplayNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_NUMBER;
}
