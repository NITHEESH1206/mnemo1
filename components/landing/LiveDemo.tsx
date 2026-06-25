"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import {
  WaHeader,
  WaOut,
  WaIn,
  WaInputBar,
  WA_CHAT_STYLE,
} from "@/components/ui/WhatsAppChat";

type Step = { label: string; user: string; reply: string };

const SCRIPT: Step[] = [
  {
    label: "Just say it",
    user: "Remind me to call James tomorrow at 3pm",
    reply: "Great — I’ll remind you tomorrow at 3:00 PM to call James. ✅",
  },
  {
    label: "It repeats, smartly",
    user: "Standup prep every weekday at 9am",
    reply: "Done — every weekday (Mon–Fri) at 9:00 AM. 🔁",
  },
  {
    label: "Voice works too",
    user: "🎙️ add oat milk to my grocery list",
    reply: "Added 🥛 — your grocery list now has 4 items.",
  },
  {
    label: "It nudges you",
    user: "Remind me to drink water at 2pm",
    reply: "⏰ It’s 2:00 PM — time to drink water, stay hydrated 💧",
  },
];

export function LiveDemo() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Only scroll-scrub (pin) on desktop with motion enabled; otherwise stack.
  const pinned = desktop && !reduced;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!pinned) return;
    setActive(Math.min(SCRIPT.length - 1, Math.max(0, Math.floor(v * SCRIPT.length))));
  });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative"
      style={{ height: pinned ? "340vh" : undefined }}
    >
      <div
        className={
          pinned
            ? "sticky top-0 flex h-screen items-center overflow-hidden"
            : "section"
        }
      >
        <div className="ambient-warm opacity-50" aria-hidden />
        <div className="container-x relative z-10 grid items-center gap-10 md:grid-cols-2 md:gap-12">
          {/* Narrative + progress */}
          <div>
            <span className="pill">See it work</span>
            <h2 className="mt-5 text-h2 text-ink">
              One message.{" "}
              <span className="gradient-text">It’s handled.</span>
            </h2>
            <p className="mt-5 max-w-md text-[17px] text-ink/65">
              No new app to learn. Talk to Feru like you’d text a friend — it
              sets reminders, captures lists, and nudges you at exactly the right
              moment.
            </p>

            <ol className="mt-9 space-y-3.5">
              {SCRIPT.map((s, i) => {
                const lit = pinned ? i <= active : true;
                return (
                  <li key={s.label} className="flex items-center gap-3.5">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold transition-all duration-300 ${
                        lit
                          ? "bg-gradient-primary text-white shadow-[0_6px_16px_-6px_rgba(234,88,12,0.6)]"
                          : "bg-ink/[0.06] text-ink/40"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`text-[15.5px] font-semibold transition-colors duration-300 ${
                        lit ? "text-ink" : "text-ink/40"
                      }`}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Phone */}
          <div className="relative mx-auto w-[270px] sm:w-[300px]">
            <div className="absolute -inset-8 rounded-[48px] bg-[radial-gradient(circle_at_60%_30%,rgba(249,115,22,0.28),transparent_65%)] blur-2xl" />
            <div className="relative rounded-[40px] border border-white/60 bg-ink p-2.5 shadow-[0_50px_100px_-30px_rgba(20,60,110,0.6)]">
              <div
                className={`relative overflow-hidden rounded-[32px] ${
                  pinned ? "h-[560px]" : "min-h-[480px]"
                }`}
                style={WA_CHAT_STYLE}
              >
                <WaHeader />

                {pinned ? (
                  <div className="flex min-h-[360px] flex-col justify-start px-3 pt-3">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col gap-1.5"
                      >
                        <Exchange step={SCRIPT[active]} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 px-3 pb-20 pt-3">
                    {SCRIPT.map((s) => (
                      <Exchange key={s.label} step={s} />
                    ))}
                  </div>
                )}

                <WaInputBar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Exchange({ step }: { step: Step }) {
  return (
    <>
      <WaOut>{step.user}</WaOut>
      <WaIn>{step.reply}</WaIn>
    </>
  );
}
