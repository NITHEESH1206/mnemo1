import { NextRequest, NextResponse } from "next/server";
import { findDue, markSentOrReschedule } from "@/lib/store";
import { sendMessage } from "@/lib/notify";
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
      await sendMessage(to, body);
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
