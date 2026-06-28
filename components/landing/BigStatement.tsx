"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { GradientButton } from "@/components/ui/GradientButton";

export function BigStatement() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Sweep in from the right → settle dead-centre by 40% → hold centred while
  // you keep scrolling, then the pin releases into the next section.
  const x = useTransform(scrollYProgress, [0, 0.4], ["50vw", "0vw"]);
  // Keep it on ONE line at all sizes; once centred, zoom out so the whole
  // sentence (first + last word) comes fully into view — including on mobile.
  const scale = useTransform(scrollYProgress, [0.4, 0.62], [1.18, 0.7]);
  const glow = useTransform(scrollYProgress, [0, 0.4, 1], [0.25, 0.7, 0.55]);
  const subO = useTransform(scrollYProgress, [0.5, 0.68], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.5, 0.68], [36, 0]);

  if (reduced) {
    return (
      <section className="section bg-gradient-dark text-center text-white">
        <div className="container-x">
          <h2 className="display-tight text-[clamp(2.5rem,9vw,6rem)] leading-[0.95]">
            you’ll never <span className="gradient-text">forget</span> again.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] text-white/70">
            Feru holds every reminder, idea and list — and brings it back at the
            exact moment you need it.
          </p>
          <div className="mt-8 flex justify-center">
            <GradientButton href="#pricing" variant="primary" size="lg">
              Try Feru free →
            </GradientButton>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="relative bg-gradient-dark"
      style={{ height: "230vh" }}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 text-white">
        <motion.div
          aria-hidden
          style={{
            opacity: glow,
            background:
              "radial-gradient(circle, rgba(249,115,22,0.55), rgba(249,115,22,0.12) 38%, transparent 68%)",
          }}
          className="pointer-events-none absolute inset-0 m-auto h-[70vh] w-[70vh] rounded-full blur-[30px]"
        />

        <motion.h2
          style={{ x, scale }}
          className="display-tight mx-auto max-w-[18ch] text-center text-[clamp(2.5rem,9vw,7rem)] leading-[0.98]"
        >
          you’ll never <span className="gradient-text">forget</span> again.
        </motion.h2>

        <motion.div
          style={{ opacity: subO, y: subY }}
          className="mt-8 flex flex-col items-center text-center"
        >
          <p className="max-w-xl text-[17px] leading-relaxed text-white/75 sm:text-[19px]">
            Feru holds every reminder, idea and list — and brings it back at the
            exact moment you need it.
          </p>
          <div className="mt-7">
            <GradientButton
              href="#pricing"
              variant="primary"
              size="lg"
            >
              Try Feru free →
            </GradientButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
