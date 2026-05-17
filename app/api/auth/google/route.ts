import { NextRequest, NextResponse } from "next/server";
import { authUrl } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/google?phone=whatsapp:+91xxxxxxxxxx
 *
 * Redirects the user to Google's OAuth consent screen. The user's WhatsApp
 * phone is signed into the `state` param so the callback knows whose tokens
 * to save.
 */
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone || !phone.startsWith("whatsapp:")) {
    return new NextResponse(
      "Missing or invalid `phone` query parameter. Open this URL from your WhatsApp message.",
      { status: 400 },
    );
  }
  try {
    const url = authUrl(phone);
    return NextResponse.redirect(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Google OAuth not configured: ${msg}`, {
      status: 500,
    });
  }
}
