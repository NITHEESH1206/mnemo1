import { NextRequest, NextResponse } from "next/server";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/me — returns the signed-in user (from the session cookie), or
 * { loggedIn: false }. Used by the navbar to show the user's name.
 */
export async function GET(req: NextRequest) {
  const session = readSession(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session?.email) {
    return NextResponse.json({ loggedIn: false });
  }
  const local = session.email.split("@")[0];
  const name = local
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return NextResponse.json({
    loggedIn: true,
    email: session.email,
    name: name || session.email,
  });
}
