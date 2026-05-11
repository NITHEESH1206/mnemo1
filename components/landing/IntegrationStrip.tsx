"use client";

import { motion } from "framer-motion";
import { INTEGRATIONS } from "@/lib/constants";
import { MarqueeStrip } from "@/components/ui/MarqueeStrip";

export function IntegrationStrip() {
  return (
    <section className="relative border-y border-ink/8 bg-white/60 backdrop-blur-md py-14">
      <div className="container-x">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center text-[12.5px] font-bold uppercase tracking-[0.22em] text-ink/55"
        >
          Works on the channels you already live in
        </motion.p>
        <MarqueeStrip items={INTEGRATIONS} />
      </div>
    </section>
  );
}
