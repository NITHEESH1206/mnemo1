import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { parseReminder } from "@/lib/parser";
import {
  addContact,
  cancelReminderForUser,
  createReminder,
  findContact,
  getContacts,
  listForUser,
  removeContact,
} from "@/lib/store";
import {
  badAddMessage,
  cancelledMessage,
  confirmationMessage,
  connectGoogleMessage,
  contactAddedMessage,
  contactForgottenMessage,
  contactNotFoundMessage,
  contactsListMessage,
  disconnectedGoogleMessage,
  friendConfirmationMessage,
  helpMessage,
  listMessage,
  meetingConfirmationMessage,
  meetingNeedsConnectMessage,
  needContactMessage,
  notFoundMessage,
  welcomeMessage,
} from "@/lib/messages";
import { validateTwilioSignature } from "@/lib/twilio";
import {
  authedClientFor,
  clearTokens,
  createCalendarEvent,
  getTokens,
} from "@/lib/google";
import { transcribeTwilioMedia } from "@/lib/transcribe";

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

  const from = params.From;
  if (!from) return new NextResponse("Missing From", { status: 400 });

  // --- Voice note? transcribe first, then route as if it were text -----
  let body = (params.Body || "").trim();
  let voiceEcho: string | null = null;
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
        const twimlErr = new MessagingResponse();
        twimlErr.message(
          "couldn't hear that one. mind sending it as text or trying again?",
        );
        return twimlResponse(twimlErr);
      }
    } else if (mediaUrl) {
      // Non-audio media (image, video, etc.) — politely punt for now.
      const twimlPunt = new MessagingResponse();
      twimlPunt.message(
        "i can only handle text and voice right now — image/screenshot smarts are coming soon.",
      );
      return twimlResponse(twimlPunt);
    }
  }

  const twiml = new MessagingResponse();
  if (voiceEcho) {
    twiml.message(`🎙️ heard you say: _${voiceEcho}_`);
  }
  const lower = body.toLowerCase();

  try {
    // --- Quick commands -------------------------------------------------
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

    // --- Contacts (for friend-to-friend reminders) ----------------------
    if (/^(contacts|people)\b/.test(lower)) {
      const contacts = await getContacts(from);
      twiml.message(contactsListMessage(contacts));
      return twimlResponse(twiml);
    }
    const addMatch = body.match(
      /^add\s+([a-z][a-z'.\- ]*?)\s+(\+?\d[\d\s-]{6,})\s*$/i,
    );
    if (/^add\b/i.test(lower)) {
      if (!addMatch) {
        twiml.message(badAddMessage());
        return twimlResponse(twiml);
      }
      const name = addMatch[1].trim();
      const digits = addMatch[2].replace(/[^\d+]/g, "");
      const e164 = digits.startsWith("+") ? digits : `+${digits}`;
      await addContact(from, name, `whatsapp:${e164}`);
      twiml.message(contactAddedMessage(name, e164));
      return twimlResponse(twiml);
    }
    const forgetMatch = body.match(/^forget\s+([a-z][a-z'.\- ]*?)\s*$/i);
    if (forgetMatch) {
      const name = forgetMatch[1].trim();
      const ok = await removeContact(from, name);
      twiml.message(
        ok ? contactForgottenMessage(name) : contactNotFoundMessage(name),
      );
      return twimlResponse(twiml);
    }

    // --- Google integration commands ------------------------------------
    if (/^connect\s+google\b/.test(lower) || /^connect\s+gcal\b/.test(lower)) {
      const base =
        process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
        `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`;
      const link = `${base}/api/auth/google?phone=${encodeURIComponent(from)}`;
      twiml.message(connectGoogleMessage(link));
      return twimlResponse(twiml);
    }
    if (/^disconnect\s+google\b/.test(lower)) {
      await clearTokens(from);
      twiml.message(disconnectedGoogleMessage());
      return twimlResponse(twiml);
    }

    // --- Natural-language reminder / meeting ---------------------------
    const parsed = parseReminder(body);
    if (!parsed.ok) {
      twiml.message(parsed.reason);
      return twimlResponse(twiml);
    }
    const r = parsed.reminder;

    // Friend-to-friend: "remind <name> to <task> at <time>"
    if (r.recipientName) {
      const contactPhone = await findContact(from, r.recipientName);
      if (!contactPhone) {
        twiml.message(needContactMessage(r.recipientName));
        return twimlResponse(twiml);
      }
      const friendReminder = await createReminder({
        userPhone: from,
        task: r.task,
        fireAt: r.fireAt,
        recurrence: r.recurrence,
        weekday: r.weekday,
        recipientPhone: contactPhone,
        recipientName: r.recipientName,
      });
      twiml.message(friendConfirmationMessage(friendReminder, r.recipientName));
      return twimlResponse(twiml);
    }

    // Always store a Mnemo reminder so we ping the user at fire time.
    const created = await createReminder({
      userPhone: from,
      task: r.task,
      fireAt: r.fireAt,
      recurrence: r.recurrence,
      weekday: r.weekday,
    });

    // If it's a meeting, also try to create a Google Calendar event.
    if (r.meeting) {
      const tokens = await getTokens(from);
      if (!tokens) {
        const base =
          process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
          `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`;
        const link = `${base}/api/auth/google?phone=${encodeURIComponent(from)}`;
        twiml.message(meetingNeedsConnectMessage(created, link));
        return twimlResponse(twiml);
      }

      try {
        const auth = await authedClientFor(from);
        if (!auth) throw new Error("not_connected");
        const summary = capitalize(r.meeting.summary || r.task);
        const event = await createCalendarEvent(from, {
          summary,
          description: `Created from WhatsApp by Mnemo.`,
          startISO: r.fireAt.toISOString(),
          durationMinutes: 60,
        });
        twiml.message(meetingConfirmationMessage(created, event.meetLink, event.htmlLink));
        return twimlResponse(twiml);
      } catch (calErr) {
        console.error("[whatsapp/webhook] calendar error", calErr);
        // Fall through to a normal confirmation — the reminder is still saved.
        twiml.message(
          confirmationMessage(created) +
            "\n\n(couldn't reach google calendar this time — reminder is still set.)",
        );
        return twimlResponse(twiml);
      }
    }

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

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}
