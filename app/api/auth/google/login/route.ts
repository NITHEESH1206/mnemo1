import { NextResponse } from "next/server";
import { authUrlForLogin } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/google/login
 * Starts "Sign in with Google" for web login / signup.
 */
export async function GET() {
  try {
    return NextResponse.redirect(authUrlForLogin());
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Google sign-in not configured: ${msg}`, {
      status: 500,
    });
  }
}
