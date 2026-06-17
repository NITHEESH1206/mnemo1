import { NextRequest, NextResponse } from "next/server";
import {
  sendCloudText,
  verifyMetaSignature,
  getCloudMedia,
} from "@/lib/whatsapp-cloud";
import { transcribeBuffer } from "@/lib/transcribe";
import { extractReminderFromImage } from "@/lib/vision";
import { handleIncomingMessage } from "@/lib/handle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/whatsapp/webhook
 * Meta's one-time webhook verification handshake. Echoes hub.challenge
 * back when the verify token matches WHATSAPP_VERIFY_TOKEN.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("hub.mode");
  const token = sp.get("hub.verify_token");
  const challenge = sp.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Inbound messages from the WhatsApp Cloud API (JSON). We parse the message,
 * run it through the shared handler, and reply by calling the Graph API.
 */
export async function POST(req: NextRequest) {
  // Read the raw body so we can verify Meta's signature over the exact bytes.
  const raw = await req.text();
  if (!verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true }); // not JSON we understand
  }

  const value = data?.entry?.[0]?.changes?.[0]?.value;
  const msg = value?.messages?.[0];

  // Status callbacks (delivered/read) and other events have no `messages`.
  if (!msg) return NextResponse.json({ ok: true });

  const fromDigits: string = msg.from; // e.g. "919361092458"
  const from = `whatsapp:+${fromDigits}`;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`;

  let body = "";
  let echo: string | null = null;
  let echoLabel = "🎙️ heard you say";

  try {
    if (msg.type === "text") {
      body = (msg.text?.body || "").trim();
    } else if (msg.type === "audio" || msg.type === "voice") {
      const mediaId = msg.audio?.id || msg.voice?.id;
      const { buffer, contentType } = await getCloudMedia(mediaId);
      const text = await transcribeBuffer(buffer, contentType);
      if (text) {
        body = text;
        echo = text;
      } else {
        await sendCloudText(
          fromDigits,
          "couldn't hear that one. mind sending it as text or trying again?",
        );
        return NextResponse.json({ ok: true });
      }
    } else if (msg.type === "image") {
      const { buffer, contentType } = await getCloudMedia(msg.image?.id);
      const extracted = await extractReminderFromImage(buffer, contentType);
      if (extracted) {
        body = extracted;
        echo = extracted;
        echoLabel = "📸 from your image";
      } else {
        await sendCloudText(
          fromDigits,
          "i looked but couldn't find anything to remind you about in that image. try sending it as text?",
        );
        return NextResponse.json({ ok: true });
      }
    } else if (msg.type === "interactive") {
      // Button/list replies — use the selected title/id as the command.
      body = (
        msg.interactive?.button_reply?.title ||
        msg.interactive?.list_reply?.title ||
        msg.interactive?.button_reply?.id ||
        ""
      ).trim();
    } else {
      await sendCloudText(
        fromDigits,
        "i can handle text, voice notes, and screenshots — that type isn't supported yet.",
      );
      return NextResponse.json({ ok: true });
    }

    const reply = await handleIncomingMessage({ from, text: body, baseUrl });
    const full = echo ? `${echoLabel}: _${echo}_\n\n${reply}` : reply;
    await sendCloudText(fromDigits, full);
  } catch (err) {
    console.error("[whatsapp/webhook] error", err);
    try {
      await sendCloudText(
        fromDigits,
        "my brain glitched for a sec. try that again, or type *help*.",
      );
    } catch {
      /* swallow */
    }
  }

  return NextResponse.json({ ok: true });
}
