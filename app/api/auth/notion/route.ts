import { NextRequest, NextResponse } from "next/server";
import { notionAuthUrl } from "@/lib/notion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/notion?phone=whatsapp:+91...
 * Redirects to Notion's consent screen.
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
    return NextResponse.redirect(notionAuthUrl(phone));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Notion OAuth not configured: ${msg}`, {
      status: 500,
    });
  }
}
