"use client";

import { useRef, useState } from "react";
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
  WA_CHAT_BG,
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
    user: "— 2:00 PM —",
    reply: "⏰ Time to drink water — stay hydrated 💧",
  },
];

export function LiveDemo() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(SCRIPT.length - 1, Math.max(0, Math.floor(v * SCRIPT.length)));
    setActive(idx);
  });

  const shown = reduced ? SCRIPT.length - 1 : active;

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative"
      style={{ height: reduced ? "auto" : "340vh" }}
    >
      <div
        className={
          reduced
            ? "section"
            : "sticky top-0 flex h-screen items-center overflow-hidden"
        }
      >
        <div className="ambient-warm opacity-50" aria-hidden />
        <div className="container-x relative z-10 grid items-center gap-12 md:grid-cols-2">
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
              {SCRIPT.map((s, i) => (
                <li key={s.label} className="flex items-center gap-3.5">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold transition-all duration-300 ${
                      i <= shown
                        ? "bg-gradient-primary text-white shadow-[0_6px_16px_-6px_rgba(234,88,12,0.6)]"
                        : "bg-ink/[0.06] text-ink/40"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-[15.5px] font-semibold transition-colors duration-300 ${
                      i <= shown ? "text-ink" : "text-ink/40"
                    }`}
                  >
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Pinned phone */}
          <div className="relative mx-auto w-[300px]">
            <div className="absolute -inset-8 rounded-[48px] bg-[radial-gradient(circle_at_60%_30%,rgba(249,115,22,0.28),transparent_65%)] blur-2xl" />
            <div className="relative rounded-[40px] border border-white/60 bg-ink p-2.5 shadow-[0_50px_100px_-30px_rgba(20,60,110,0.6)]">
              <div
                className="relative h-[560px] overflow-hidden rounded-[32px]"
                style={{ backgroundColor: WA_CHAT_BG }}
              >
                <WaHeader />

                {reduced ? (
                  <div className="flex flex-col gap-1.5 px-3 pt-3">
                    {SCRIPT.map((s) => (
                      <Exchange key={s.label} step={s} />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[360px] flex-col justify-start px-3 pt-3">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={shown}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col gap-1.5"
                      >
                        <Exchange step={SCRIPT[shown]} />
                      </motion.div>
                    </AnimatePresence>
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
