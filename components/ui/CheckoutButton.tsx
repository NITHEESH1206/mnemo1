"use client";

import { useState } from "react";
import { GradientButton } from "@/components/ui/GradientButton";
import { whatsappCTAUrl } from "@/lib/whatsapp";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function CheckoutButton({
  plan,
  billing,
  children,
  variant = "primary",
}: {
  plan: string;
  billing: "monthly" | "annual";
  children: React.ReactNode;
  variant?: "primary" | "ink";
}) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    try {
      setLoading(true);

      const ok = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js",
      );
      if (!ok || !window.Razorpay) {
        alert("Couldn't load the payment window. Check your connection and try again.");
        return;
      }

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Couldn't start checkout. Please try again.");
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "Mnemo",
        description: `${data.plan} plan · billed ${data.billing}`,
        theme: { color: "#f97316" },
        handler: async (resp: Record<string, string>) => {
          const v = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resp),
          });
          const vd = await v.json();
          if (vd.verified) {
            // Paid — send them to the activation page (shows the link code
            // + WhatsApp button to unlock the plan on their number).
            if (vd.linkToken) {
              window.location.href = `/activate?token=${encodeURIComponent(
                vd.linkToken,
              )}&plan=${encodeURIComponent(vd.plan || data.plan)}`;
            } else {
              window.location.href = whatsappCTAUrl(
                `Hi Mnemo! I just subscribed to the ${data.plan} plan.`,
              );
            }
          } else {
            alert(
              "We couldn't verify the payment. If money was deducted, it'll auto-refund or contact support.",
            );
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (e) {
      console.error("[checkout]", e);
      alert("Something went wrong starting checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientButton
      onClick={pay}
      disabled={loading}
      variant={variant}
      size="md"
      className="w-full justify-center"
    >
      {loading ? "Loading…" : children}
    </GradientButton>
  );
}
