import Twilio from "twilio";

/**
 * Lazy-initialised Twilio REST client. Throws a clear error if the
 * required env vars are missing — caught and reported by route handlers.
 */
let cached: ReturnType<typeof Twilio> | null = null;

function client() {
  if (cached) return cached;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error(
      "Missing Twilio credentials. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local",
    );
  }
  cached = Twilio(sid, token);
  return cached;
}

export async function sendWhatsApp(opts: {
  to: string; // "whatsapp:+15551234567"
  body: string;
}) {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) {
    throw new Error(
      "Missing TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886 for the sandbox)",
    );
  }
  return client().messages.create({
    from,
    to: opts.to,
    body: opts.body,
  });
}

/**
 * Validate that an inbound webhook actually came from Twilio.
 * Twilio signs the request body using your auth token.
 *
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
export function validateTwilioSignature(opts: {
  signature: string | null;
  url: string;
  params: Record<string, string>;
}): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return false;
  if (!opts.signature) return false;
  return Twilio.validateRequest(token, opts.signature, opts.url, opts.params);
}
