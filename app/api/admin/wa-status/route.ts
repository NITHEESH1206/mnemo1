import { NextRequest, NextResponse } from "next/server";
import { getLastWaStatus } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/wa-status?key=<ADMIN_KEY>
 * Returns the most recent WhatsApp delivery status callback Meta sent us —
 * including the error code/title when a message failed to deliver.
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const allowed = [process.env.ADMIN_KEY, process.env.CRON_SECRET].filter(
    Boolean,
  );
  if (!key || !allowed.includes(key)) {
    return new NextResponse("Unauthorized. Append ?key=<your ADMIN_KEY>", {
      status: 401,
    });
  }

  const last = await getLastWaStatus();
  return NextResponse.json({
    lastStatus: last ?? null,
    note: last
      ? "If status is 'failed', read errors[].code + title for the reason."
      : "No status callback received yet. Send a test, wait ~15s, then refresh.",
  });
}
