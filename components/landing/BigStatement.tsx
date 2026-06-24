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

  // Phase 1 (0–0.6): the headline sweeps in from the right.
  // Phase 2 (0.5–0.95): it shrinks and lifts into place, then the sub fades in.
  const x = useTransform(scrollYProgress, [0, 0.6], ["46vw", "-4vw"]);
  const scale = useTransform(scrollYProgress, [0.5, 0.95], [1, 0.42]);
  const lift = useTransform(scrollYProgress, [0.5, 0.95], ["0vh", "-24vh"]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.7, 0.4]);
  const subO = useTransform(scrollYProgress, [0.78, 1], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.78, 1], [34, 0]);

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
            <GradientButton href="/api/auth/google/login?next=wa" variant="primary" size="lg">
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
      style={{ height: "260vh" }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden text-white">
        <motion.div
          aria-hidden
          style={{
            opacity: glow,
            background:
              "radial-gradient(circle, rgba(249,115,22,0.55), rgba(249,115,22,0.12) 38%, transparent 68%)",
          }}
          className="pointer-events-none absolute inset-0 m-auto h-[72vh] w-[72vh] rounded-full blur-[30px]"
        />

        <motion.h2
          style={{ x, scale, y: lift }}
          className="display-tight whitespace-nowrap text-[clamp(4rem,16vw,15rem)] leading-[0.9]"
        >
          you’ll never <span className="gradient-text">forget</span> again.
        </motion.h2>

        <motion.div
          style={{ opacity: subO, y: subY }}
          className="absolute inset-x-0 bottom-[20%] flex flex-col items-center px-6 text-center"
        >
          <p className="max-w-xl text-[17px] leading-relaxed text-white/75 sm:text-[19px]">
            Feru holds every reminder, idea and list — and brings it back at the
            exact moment you need it.
          </p>
          <div className="mt-7">
            <GradientButton
              href="/api/auth/google/login?next=wa"
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
