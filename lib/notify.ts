/**
 * Channel-agnostic outbound messaging.
 * Routes by the recipient's prefix:
 *   "whatsapp:+91..."  → Twilio WhatsApp
 *   "telegram:12345"   → Telegram Bot API
 */

import { sendWhatsApp } from "./twilio";
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
    await sendEmail(addr, "Your Mnemo reminder", body);
    return;
  }
  // Default to WhatsApp (handles "whatsapp:+..." addresses).
  await sendWhatsApp({ to, body });
}
