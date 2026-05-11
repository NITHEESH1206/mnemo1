"use client";

import { motion } from "framer-motion";
import { STATS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function Stats() {
  return (
    <section className="relative border-y border-ink/8 bg-gradient-dark py-20 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(251,191,36,0.18), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(249,115,22,0.18), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(251,146,60,0.7), transparent)",
        }}
      />

      <div className="container-x relative grid grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center"
          >
            <div className="text-[44px] font-extrabold tracking-tight sm:text-[52px]">
              <AnimatedCounter
                target={s.value}
                decimals={"decimals" in s ? (s as { decimals: number }).decimals : 0}
                suffix={s.suffix}
                className="gradient-text"
              />
            </div>
            <div className="mt-2 text-[12.5px] font-semibold uppercase tracking-[0.2em] text-white/55">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
