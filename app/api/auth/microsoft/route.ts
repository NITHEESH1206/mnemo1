import { NextRequest, NextResponse } from "next/server";
import { msAuthUrl } from "@/lib/microsoft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/microsoft?phone=whatsapp:+91...
 * Redirects to the Microsoft consent screen for Outlook/Teams calendar.
 */
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) {
    return new NextResponse(
      "Missing `phone`. Open this link from your Mnemo chat.",
      { status: 400 },
    );
  }
  try {
    return NextResponse.redirect(msAuthUrl(phone));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Microsoft OAuth not configured: ${msg}`, {
      status: 500,
    });
  }
}
