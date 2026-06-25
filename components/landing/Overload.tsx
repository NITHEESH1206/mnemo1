"use client";

import { motion } from "framer-motion";
import { Mascot } from "@/components/ui/Mascot";

type Bubble = { text: string; pos: string; rot: number; delay: number };

// Scattered worry bubbles — positioned for md+ screens (percent of the stage).
const BUBBLES: Bubble[] = [
  { text: "Too many mental lists", pos: "left-[2%] top-[6%]", rot: -4, delay: 0.05 },
  { text: "Everything slips your mind", pos: "left-[26%] top-[30%]", rot: 3, delay: 0.12 },
  { text: "Nothing’s under control", pos: "left-[44%] top-[2%]", rot: -2, delay: 0.18 },
  { text: "Past deadlines piling up", pos: "left-[58%] top-[26%]", rot: 5, delay: 0.24 },
  { text: "You forget the small things", pos: "left-[70%] top-[6%]", rot: -3, delay: 0.3 },
  { text: "Always a step behind", pos: "right-[2%] top-[40%]", rot: 4, delay: 0.36 },
];

export function Overload() {
  return (
    <section className="section relative overflow-hidden bg-white">
      <div className="ambient-warm opacity-60" aria-hidden />
      <div className="container-x relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-[20px] font-bold leading-snug text-ink sm:text-[24px]"
        >
          You’re juggling a hundred things at once.
          <br className="hidden sm:block" /> No brain was built to hold them all.
        </motion.p>

        {/* Stage — the big word sits in normal flow so the line below can
            never end up underneath it (the overlap bug on desktop). */}
        <div className="relative mx-auto mt-12 max-w-5xl sm:mt-16">
          {/* Mobile: simple wrapped pills */}
          <div className="mb-10 flex flex-wrap justify-center gap-2.5 md:hidden">
            {BUBBLES.slice(0, 4).map((b) => (
              <WorryPill key={b.text} text={b.text} rot={0} delay={b.delay} />
            ))}
          </div>

          {/* Desktop: scattered pills — decorative layer behind the word */}
          <div className="pointer-events-none absolute inset-0 z-0 hidden md:block" aria-hidden>
            {BUBBLES.map((b) => (
              <div key={b.text} className={`absolute ${b.pos}`}>
                <WorryPill text={b.text} rot={b.rot} delay={b.delay} />
              </div>
            ))}
          </div>

          {/* The big word — in flow, generous vertical padding for the pills */}
          <motion.h2
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="display-tight relative z-10 px-2 py-12 text-center text-[clamp(64px,14vw,168px)] leading-[0.9] text-ink sm:py-16"
          >
            Too much to hold<span className="text-flame-500">.</span>
          </motion.h2>

          {/* Sad mascot orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute right-[2%] top-[8%] z-0 hidden animate-float-slow lg:block"
          >
            <Mascot variant="wink" size={140} hueShift={-8} />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto mt-6 max-w-xl text-[17px] text-ink/60"
        >
          So we built a memory that never overflows — and lives right in your
          WhatsApp.
        </motion.p>
      </div>
    </section>
  );
}

function WorryPill({
  text,
  rot,
  delay,
}: {
  text: string;
  rot: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotate: `${rot}deg` }}
      className="inline-flex rounded-full border border-ink/8 bg-ink/[0.04] px-4 py-2 text-[13.5px] font-medium text-ink/55 shadow-[0_8px_20px_-12px_rgba(15,12,9,0.25)] backdrop-blur-sm"
    >
      {text}
    </motion.div>
  );
}
