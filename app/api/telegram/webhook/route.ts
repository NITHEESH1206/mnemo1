import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/handle";
import { sendTelegram, telegramFileUrl } from "@/lib/telegram";
import { transcribeFromUrl } from "@/lib/transcribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TgUpdate = {
  message?: {
    chat?: { id?: number };
    text?: string;
    voice?: { file_id?: string };
    audio?: { file_id?: string };
  };
};

export async function POST(req: NextRequest) {
  // Verify the request is from Telegram (secret echoed in this header).
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expected) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== expected) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true }); // ignore malformed updates
  }

  const chatId = update.message?.chat?.id;
  if (!chatId) return NextResponse.json({ ok: true });

  const from = `telegram:${chatId}`;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`;

  let text = update.message?.text?.trim() || "";
  let voiceEcho: string | null = null;

  // Voice / audio → transcribe via Whisper
  const fileId =
    update.message?.voice?.file_id || update.message?.audio?.file_id;
  if (!text && fileId) {
    try {
      const url = await telegramFileUrl(fileId);
      if (url) {
        text = await transcribeFromUrl(url);
        voiceEcho = text;
      }
    } catch (e) {
      console.error("[telegram/webhook] transcription error", e);
      await sendTelegram(
        chatId,
        "couldn't hear that one. mind sending it as text or trying again?",
      );
      return NextResponse.json({ ok: true });
    }
  }

  try {
    const reply = await handleIncomingMessage({ from, text, baseUrl });
    const full = voiceEcho ? `🎙️ heard you say: _${voiceEcho}_\n\n${reply}` : reply;
    await sendTelegram(chatId, full);
  } catch (err) {
    console.error("[telegram/webhook] error", err);
    await sendTelegram(
      chatId,
      "my brain glitched for a sec. try that again, or type *help*.",
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/telegram/webhook",
    method: "POST (Telegram update)",
  });
}
