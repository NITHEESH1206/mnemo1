/**
 * Razorpay payment helpers (REST — no SDK dependency).
 *
 * Required env:
 *   RAZORPAY_KEY_ID       (rzp_test_... or rzp_live_...)
 *   RAZORPAY_KEY_SECRET   (kept server-side only)
 *
 * The key id is public by design (it's sent to the browser to open checkout);
 * the secret must never leave the server.
 */

import crypto from "crypto";

function creds() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) {
    throw new Error(
      "Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET. Add them in .env.local (locally) or Vercel env vars.",
    );
  }
  return { id, secret };
}

export function razorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || "";
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
};

/** Create an order. amountPaise is the charge in paise (₹1 = 100). */
export async function createOrder(
  amountPaise: number,
  receipt: string,
  notes?: Record<string, string>,
): Promise<RazorpayOrder> {
  const { id, secret } = creds();
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order failed: ${res.status} ${text}`);
  }
  return (await res.json()) as RazorpayOrder;
}

/**
 * Verify the signature Razorpay returns after a successful checkout.
 * signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 */
export function verifyPaymentSignature(opts: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { secret } = creds();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${opts.orderId}|${opts.paymentId}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(opts.signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
