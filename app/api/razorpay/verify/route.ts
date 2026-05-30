import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";

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

    // TODO: mark this user as subscribed in your store here.
    return NextResponse.json({ verified: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("[razorpay/verify]", msg);
    return NextResponse.json({ verified: false, error: msg }, { status: 500 });
  }
}
