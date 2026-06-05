import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { validateTwilioSignature } from "@/lib/twilio";
import { transcribeTwilioMedia, fetchTwilioMedia } from "@/lib/transcribe";
import { extractReminderFromImage } from "@/lib/vision";
import { handleIncomingMessage } from "@/lib/handle";

// Twilio sends application/x-www-form-urlencoded and we use Node APIs.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { MessagingResponse } = twilio.twiml;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => {
    params[k] = String(v);
  });

  // Validate the request is genuinely from Twilio.
  const skip = process.env.TWILIO_SKIP_VALIDATION === "true";
  if (!skip) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host") || req.nextUrl.host;
    const url = `${proto}://${host}${req.nextUrl.pathname}`;
    const ok = validateTwilioSignature({
      signature: req.headers.get("x-twilio-signature"),
      url,
      params,
    });
    if (!ok) return new NextResponse("Invalid Twilio signature", { status: 403 });
  }

  const from = params.From;
  if (!from) return new NextResponse("Missing From", { status: 400 });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`;

  // --- Voice note? transcribe first ----------------------------------
  let body = (params.Body || "").trim();
  let voiceEcho: string | null = null;
  let echoLabel = "🎙️ heard you say";
  const numMedia = parseInt(params.NumMedia || "0", 10);
  if (numMedia > 0) {
    const mediaType = (params.MediaContentType0 || "").toLowerCase();
    const mediaUrl = params.MediaUrl0;
    if (mediaUrl && mediaType.startsWith("audio/")) {
      try {
        const text = await transcribeTwilioMedia(mediaUrl);
        if (text) {
          body = text;
          voiceEcho = text;
        }
      } catch (e) {
        console.error("[whatsapp/webhook] transcription error", e);
        return twimlReply(
          "couldn't hear that one. mind sending it as text or trying again?",
        );
      }
    } else if (mediaUrl && mediaType.startsWith("image/")) {
      try {
        const { buffer, contentType } = await fetchTwilioMedia(mediaUrl);
        const extracted = await extractReminderFromImage(buffer, contentType);
        if (extracted) {
          body = extracted;
          voiceEcho = extracted;
          echoLabel = "📸 from your image";
        } else {
          return twimlReply(
            "i looked but couldn't find anything to remind you about in that image. try sending it as text?",
          );
        }
      } catch (e) {
        console.error("[whatsapp/webhook] vision error", e);
        return twimlReply(
          "couldn't read that image. mind sending it as text?",
        );
      }
    } else if (mediaUrl) {
      return twimlReply(
        "i can handle text, voice notes, and screenshots — that file type isn't supported yet.",
      );
    }
  }

  try {
    const reply = await handleIncomingMessage({ from, text: body, baseUrl });
    const full = voiceEcho ? `${echoLabel}: _${voiceEcho}_\n\n${reply}` : reply;
    return twimlReply(full);
  } catch (err) {
    console.error("[whatsapp/webhook] error", err);
    return twimlReply(
      "my brain glitched for a sec. try that again, or type *help*.",
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/whatsapp/webhook",
    method: "POST (Twilio inbound)",
  });
}

function twimlReply(message: string): NextResponse {
  const twiml = new MessagingResponse();
  twiml.message(message);
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
