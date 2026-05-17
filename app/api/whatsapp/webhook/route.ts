import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { parseReminder } from "@/lib/parser";
import {
  cancelReminderForUser,
  createReminder,
  listForUser,
} from "@/lib/store";
import {
  cancelledMessage,
  confirmationMessage,
  helpMessage,
  listMessage,
  notFoundMessage,
  welcomeMessage,
} from "@/lib/messages";
import { validateTwilioSignature } from "@/lib/twilio";

// Twilio sends application/x-www-form-urlencoded and we use Node APIs.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { MessagingResponse } = twilio.twiml;

export async function POST(req: NextRequest) {
  // ---- 1. Parse form body ----
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => {
    params[k] = String(v);
  });

  // ---- 2. Validate signature (skip in dev if TWILIO_SKIP_VALIDATION=true) ----
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
    if (!ok) {
      return new NextResponse("Invalid Twilio signature", { status: 403 });
    }
  }

  const from = params.From; // "whatsapp:+15551234567"
  const body = (params.Body || "").trim();

  if (!from) {
    return new NextResponse("Missing From", { status: 400 });
  }

  const twiml = new MessagingResponse();
  const lower = body.toLowerCase();

  // ---- 3. Command routing ----
  try {
    if (!body || /^(hi|hello|hey|start|menu)\b/.test(lower)) {
      twiml.message(welcomeMessage());
      return twimlResponse(twiml);
    }

    if (/^help\b/.test(lower)) {
      twiml.message(helpMessage());
      return twimlResponse(twiml);
    }

    if (/^(list|reminders|show)\b/.test(lower)) {
      const items = await listForUser(from);
      twiml.message(listMessage(items));
      return twimlResponse(twiml);
    }

    const cancelMatch = lower.match(/^(?:cancel|delete|remove)\s+(\d+)\b/);
    if (cancelMatch) {
      const n = parseInt(cancelMatch[1], 10);
      const cancelled = await cancelReminderForUser(from, n);
      twiml.message(cancelled ? cancelledMessage(cancelled) : notFoundMessage());
      return twimlResponse(twiml);
    }

    // ---- 4. Fall through to natural-language reminder parsing ----
    const parsed = parseReminder(body);
    if (!parsed.ok) {
      twiml.message(parsed.reason);
      return twimlResponse(twiml);
    }

    const created = await createReminder({
      userPhone: from,
      task: parsed.reminder.task,
      fireAt: parsed.reminder.fireAt,
      recurrence: parsed.reminder.recurrence,
      weekday: parsed.reminder.weekday,
    });

    twiml.message(confirmationMessage(created));
    return twimlResponse(twiml);
  } catch (err) {
    console.error("[whatsapp/webhook] error", err);
    twiml.message(
      "my brain glitched for a sec. try that again, or type *help*.",
    );
    return twimlResponse(twiml);
  }
}

// GET is only useful for a quick liveness check from the browser.
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/whatsapp/webhook",
    method: "POST (Twilio inbound)",
  });
}

function twimlResponse(twiml: InstanceType<typeof MessagingResponse>) {
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
