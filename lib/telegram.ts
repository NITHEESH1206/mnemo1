/**
 * Telegram Bot API helpers.
 *
 * Required env:
 *   TELEGRAM_BOT_TOKEN     (from @BotFather)
 *   TELEGRAM_WEBHOOK_SECRET (any random string; Telegram echoes it in a header)
 */

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("Missing TELEGRAM_BOT_TOKEN");
  return t;
}

const api = (method: string) =>
  `https://api.telegram.org/bot${token()}/${method}`;

/** Send a message. Telegram supports a subset of Markdown via parse_mode. */
export async function sendTelegram(
  chatId: string | number,
  text: string,
): Promise<void> {
  const res = await fetch(api("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    console.error("[telegram] sendMessage failed", res.status, await res.text());
  }
}

/** Resolve a Telegram file_id to a temporary download URL. */
export async function telegramFileUrl(fileId: string): Promise<string | null> {
  const res = await fetch(
    `${api("getFile")}?file_id=${encodeURIComponent(fileId)}`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    ok: boolean;
    result?: { file_path?: string };
  };
  const path = data.result?.file_path;
  if (!path) return null;
  return `https://api.telegram.org/file/bot${token()}/${path}`;
}
