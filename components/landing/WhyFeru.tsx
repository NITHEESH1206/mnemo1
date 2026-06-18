"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type Row = { feature: string; feru: boolean; others: boolean };

const ROWS: Row[] = [
  { feature: "Lives in WhatsApp — no new app to install", feru: true, others: false },
  { feature: "Capture by text, voice note, or screenshot", feru: true, others: false },
  { feature: "Understands natural language with AI", feru: true, others: false },
  { feature: "Reminds you where you actually look", feru: true, others: false },
  { feature: "WhatsApp · Telegram · Email · Web, in sync", feru: true, others: false },
  { feature: "Send reminders to friends & teammates", feru: true, others: false },
  { feature: "Auto-creates calendar events + Meet links", feru: true, others: false },
  { feature: "A friendly digest of your day, every morning", feru: true, others: false },
];

export function WhyFeru() {
  return (
    <section id="why" className="section relative overflow-hidden">
      <div className="ambient-warm" aria-hidden />
      <div className="container-x relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="pill">Why Feru AI</span>
          <h2 className="mt-5 text-h2 text-ink">
            Why people switch <span className="gradient-text">to Feru AI.</span>
          </h2>
          <p className="mt-5 text-[17px] text-ink/65">
            Other apps wait for you to open them. Feru AI lives where you already
            are — and captures anything you throw at it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="card-glass mx-auto mt-14 max-w-3xl overflow-hidden p-2 sm:p-3"
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_84px_84px] items-center gap-2 px-4 py-4 sm:grid-cols-[1fr_120px_120px] sm:px-6">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-ink/45">
              What you get
            </span>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1.5 text-[12px] font-extrabold text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.5)]">
                Feru AI
              </span>
            </div>
            <span className="text-center text-[12.5px] font-bold text-ink/45">
              Other apps
            </span>
          </div>

          {/* Rows */}
          <div className="space-y-1.5">
            {ROWS.map((r) => (
              <div
                key={r.feature}
                className="grid grid-cols-[1fr_84px_84px] items-center gap-2 rounded-2xl bg-white/40 px-4 py-3.5 sm:grid-cols-[1fr_120px_120px] sm:px-6"
              >
                <span className="text-[14px] font-medium leading-snug text-ink/85">
                  {r.feature}
                </span>
                <div className="flex justify-center">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary shadow-[0_4px_12px_-3px_rgba(249,115,22,0.5)]">
                    <Check size={15} className="text-white" strokeWidth={3} />
                  </span>
                </div>
                <div className="flex justify-center">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-ink/10 bg-ink/[0.04]">
                    <X size={14} className="text-ink/35" strokeWidth={2.6} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer brand strip */}
          <div className="mt-2 flex items-center justify-center gap-2 px-6 py-5">
            <Logo showText={false} />
            <span className="text-[13.5px] font-semibold text-ink/55">
              One memory, everywhere you work.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
