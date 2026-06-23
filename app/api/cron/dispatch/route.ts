import { NextRequest, NextResponse } from "next/server";
import { findDue, markSentOrReschedule, setLastFired } from "@/lib/store";
import { sendReminderMessage } from "@/lib/notify";
import { sendCloudButtons } from "@/lib/whatsapp-cloud";
import { reminderFireMessage, friendReminderFireMessage } from "@/lib/messages";
import { nextOccurrence } from "@/lib/scheduler";

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
  const results: Array<{ id: string; status: "sent" | "error"; error?: string }> = [];

  for (const r of due) {
    try {
      // Friend-to-friend reminders fire to the recipient; otherwise the creator.
      const to = r.recipientPhone || r.userPhone;
      const body = r.recipientPhone
        ? friendReminderFireMessage(r, r.recipientName)
        : reminderFireMessage(r);

      // One-off WhatsApp reminders get tappable Done/Snooze buttons
      // (only inside the 24h window — i.e. when not using a template).
      if (
        to.startsWith("whatsapp:") &&
        r.recurrence === "none" &&
        !process.env.WHATSAPP_REMINDER_TEMPLATE
      ) {
        await sendCloudButtons(to, body, [
          { id: `done:${r.id}`, title: "✅ Done" },
          { id: `snooze1h:${r.id}`, title: "😴 Snooze 1h" },
          { id: `tomorrow:${r.id}`, title: "📅 Tomorrow" },
        ]);
      } else {
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
    errors: results.filter((r) => r.status === "error"),
  });
}
