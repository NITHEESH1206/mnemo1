"use client";

import { useEffect, useState } from "react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Logo } from "@/components/ui/Logo";
import { whatsappCTAUrl } from "@/lib/whatsapp";

export default function ActivatePage() {
  const [token, setToken] = useState("");
  const [plan, setPlan] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setToken((p.get("token") || "").toUpperCase());
    setPlan(p.get("plan") || "your plan");
  }, []);

  const command = `link ${token}`;
  const waUrl = whatsappCTAUrl(command);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked — the code is visible anyway */
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-16">
      {/* sky backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg,#2a93e0 0%,#6fc0f5 45%,#bce5fd 75%,#fff8f0 100%)",
        }}
      />

      <div className="glass-strong w-full max-w-md rounded-[32px] p-8 text-center sm:p-10">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-[22px] text-white shadow-[0_0_24px_rgba(16,163,74,0.5)]">
          ✓
        </div>

        <h1 className="display-tight text-[26px] font-extrabold tracking-tight text-ink">
          Payment successful!
        </h1>
        <p className="mt-2 text-[15px] text-ink/70">
          Your <span className="font-bold text-ink">{plan}</span> plan is ready.
          Activate it on WhatsApp with this code:
        </p>

        {/* Code box */}
        <button
          onClick={copy}
          className="mt-6 flex w-full items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/80 px-5 py-4 text-left transition-colors hover:border-flame-300"
        >
          <span className="font-mono text-[18px] font-bold tracking-wider text-ink">
            {token ? command : "…"}
          </span>
          <span className="shrink-0 rounded-full bg-flame-100 px-3 py-1 text-[12px] font-bold text-flame-700">
            {copied ? "Copied!" : "Copy"}
          </span>
        </button>

        <div className="mt-6 flex flex-col gap-3">
          <GradientButton
            href={waUrl}
            target="_blank"
            variant="primary"
            size="lg"
            className="w-full justify-center"
          >
            Open WhatsApp & activate →
          </GradientButton>
          <a
            href="/dashboard"
            className="text-[13.5px] font-medium text-ink/55 hover:text-ink"
          >
            Skip to dashboard
          </a>
        </div>

        <p className="mt-6 text-[12.5px] leading-relaxed text-ink/55">
          On WhatsApp, send <span className="font-semibold">{command}</span> to
          Mnemo to unlock unlimited reminders on your number.
        </p>
      </div>
    </main>
  );
}
