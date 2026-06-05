import { NextRequest, NextResponse } from "next/server";
import { buildICS } from "@/lib/ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ics?title=...&start=<ms|ISO>&dur=60&desc=...
 * Returns a downloadable .ics the user can add to any calendar.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const title = sp.get("title")?.trim() || "Reminder";
  const startRaw = sp.get("start") || "";
  const dur = parseInt(sp.get("dur") || "30", 10);
  const desc = sp.get("desc") || "Created by Feru AI";

  let startISO: string;
  const asNum = Number(startRaw);
  if (startRaw && !Number.isNaN(asNum)) {
    startISO = new Date(asNum).toISOString();
  } else if (startRaw) {
    const d = new Date(startRaw);
    startISO = Number.isNaN(d.getTime())
      ? new Date(Date.now() + 3_600_000).toISOString()
      : d.toISOString();
  } else {
    startISO = new Date(Date.now() + 3_600_000).toISOString();
  }

  const ics = buildICS({
    title,
    startISO,
    durationMinutes: Number.isNaN(dur) ? 30 : dur,
    description: desc,
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="feru-event.ics"',
    },
  });
}
