"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { BrandLogo } from "@/components/ui/BrandLogo";

const WORKS_ON = ["WhatsApp", "Gmail", "Google Calendar", "Notion", "Outlook"];

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-[#0b0a12] pt-36 pb-24 sm:pt-44 sm:pb-28">
      {/* ── Background: warm dark + orange glows ───────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(110% 80% at 78% 4%, rgba(249,115,22,0.30), transparent 52%)," +
            "radial-gradient(90% 70% at 6% 96%, rgba(251,191,36,0.12), transparent 55%)," +
            "linear-gradient(180deg,#0c0b16 0%,#100d1c 55%,#0b0a12 100%)",
        }}
      />
      {/* faint star/grain dots */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.25) 0.5px, transparent 0.5px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(120% 80% at 70% 10%, black, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 70% 10%, black, transparent 70%)",
        }}
      />

      <div className="container-x relative z-10 grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ── Left: copy ───────────────────────────────────────── */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-white/75 backdrop-blur"
          >
            <span className="text-flame-400">✦</span>
            Your second brain — trusted to never forget
          </motion.div>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 text-[clamp(2.6rem,6.4vw,5.2rem)] font-extrabold leading-[1.0] tracking-[-0.03em] text-white"
          >
            You weren’t built
            <br />
            <span className="font-serif text-[0.96em] font-medium italic text-white/40">
              to remember everything.
            </span>
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-7 max-w-md text-[18px] leading-relaxed text-white/65 lg:mx-0"
          >
            That’s why we built Feru AI. So you don’t have to.
          </motion.p>

          {/* Works on */}
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start"
          >
            <span className="text-[13px] font-semibold uppercase tracking-wider text-white/45">
              Works on
            </span>
            <div className="flex items-center gap-2.5">
              {WORKS_ON.map((b) => (
                <span
                  key={b}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur"
                >
                  <BrandLogo name={b} size={20} />
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <GradientButton href="#pricing" variant="primary" size="lg">
              Get started →
            </GradientButton>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-[15px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/[0.12]"
            >
              <Play size={14} className="fill-current" />
              Watch demo
            </a>
          </motion.div>
        </div>

        {/* ── Right: glassy hero card ──────────────────────────── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94, y: 24 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[460px]"
        >
          {/* glowing orb */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-12 h-[150px] w-[150px] rounded-full blur-[6px]"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #ffe3c2, #fb923c 42%, #ea580c 72%, #9a3412)",
              boxShadow: "0 0 80px 10px rgba(249,115,22,0.45)",
            }}
            animate={reduced ? undefined : { y: [0, -16, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative overflow-hidden rounded-[34px] border border-white/15 bg-white/[0.04] p-3 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {/* inner warm-sky panel */}
            <div
              className="relative h-[320px] overflow-hidden rounded-[26px]"
              style={{
                background:
                  "linear-gradient(160deg,#ffd9a8 0%,#fcb874 45%,#fb923c 100%)",
              }}
            >
              <Cloud className="left-5 top-7 h-10 w-24" reduced={reduced} delay={0} />
              <Cloud className="right-6 top-16 h-8 w-20 opacity-80" reduced={reduced} delay={-2} />
              <Cloud className="left-10 bottom-10 h-9 w-24 opacity-90" reduced={reduced} delay={-4} />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="display-tight text-[64px] leading-none text-white drop-shadow-[0_6px_24px_rgba(154,52,18,0.45)]">
                    Saved.
                  </div>
                  <div className="mt-2 text-[14px] font-semibold text-white/85">
                    one message — never forgotten
                  </div>
                </div>
              </div>
            </div>

            {/* mini caption bar */}
            <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-white/[0.06] px-3.5 py-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-[12px] font-extrabold text-white">
                F
              </span>
              <span className="text-[13px] text-white/80">
                “remind me to call mom at 6pm”
              </span>
              <span className="ml-auto text-[13px] text-emerald-300">✓ done</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Cloud({
  className,
  reduced,
  delay,
}: {
  className: string;
  reduced: boolean | null;
  delay: number;
}) {
  return (
    <motion.div
      aria-hidden
      className={`absolute rounded-full bg-white blur-[2px] ${className}`}
      style={{
        boxShadow:
          "16px 6px 0 -2px rgba(255,255,255,0.95), -18px 8px 0 -4px rgba(255,255,255,0.9)",
      }}
      animate={reduced ? undefined : { x: [0, 10, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}
