import { NextRequest, NextResponse } from "next/server";
import { createOrder, razorpayKeyId } from "@/lib/razorpay";
import { PRICING } from "@/lib/constants";
import {
  applyCouponWeb,
  createLinkToken,
  recordSubscription,
} from "@/lib/store";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/razorpay/order
 * body: { plan: "Supernova" | "Big Bang", billing: "monthly" | "annual" }
 *
 * Creates a Razorpay order for the plan and returns what the browser needs
 * to open checkout. Amount is computed server-side so it can't be tampered.
 */
export async function POST(req: NextRequest) {
  try {
    const { plan, billing, coupon } = (await req.json()) as {
      plan?: string;
      billing?: "monthly" | "annual";
      coupon?: string;
    };

    const p = PRICING.find(
      (x) => x.name.toLowerCase() === String(plan).toLowerCase(),
    );
    if (!p) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    // Coupon → 100% off: skip payment, hand back an activation token for the
    // selected plan so the browser can jump straight to WhatsApp.
    if (coupon && coupon.trim()) {
      const result = await applyCouponWeb(coupon.trim());
      if (!result.ok) {
        return NextResponse.json(
          {
            error:
              result.reason === "exhausted"
                ? "That coupon has already been fully used."
                : "That coupon code isn't valid.",
          },
          { status: 400 },
        );
      }
      const session = readSession(
        req.cookies.get(SESSION_COOKIE_NAME)?.value,
      );
      const orderId = `coupon_${Date.now()}`;
      await recordSubscription({
        plan: p.name,
        billing: "coupon",
        email: session?.email,
        name: session?.name,
        orderId,
        paymentId: "coupon",
        amount: 0,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
      const linkToken = await createLinkToken(p.name, session?.email);
      return NextResponse.json({
        freeUnlock: true,
        linkToken,
        plan: p.name,
        billing: billing ?? "monthly",
      });
    }

    const perMonth = billing === "annual" ? p.annual : p.monthly;
    if (perMonth <= 0) {
      return NextResponse.json(
        { error: "The Free plan doesn't require payment." },
        { status: 400 },
      );
    }

    // Annual is billed up front (12 × discounted monthly), monthly is one month.
    const amountRupees = billing === "annual" ? perMonth * 12 : perMonth;

    const order = await createOrder(
      amountRupees * 100,
      `mnemo_${p.name}_${Date.now()}`,
      { plan: p.name, billing: billing ?? "monthly" },
    );

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId(),
      plan: p.name,
      billing: billing ?? "monthly",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Order creation failed";
    console.error("[razorpay/order]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
