/**
 * WhatsApp Cloud API (Meta) — direct, no Twilio.
 *
 * Required env:
 *   WHATSAPP_PHONE_NUMBER_ID   (from Meta → WhatsApp → API setup)
 *   WHATSAPP_ACCESS_TOKEN      (temporary token for testing, or a permanent System User token)
 *   WHATSAPP_VERIFY_TOKEN      (any random string — you set the same value in Meta's webhook config)
 *   WHATSAPP_APP_SECRET        (Meta app → Settings → Basic → App secret; used to verify webhooks)
 * Optional:
 *   WHATSAPP_GRAPH_VERSION     (defaults to v21.0)
 *   WHATSAPP_REMINDER_TEMPLATE (approved template name for reminders outside the 24h window)
 *   WHATSAPP_TEMPLATE_LANG     (defaults to "en")
 */

import crypto from "crypto";

function version(): string {
  return process.env.WHATSAPP_GRAPH_VERSION || "v21.0";
}

function token(): string {
  const t = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!t) throw new Error("Missing WHATSAPP_ACCESS_TOKEN");
  return t;
}

function phoneNumberId(): string {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!id) throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID");
  return id;
}

/** Strip a channel address ("whatsapp:+91…") or raw input down to digits. */
export function toDigits(addr: string): string {
  return (addr || "").replace(/\D/g, "");
}

async function graphSend(payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(
    `https://graph.facebook.com/${version()}/${phoneNumberId()}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
    },
  );
  if (!res.ok) {
    console.error("[whatsapp-cloud] send failed", res.status, await res.text());
  }
}

/** Free-form text (only delivers within the 24h customer-service window). */
export async function sendCloudText(to: string, body: string): Promise<void> {
  await graphSend({
    to: toDigits(to),
    type: "text",
    text: { preview_url: false, body },
  });
}

/** Template message (for business-initiated messages outside the 24h window). */
export async function sendCloudTemplate(
  to: string,
  name: string,
  lang: string,
  bodyParams: string[] = [],
): Promise<void> {
  await graphSend({
    to: toDigits(to),
    type: "template",
    template: {
      name,
      language: { code: lang },
      components: bodyParams.length
        ? [
            {
              type: "body",
              parameters: bodyParams.map((text) => ({ type: "text", text })),
            },
          ]
        : undefined,
    },
  });
}

/** Send a message with up to 3 tappable reply buttons (24h window only). */
export async function sendCloudButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[],
): Promise<void> {
  await graphSend({
    to: toDigits(to),
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  });
}

/** Verify the X-Hub-Signature-256 header against the raw request body. */
export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  // If no secret configured (e.g. early testing), skip verification.
  if (!secret) return true;
  if (!signatureHeader) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Download inbound media (audio/image) by its media id. */
export async function getCloudMedia(
  mediaId: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  // 1) resolve the media id → a short-lived download URL
  const metaRes = await fetch(
    `https://graph.facebook.com/${version()}/${mediaId}`,
    { headers: { Authorization: `Bearer ${token()}` } },
  );
  if (!metaRes.ok) {
    throw new Error(`media lookup failed: ${metaRes.status}`);
  }
  const meta = (await metaRes.json()) as { url?: string; mime_type?: string };
  if (!meta.url) throw new Error("media url missing");

  // 2) download the bytes (also needs the bearer token)
  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!fileRes.ok) {
    throw new Error(`media download failed: ${fileRes.status}`);
  }
  const contentType =
    meta.mime_type || fileRes.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await fileRes.arrayBuffer());
  return { buffer, contentType };
}
