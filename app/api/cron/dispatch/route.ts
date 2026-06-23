import { NextRequest, NextResponse } from "next/server";
import {
  findDue,
  markSentOrReschedule,
  setLastFired,
  getQuietHours,
  getUserZone,
  getLastSeen,
} from "@/lib/store";
import { sendReminderMessage } from "@/lib/notify";
import { sendCloudButtons, sendCloudText } from "@/lib/whatsapp-cloud";
import { reminderFireMessage, friendReminderFireMessage } from "@/lib/messages";
import { nextOccurrence } from "@/lib/scheduler";
import { quietResume } from "@/lib/timezone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends every due reminder via Twilio WhatsApp and either advances
 * recurring reminders to their next occurrence or marks one-offs as sent.
 *
 * Auth: pass `Authorization: Bearer <CRON_SECRET>`.
 *
 * Trigger this every 1–5 minutes:
 *   - Vercel Cron: add an entry to vercel.json (see README)
 *   - Linux cron / supercronic / GitHub Actions: hit this URL
 *   - cron-job.org, easycron, etc.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  const due = await findDue();
  const results: Array<{
    id: string;
    status: "sent" | "error" | "deferred";
    error?: string;
  }> = [];

  for (const r of due) {
    try {
      // Friend-to-friend reminders fire to the recipient; otherwise the creator.
      const to = r.recipientPhone || r.userPhone;

      // Respect quiet hours — defer this firing until the window ends.
      const quiet = await getQuietHours(to);
      if (quiet) {
        const resume = quietResume(quiet, await getUserZone(to));
        if (resume) {
          await markSentOrReschedule(r.id, resume);
          results.push({ id: r.id, status: "deferred" });
          continue;
        }
      }

      const body = r.recipientPhone
        ? friendReminderFireMessage(r, r.recipientName)
        : reminderFireMessage(r);

      // Are we inside WhatsApp's 24h window (free-form allowed)? Use a 23h
      // cutoff for safety so we switch to a template before Meta would reject.
      const isWhatsApp = to.startsWith("whatsapp:");
      const lastSeen = isWhatsApp ? await getLastSeen(to) : null;
      const inWindow =
        !!lastSeen && Date.now() - lastSeen < 23 * 60 * 60 * 1000;

      if (isWhatsApp && inWindow && r.recurrence === "none") {
        // Inside the window — nice free-form message with tappable buttons.
        await sendCloudButtons(to, body, [
          { id: `done:${r.id}`, title: "✅ Done" },
          { id: `snooze1h:${r.id}`, title: "😴 Snooze 1h" },
          { id: `tomorrow:${r.id}`, title: "📅 Tomorrow" },
        ]);
      } else if (isWhatsApp && inWindow) {
        // Inside the window, recurring — free-form text (no buttons).
        await sendCloudText(to, body);
      } else {
        // Outside the window (or another channel) — reliable template / send.
        await sendReminderMessage(to, body, r.task);
      }
      // Let the recipient reply "done" / "snooze" without a number.
      await setLastFired(to, r.id);
      const next = nextOccurrence(r);
      await markSentOrReschedule(r.id, next);
      results.push({ id: r.id, status: "sent" });
    } catch (err) {
      console.error("[cron/dispatch] failed to send", r.id, err);
      results.push({
        id: r.id,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    due: due.length,
    sent: results.filter((r) => r.status === "sent").length,
    deferred: results.filter((r) => r.status === "deferred").length,
    errors: results.filter((r) => r.status === "error"),
  });
}
