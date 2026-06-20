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

        {/* Stage */}
        <div className="relative mx-auto mt-12 h-[420px] max-w-5xl sm:mt-16 sm:h-[480px]">
          {/* Mobile: simple wrapped pills */}
          <div className="flex flex-wrap justify-center gap-2.5 md:hidden">
            {BUBBLES.slice(0, 4).map((b) => (
              <WorryPill key={b.text} text={b.text} rot={0} delay={b.delay} />
            ))}
          </div>

          {/* Desktop: scattered pills */}
          {BUBBLES.map((b) => (
            <div key={b.text} className={`absolute hidden md:block ${b.pos}`}>
              <WorryPill text={b.text} rot={b.rot} delay={b.delay} />
            </div>
          ))}

          {/* The big word */}
          <motion.h2
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="display-tight pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(72px,17vw,210px)] leading-[0.9] text-ink"
          >
            Too much to hold<span className="text-flame-500">.</span>
          </motion.h2>

          {/* Sad mascot orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-[3%] top-[36%] hidden animate-float-slow lg:block"
          >
            <Mascot variant="wink" size={150} hueShift={-8} />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-4 max-w-xl text-[17px] text-ink/60"
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
