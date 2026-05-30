import { NextRequest, NextResponse } from "next/server";
import { createOrder, razorpayKeyId } from "@/lib/razorpay";
import { PRICING } from "@/lib/constants";

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
    const { plan, billing } = (await req.json()) as {
      plan?: string;
      billing?: "monthly" | "annual";
    };

    const p = PRICING.find(
      (x) => x.name.toLowerCase() === String(plan).toLowerCase(),
    );
    if (!p) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
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
