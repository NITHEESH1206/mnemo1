import { NextRequest, NextResponse } from "next/server";
import { fetchOrder, verifyPaymentSignature } from "@/lib/razorpay";
import { recordSubscription } from "@/lib/store";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/razorpay/verify
 * body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * Confirms the payment signature is authentic. In production, this is where
 * you'd record the subscription / grant access for the paying user.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = (await req.json()) as Record<string, string>;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { verified: false, error: "Missing payment fields" },
        { status: 400 },
      );
    }

    const verified = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!verified) {
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    // Record the verified payment (best-effort — never block the user on it).
    try {
      const order = await fetchOrder(razorpay_order_id);
      const session = readSession(
        req.cookies.get(SESSION_COOKIE_NAME)?.value,
      );
      await recordSubscription({
        plan: order?.notes?.plan ?? "unknown",
        billing: order?.notes?.billing ?? "unknown",
        email: session?.email,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: order?.amount ?? 0,
        createdAt: new Date().toISOString(),
      });
    } catch (recErr) {
      console.error("[razorpay/verify] record failed", recErr);
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("[razorpay/verify]", msg);
    return NextResponse.json({ verified: false, error: msg }, { status: 500 });
  }
}
