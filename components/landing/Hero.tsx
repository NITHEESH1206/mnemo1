"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star, Play, Check, MessageCircle, Mic } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Mascot } from "@/components/ui/Mascot";

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden pt-36 pb-28 sm:pt-44">
      {/* ── Grass photo background ───────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/grass.jpg')" }}
        />
        {/* darken top for white headline readability, fade to cream at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-[#fff8f0]" />
      </div>

      {/* Floating mascot accents (warm orbs pop against the blue) */}
      <FloatingOrbs />

      <div className="container-x relative z-10">
        {/* Rating row — frosted glass pill on the sky */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2.5"
        >
          <span className="pill-glass">
            <span className="flex items-center gap-0.5" aria-label="Rated 4.9 of 5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </span>
            <span className="font-bold">4.9</span>
            <span className="opacity-60">· 50k+ minds freed</span>
          </span>
        </motion.div>

        {/* Headline — Satoshi, white on sky with a gradient pop */}
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 22 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="display-tight mx-auto mt-8 max-w-5xl text-center text-hero sky-text"
        >
          You weren’t built to{" "}
          <span className="relative inline-block">
            <span className="gradient-text-bright">remember everything</span>
            <span
              aria-hidden
              className="absolute -inset-x-2 -bottom-1 h-1.5 rounded-full bg-gradient-warm opacity-80 blur-[3px]"
            />
            <span aria-hidden>.</span>
          </span>
          <br className="hidden sm:block" />
          Feru AI is.
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mx-auto mt-7 max-w-2xl text-center text-[17px] font-medium leading-relaxed text-white/90 sm:text-[19px] [text-shadow:0_1px_18px_rgba(12,74,110,0.35)]"
        >
          Set reminders, capture ideas, and stay in flow — across WhatsApp,
          Telegram, Email, and your web dashboard. One AI that never forgets.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <GradientButton
            href="/api/auth/google/login?next=wa"
            variant="primary"
            size="lg"
          >
            Try for Free →
          </GradientButton>
          <GradientButton href="#how-it-works" variant="glass" size="lg">
            <Play size={15} className="fill-current" />
            Watch Demo
          </GradientButton>
        </motion.div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.48 }}
          className="mt-6 text-center text-[13px] font-medium text-white/75 [text-shadow:0_1px_12px_rgba(12,74,110,0.3)]"
        >
          Free forever · No credit card required · Cancel anytime
        </motion.p>

        {/* Floating glass showcase */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 44 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-20 w-full max-w-5xl"
        >
          {/* No frosted tray — the sky, clouds and animation stay fully visible */}
          <div className="relative grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_300px] md:gap-10">
            <BrowserMockup />
            <PhoneMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingOrbs() {
  return (
    <>
      {/* Decorative mascots — z-20 keeps them in front of the mockups */}
      <div className="pointer-events-none absolute left-[5%] top-[30%] z-20 hidden animate-float-slow lg:block">
        <Mascot variant="glasses" size={92} />
      </div>
      <div className="pointer-events-none absolute right-[4%] top-[24%] z-20 hidden animate-float-slower lg:block">
        <Mascot variant="goggles" size={108} hueShift={-12} />
      </div>
      <div className="pointer-events-none absolute right-[6%] top-[58%] z-20 hidden animate-float-fast lg:block">
        <Mascot variant="hat" size={70} />
      </div>
      <div className="pointer-events-none absolute left-[7%] bottom-[14%] z-20 hidden animate-float-slow xl:block">
        <Mascot variant="wink" size={78} />
      </div>
    </>
  );
}


function BrowserMockup() {
  return (
    <div className="group relative animate-float-slow">
      <div className="absolute -inset-6 rounded-3xl bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.4),transparent_65%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_40px_90px_-30px_rgba(20,60,110,0.5)]">
        <div className="flex items-center gap-2 border-b border-ink/8 bg-bg-tint px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 flex h-6 flex-1 items-center rounded-md border border-ink/8 bg-white px-3 text-[11px] text-ink/55">
            app.feru.ai/dashboard
          </div>
        </div>

        <div className="grid grid-cols-[180px_1fr] gap-0 p-5 text-left">
          <aside className="space-y-1 border-r border-ink/8 pr-4">
            {["Dashboard", "Reminders", "Calendar", "Channels"].map((l, i) => (
              <div
                key={l}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] ${
                  i === 0
                    ? "border-l-2 border-flame-500 bg-flame-100/60 text-flame-700 font-semibold"
                    : "text-ink/55"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                {l}
              </div>
            ))}
          </aside>
          <div className="pl-5">
            <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-ink/55">
              Today
            </div>
            <div className="space-y-2">
              {[
                { t: "Call James about the Q3 roadmap", time: "3:00 PM", done: false },
                { t: "Review brand guidelines", time: "4:30 PM", done: false },
                { t: "Pick up dry cleaning", time: "6:00 PM", done: true },
              ].map((r) => (
                <div
                  key={r.t}
                  className="flex items-center justify-between rounded-xl border border-ink/8 bg-bg-tint/50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-[5px] border ${
                        r.done
                          ? "border-flame-500 bg-flame-500"
                          : "border-ink/20 bg-white"
                      }`}
                    >
                      {r.done && <Check size={10} className="text-white" strokeWidth={3} />}
                    </span>
                    <span
                      className={`text-[12.5px] ${
                        r.done ? "text-ink/45 line-through" : "text-ink"
                      }`}
                    >
                      {r.t}
                    </span>
                  </div>
                  <span className="text-[11px] text-ink/55">{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] animate-float-slower">
      <div className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle_at_70%_30%,rgba(125,211,252,0.5),transparent_65%)] blur-2xl" />
      <div className="relative rounded-[36px] border border-white/60 bg-ink p-2 shadow-[0_40px_80px_-24px_rgba(20,60,110,0.55)]">
        <div className="relative h-[500px] overflow-hidden rounded-[28px] bg-bg-tint">
          <div className="flex items-center justify-between px-5 pt-3 text-[11px] text-ink/55">
            <span>9:41</span>
            <span>···</span>
          </div>
          <div className="mt-2 flex items-center gap-2 border-b border-ink/8 px-4 pb-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
              F
            </div>
            <div>
              <div className="text-[12px] font-semibold text-ink">Feru AI</div>
              <div className="text-[10px] text-emerald-600">online</div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 px-3 pt-4">
            <div className="self-end max-w-[80%] rounded-2xl rounded-br-md bg-gradient-primary px-3.5 py-2 text-[12px] text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]">
              Remind me to call James tomorrow at 3pm
            </div>
            <div className="self-start max-w-[85%] rounded-2xl rounded-bl-md border border-ink/8 bg-white px-3.5 py-2 text-[12px] text-ink">
              Got it. I’ll ping you at <b>3:00 PM tomorrow</b> on WhatsApp. ✅
            </div>
            <div className="self-end max-w-[80%] rounded-2xl rounded-br-md bg-gradient-primary px-3.5 py-2 text-[12px] text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]">
              And every Friday — standup prep at 9am
            </div>
            <div className="self-start max-w-[85%] rounded-2xl rounded-bl-md border border-ink/8 bg-white px-3.5 py-2 text-[12px] text-ink">
              Done. Recurring weekly · Fridays · 9:00 AM 🔁
            </div>
          </div>

          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 text-[11px] text-ink/55">
            <MessageCircle size={12} />
            Message Feru AI…
            <Mic size={12} className="ml-auto text-flame-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
