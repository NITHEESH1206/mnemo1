"use client";

import { motion } from "framer-motion";
import { GradientButton } from "@/components/ui/GradientButton";
import { Mascot } from "@/components/ui/Mascot";

export function FinalCTA() {
  return (
    <section id="get-started" className="relative overflow-hidden py-24">
      <div className="container-x">
        <div className="relative isolate overflow-hidden rounded-[40px] bg-gradient-dark px-8 py-20 text-center shadow-[0_40px_120px_-30px_rgba(120,53,15,0.55)]">
          {/* warm glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-32 h-[460px] w-[460px] rounded-full opacity-60 blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(251,191,36,0.55), transparent 65%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -right-20 h-[520px] w-[520px] rounded-full opacity-50 blur-[140px]"
            style={{
              background:
                "radial-gradient(circle, rgba(249,115,22,0.55), transparent 65%)",
            }}
          />

          {/* floating mascots */}
          <div className="pointer-events-none absolute left-6 top-10 hidden animate-float-slow md:block">
            <Mascot variant="wink" size={72} />
          </div>
          <div className="pointer-events-none absolute right-8 bottom-10 hidden animate-float-slower md:block">
            <Mascot variant="goggles" size={92} hueShift={-10} />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto max-w-3xl text-[clamp(36px,5.5vw,68px)] font-extrabold leading-[1.05] tracking-[-0.025em] text-white"
          >
            Stop forgetting.{" "}
            <span className="gradient-text">Start doing.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto mt-6 max-w-xl text-[17px] text-white/70"
          >
            Join 50,000+ people who let Mnemo handle their memory.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mt-10 flex flex-col items-center gap-4"
          >
            <GradientButton
              href="/api/auth/google/login"
              variant="primary"
              size="lg"
              className="px-10 py-5 text-[16px]"
            >
              Try for Free — No Card Needed →
            </GradientButton>
            <p className="text-[13px] text-white/55">
              Setup takes 2 minutes. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
