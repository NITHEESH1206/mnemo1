"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Mascot, type MascotVariant } from "@/components/ui/Mascot";
import { cn } from "@/lib/utils";

type FeatureCard = {
  title: string;
  blurb: string;
  mascot: MascotVariant;
  tone: "amber" | "flame" | "ink" | "cream" | "rust";
  hueShift?: number;
};

const CARDS: FeatureCard[] = [
  {
    title: "Unlimited reminders",
    blurb:
      "Daily, weekly, monthly, or custom. Set it once and Mnemo handles it forever.",
    mascot: "glasses",
    tone: "amber",
  },
  {
    title: "Memory trunk",
    blurb:
      "Every idea, note, and task lives in one searchable trunk. Nothing slips through.",
    mascot: "wink",
    tone: "rust",
  },
  {
    title: "Memory everywhere",
    blurb:
      "WhatsApp, Telegram, Email, Web — Mnemo answers wherever you happen to be.",
    mascot: "goggles",
    tone: "ink",
  },
  {
    title: "Create & manage lists",
    blurb:
      "Shopping, packing, gifts, books — speak it, share it, check it off.",
    mascot: "default",
    tone: "cream",
  },
  {
    title: "Friend reminders",
    blurb:
      "Send reminders to people you care about. They get a friendly nudge from Mnemo.",
    mascot: "hat",
    tone: "flame",
  },
  {
    title: "Voice-to-action",
    blurb:
      "Just speak. Mnemo transcribes, understands, and acts — in any language.",
    mascot: "headphones",
    tone: "amber",
    hueShift: 10,
  },
];

const toneStyles: Record<FeatureCard["tone"], string> = {
  amber:
    "bg-[radial-gradient(circle_at_70%_-10%,#fde68a,#fbbf24_55%,#f59e0b)] text-ink",
  flame:
    "bg-[radial-gradient(circle_at_70%_-10%,#fed7aa,#fb923c_45%,#ea580c)] text-white",
  rust:
    "bg-[radial-gradient(circle_at_70%_-10%,#fdba74,#c2410c_55%,#7c2d12)] text-white",
  ink: "bg-[radial-gradient(circle_at_70%_-10%,#44403c,#1c1917_55%,#0c0a09)] text-white",
  cream:
    "bg-[radial-gradient(circle_at_70%_-10%,#ffffff,#fef3e6_55%,#fed7aa)] text-ink",
};

export function Features() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section id="features" className="section relative overflow-hidden">
      <div className="container-x relative z-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="pill">Superpowers</span>
            <h2 className="mt-5 text-h2 text-ink">
              Superpowers for minds <br className="hidden sm:block" />
              that can’t do it all.
            </h2>
            <p className="mt-5 max-w-xl text-[17px] text-ink/65">
              Mnemo sits quietly across all your tools, capturing what matters
              and surfacing it exactly when you need it.
            </p>
          </motion.div>

          <div className="flex items-center gap-2.5">
            <button
              aria-label="Previous"
              onClick={() => scroll(-1)}
              className="btn-glass h-11 w-11 !p-0"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Next"
              onClick={() => scroll(1)}
              className="btn-glass h-11 w-11 !p-0"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="relative mt-12 -mx-6 px-6 md:-mx-0 md:px-0">
          <div
            ref={trackRef}
            className="carousel-track flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6"
          >
            {CARDS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                className="w-[80%] shrink-0 sm:w-[48%] lg:w-[30%]"
              >
                <FeatureCardView {...c} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <GradientButton href="#all-features" variant="primary" size="lg">
            Discover all the superpowers →
          </GradientButton>
        </div>
      </div>
    </section>
  );
}

function FeatureCardView({ title, blurb, mascot, tone, hueShift }: FeatureCard) {
  return (
    <article
      className={cn(
        "group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[32px] p-7",
        "border border-white/20 shadow-[0_20px_50px_-20px_rgba(120,53,15,0.35)]",
        toneStyles[tone],
        "transition-transform duration-500 hover:-translate-y-1",
      )}
    >
      <div>
        <h3
          className={cn(
            "text-[26px] font-extrabold leading-[1.08] tracking-tight",
            "max-w-[80%]",
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "mt-3 max-w-[90%] text-[14.5px] leading-relaxed",
            tone === "ink" || tone === "flame" || tone === "rust"
              ? "text-white/80"
              : "text-ink/75",
          )}
        >
          {blurb}
        </p>
      </div>

      <div className="relative flex items-end justify-between">
        <button
          aria-label="Add this to my workflow"
          className={cn(
            "grid h-11 w-11 place-items-center rounded-full transition-transform group-hover:scale-110",
            tone === "ink" || tone === "flame" || tone === "rust"
              ? "bg-white text-ink"
              : "bg-ink text-white",
          )}
        >
          <Plus size={18} strokeWidth={2.4} />
        </button>

        <div className="relative -mr-3 -mb-3">
          <Mascot variant={mascot} size={130} hueShift={hueShift} />
        </div>
      </div>

      {/* Top-right glossy */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.7), transparent 60%)",
        }}
      />
    </article>
  );
}
