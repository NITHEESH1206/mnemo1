"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";

type Persona = { tab: string; user: string; reply: string };

const PERSONAS: Persona[] = [
  {
    tab: "Founder",
    user: "Remind me to follow up with the Series A investor tomorrow at 9 AM",
    reply: "Done. Follow up: Series A investor — tomorrow, 9:00 AM. ✅",
  },
  {
    tab: "Creative",
    user: "Save this idea: a podcast about everyday design",
    reply: "Saved to your ideas 🎨 — I’ll resurface it when you ask.",
  },
  {
    tab: "ADHD",
    user: "Remind me to take my meds every day at 8am",
    reply: "Set — every day at 8:00 AM. I’ll nudge until you tap done. 💊",
  },
  {
    tab: "Parent",
    user: "Remind me about Maya’s recital on Friday at 5pm",
    reply: "Got it — Friday, 5:00 PM. 🎭",
  },
  {
    tab: "Student",
    user: "Remind me to submit the assignment tonight at 11",
    reply: "Set for 11:00 PM tonight. 📚",
  },
  {
    tab: "Freelancer",
    user: "Remind me to send the invoice to Acme on the 1st",
    reply: "Recurring — the 1st of every month. 🧾",
  },
  {
    tab: "Caregiver",
    user: "Remind dad to take his evening walk at 6",
    reply: "I’ll nudge him at 6:00 PM every day. 🚶",
  },
];

const WORKS_ON = ["WhatsApp", "Gmail", "Google Calendar", "Notion"];

export function EveryBrain() {
  const [active, setActive] = useState(0);
  const p = PERSONAS[active];

  return (
    <section className="section relative overflow-hidden">
      <div className="ambient-warm opacity-60" aria-hidden />
      <div className="container-x relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-h2 text-center text-ink"
        >
          Built for every kind of <span className="gradient-text">brain.</span>
        </motion.h2>

        {/* persona tabs */}
        <div className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-2.5">
          {PERSONAS.map((persona, i) => (
            <button
              key={persona.tab}
              onClick={() => setActive(i)}
              className={
                i === active
                  ? "rounded-full bg-gradient-primary px-4 py-2 text-[14px] font-bold text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.55)]"
                  : "rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-[14px] font-semibold text-ink/65 transition-colors hover:text-ink"
              }
            >
              {persona.tab}
            </button>
          ))}
        </div>

        {/* example card */}
        <div className="relative mx-auto mt-12 max-w-2xl">
          <div className="card-glass rounded-[28px] p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-3"
              >
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-gradient-primary px-4 py-3 text-[14.5px] font-medium leading-snug text-white shadow-[0_8px_20px_-8px_rgba(249,115,22,0.5)]">
                  {p.user}
                </div>
                <div className="mr-auto max-w-[88%] rounded-2xl rounded-bl-md border border-ink/8 bg-white px-4 py-3 text-[14.5px] leading-snug text-ink/85 shadow-[0_8px_22px_-12px_rgba(15,12,9,0.2)]">
                  <span className="mb-1 block text-[10.5px] font-bold uppercase tracking-[0.12em] text-flame-700">
                    Feru AI
                  </span>
                  {p.reply}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="text-[12.5px] font-semibold uppercase tracking-wider text-ink/45">
              Works on
            </span>
            <div className="flex items-center gap-2.5">
              {WORKS_ON.map((b) => (
                <span
                  key={b}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-ink/8 bg-white/70 shadow-sm"
                >
                  <BrandLogo name={b} size={19} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
