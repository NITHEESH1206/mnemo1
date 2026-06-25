import { NextRequest, NextResponse } from "next/server";
import {
  findDue,
  markSentOrReschedule,
  scheduleFollowup,
  setLastFired,
  getQuietHours,
  getUserZone,
  getLastSeen,
} from "@/lib/store";
import { sendReminderMessage } from "@/lib/notify";
import { sendCloudButtons, sendCloudText } from "@/lib/whatsapp-cloud";
import {
  reminderFireMessage,
  friendReminderFireMessage,
  followUpMessage,
} from "@/lib/messages";
import { nextOccurrence } from "@/lib/scheduler";
import { quietResume } from "@/lib/timezone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Proactive follow-ups: re-ping an un-done one-off reminder a couple of times.
const FOLLOWUP_MAX = parseInt(process.env.FOLLOWUP_MAX || "2", 10);
const FOLLOWUP_GAP_MIN = parseInt(process.env.FOLLOWUP_GAP_MIN || "45", 10);

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

      // Self one-off reminders that haven't been marked done get a gentle
      // follow-up nudge ("still need to…?") on later firings.
      const fuCount = r.followupCount ?? 0;
      const isSelfOneOff = !r.recipientPhone && r.recurrence === "none";

      const body = r.recipientPhone
        ? friendReminderFireMessage(r, r.recipientName)
        : isSelfOneOff && fuCount > 0
          ? followUpMessage(r, fuCount)
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

      if (r.recurrence !== "none") {
        // Recurring → advance to the next occurrence.
        await markSentOrReschedule(r.id, nextOccurrence(r));
      } else if (isSelfOneOff && fuCount < FOLLOWUP_MAX) {
        // Not done yet → schedule a follow-up nudge (stays pending).
        await scheduleFollowup(
          r.id,
          new Date(Date.now() + FOLLOWUP_GAP_MIN * 60_000),
          fuCount + 1,
        );
      } else {
        // One-off with follow-ups exhausted (or a friend reminder) → done.
        await markSentOrReschedule(r.id, null);
      }
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
