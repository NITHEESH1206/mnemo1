/**
 * Channel-agnostic outbound messaging.
 * Routes by the recipient's prefix:
 *   "whatsapp:+91..."  → WhatsApp Cloud API (Meta)
 *   "telegram:12345"   → Telegram Bot API
 *   "email:a@b.com"    → Resend
 */

import { sendCloudText, sendCloudTemplate } from "./whatsapp-cloud";
import { sendTelegram } from "./telegram";
import { sendEmail } from "./email";

export async function sendMessage(to: string, body: string): Promise<void> {
  if (to.startsWith("telegram:")) {
    const chatId = to.slice("telegram:".length);
    await sendTelegram(chatId, body);
    return;
  }
  if (to.startsWith("email:")) {
    const addr = to.slice("email:".length);
    await sendEmail(addr, "Your Feru AI reminder", body);
    return;
  }
  // Default to WhatsApp (handles "whatsapp:+..." addresses).
  await sendCloudText(to, body);
}

/**
 * Deliver a proactive reminder. On WhatsApp, business-initiated messages sent
 * outside the 24-hour customer-service window must use an approved template.
 * If WHATSAPP_REMINDER_TEMPLATE is set, we send via that template (passing the
 * task text as the body variable); otherwise we fall back to free-form text
 * (which only delivers if the user messaged us within the last 24h).
 *
 * `body` is the fully-rendered free-form message; `task` is the bare task text
 * used as the template's {{1}} variable.
 */
export async function sendReminderMessage(
  to: string,
  body: string,
  task: string,
): Promise<void> {
  if (to.startsWith("whatsapp:")) {
    const template = process.env.WHATSAPP_REMINDER_TEMPLATE;
    if (template) {
      const lang = process.env.WHATSAPP_TEMPLATE_LANG || "en";
      await sendCloudTemplate(to, template, lang, [task]);
      return;
    }
    await sendCloudText(to, body);
    return;
  }
  await sendMessage(to, body);
}
