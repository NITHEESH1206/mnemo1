import { NextRequest, NextResponse } from "next/server";
import { authUrlForLogin } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/google/login[?next=wa]
 * Starts "Sign in with Google" for web login / signup.
 * `next=wa` → after sign-in, go to WhatsApp (the "Try for Free" funnel).
 */
export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next") === "wa" ? "wa" : undefined;
  try {
    return NextResponse.redirect(authUrlForLogin(next));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Google sign-in not configured: ${msg}`, {
      status: 500,
    });
  }
}
