import { NextRequest, NextResponse } from "next/server";
import {
  allUsers,
  getUserZone,
  listForUser,
  markDigestSent,
  wasDigestSent,
} from "@/lib/store";
import { offsetForZone } from "@/lib/timezone";
import { sendMessage } from "@/lib/notify";
import { digestMessage } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/digest   (auth: Bearer CRON_SECRET)
 *
 * Run hourly. For each user whose local time is the digest hour (default 7am)
 * and who hasn't received today's digest yet, send a morning brief with the
 * reminders due in their local day.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected && req.headers.get("authorization") !== `Bearer ${expected}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const digestHour = parseInt(process.env.DIGEST_HOUR || "7", 10);
  const now = new Date();
  const users = await allUsers();
  let sent = 0;

  for (const addr of users) {
    try {
      const zone = await getUserZone(addr);
      const offMin = offsetForZone(zone) ?? 330;
      const local = new Date(now.getTime() + offMin * 60_000);
      const localHour = local.getUTCHours();
      if (localHour !== digestHour) continue;

      const ymd = `${local.getUTCFullYear()}${String(local.getUTCMonth() + 1).padStart(2, "0")}${String(local.getUTCDate()).padStart(2, "0")}`;
      if (await wasDigestSent(addr, ymd)) continue;

      // Reminders due within the user's local calendar day.
      const dayStart =
        Date.UTC(
          local.getUTCFullYear(),
          local.getUTCMonth(),
          local.getUTCDate(),
        ) - offMin * 60_000;
      const dayEnd = dayStart + 86_400_000;

      const todays = (await listForUser(addr)).filter((r) => {
        const t = new Date(r.fireAt).getTime();
        return t >= dayStart && t < dayEnd;
      });

      await sendMessage(addr, digestMessage(todays, zone));
      await markDigestSent(addr, ymd);
      sent++;
    } catch (e) {
      console.error("[cron/digest] failed for", addr, e);
    }
  }

  return NextResponse.json({
    checkedAt: now.toISOString(),
    users: users.length,
    sent,
  });
}
