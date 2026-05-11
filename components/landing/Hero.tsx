"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star, Play, Check, MessageCircle, Mic } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Mascot } from "@/components/ui/Mascot";
import { whatsappCTAUrl } from "@/lib/whatsapp";

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden pt-36 pb-24 sm:pt-44">
      {/* Background warm orbs */}
      <FloatingOrbs />

      <div className="container-x relative z-10">
        {/* Rating row */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2.5 text-[14px]"
        >
          <div className="flex items-center gap-0.5" aria-label="Rated 4.9 out of 5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className="fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
              />
            ))}
          </div>
          <span className="font-bold text-ink">4.9</span>
          <span className="h-3.5 w-px bg-ink/15" />
          <span className="text-ink/70">
            <span className="font-semibold text-ink">50k+</span> already
            stopped forgetting.
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-7 max-w-5xl text-center text-hero text-ink"
        >
          You weren’t built to{" "}
          <span className="relative inline-block">
            <span className="gradient-text">remember everything</span>
            <span
              aria-hidden
              className="absolute -inset-x-2 -bottom-1 h-1.5 rounded-full bg-gradient-warm opacity-70 blur-[3px]"
            />
          </span>
          .
          <br className="hidden sm:block" />
          Mnemo is.
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-7 max-w-2xl text-center text-[17px] leading-relaxed text-ink/70 sm:text-[18px]"
        >
          Set reminders, capture ideas, and stay in flow — across WhatsApp,
          Telegram, Email, and your web dashboard. One AI that never forgets.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <GradientButton
            href={whatsappCTAUrl(
              "Hi Mnemo! I'd like to try the free trial — let's start.",
            )}
            target="_blank"
            variant="primary"
            size="lg"
          >
            Try for Free on WhatsApp →
          </GradientButton>
          <GradientButton href="#how-it-works" variant="glass" size="lg">
            <Play size={15} className="fill-current" />
            Watch Demo
          </GradientButton>
        </motion.div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-center text-[13px] text-ink/55"
        >
          No credit card required · Cancel anytime · Setup in 2 minutes
        </motion.p>

        {/* Mockup pair */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 40 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-20 grid w-full max-w-5xl grid-cols-1 items-end gap-6 md:grid-cols-[1fr_320px] md:gap-10"
        >
          <BrowserMockup />
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingOrbs() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-[460px] w-[460px] rounded-full opacity-70 blur-[110px] animate-orb-drift"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.6), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-32 h-[520px] w-[520px] rounded-full opacity-60 blur-[130px] animate-orb-drift"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.55), transparent 60%)",
          animationDelay: "-7s",
        }}
      />

      {/* Decorative mascots */}
      <div className="pointer-events-none absolute left-[6%] top-[34%] hidden animate-float-slow lg:block">
        <Mascot variant="glasses" size={88} />
      </div>
      <div className="pointer-events-none absolute right-[5%] top-[28%] hidden animate-float-slower lg:block">
        <Mascot variant="goggles" size={104} hueShift={-12} />
      </div>
      <div className="pointer-events-none absolute right-[12%] top-[64%] hidden animate-float-fast lg:block">
        <Mascot variant="hat" size={64} />
      </div>
      <div className="pointer-events-none absolute left-[10%] bottom-[12%] hidden animate-float-slow xl:block">
        <Mascot variant="wink" size={72} />
      </div>
    </>
  );
}

function BrowserMockup() {
  return (
    <div className="group relative animate-float-slow">
      <div className="absolute -inset-6 rounded-3xl bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.25),transparent_65%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[0_30px_70px_-25px_rgba(120,53,15,0.35)]">
        <div className="flex items-center gap-2 border-b border-ink/8 bg-bg-tint px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 flex h-6 flex-1 items-center rounded-md border border-ink/8 bg-white px-3 text-[11px] text-ink/55">
            app.mnemo.ai/dashboard
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
      <div className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle_at_70%_30%,rgba(251,191,36,0.35),transparent_65%)] blur-2xl" />
      <div className="relative rounded-[36px] border border-ink/10 bg-ink p-2 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.35)]">
        <div className="relative h-[500px] overflow-hidden rounded-[28px] bg-bg-tint">
          <div className="flex items-center justify-between px-5 pt-3 text-[11px] text-ink/55">
            <span>9:41</span>
            <span>···</span>
          </div>
          <div className="mt-2 flex items-center gap-2 border-b border-ink/8 px-4 pb-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
              M
            </div>
            <div>
              <div className="text-[12px] font-semibold text-ink">Mnemo</div>
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
            Message Mnemo…
            <Mic size={12} className="ml-auto text-flame-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
