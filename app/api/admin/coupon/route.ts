import { NextRequest, NextResponse } from "next/server";
import { createCoupon, getCoupon } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authed(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get("key");
  const allowed = [process.env.ADMIN_KEY, process.env.CRON_SECRET].filter(
    Boolean,
  );
  return !!key && allowed.includes(key);
}

/**
 * GET /api/admin/coupon?key=<ADMIN_KEY>&code=FERU100&plan=pro&max=0
 *   Creates (or overwrites) a coupon. plan defaults to "pro",
 *   max defaults to 0 (= unlimited uses).
 *
 * GET /api/admin/coupon?key=<ADMIN_KEY>&check=FERU100
 *   Shows a coupon's status (uses / max).
 */
export async function GET(req: NextRequest) {
  if (!authed(req)) {
    return new NextResponse("Unauthorized. Append ?key=<ADMIN_KEY>.", {
      status: 401,
    });
  }

  const sp = req.nextUrl.searchParams;

  const check = sp.get("check");
  if (check) {
    const c = await getCoupon(check);
    if (!c) return NextResponse.json({ found: false, code: check });
    return NextResponse.json({
      found: true,
      code: c.code,
      plan: c.plan,
      uses: c.uses,
      maxUses: c.maxUses === 0 ? "unlimited" : c.maxUses,
    });
  }

  const code = (sp.get("code") || "").trim();
  const plan = (sp.get("plan") || "pro").trim().toLowerCase();
  const max = parseInt(sp.get("max") || "0", 10) || 0;

  if (!code) {
    return new NextResponse(
      "Add &code=YOURCODE (optional &plan=pro &max=100). plan defaults to pro; max 0 = unlimited.",
      { status: 400 },
    );
  }

  const c = await createCoupon(code, plan, max);
  return NextResponse.json({
    created: true,
    coupon: c.code,
    plan: c.plan,
    maxUses: c.maxUses === 0 ? "unlimited" : c.maxUses,
    howToRedeem: `Tell users to text "redeem ${c.code}" to Feru AI on WhatsApp — they'll get ${c.plan} for free.`,
  });
}
