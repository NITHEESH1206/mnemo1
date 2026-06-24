"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { Plus } from "lucide-react";
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
      "Daily, weekly, monthly, or custom. Set it once and Feru AI handles it forever.",
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
      "WhatsApp, Telegram, Email, Web — Feru AI answers wherever you happen to be.",
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
      "Send reminders to people you care about. They get a friendly nudge from Feru AI.",
    mascot: "hat",
    tone: "flame",
  },
  {
    title: "Voice-to-action",
    blurb:
      "Just speak. Feru AI transcribes, understands, and acts — in any language.",
    mascot: "headphones",
    tone: "amber",
    hueShift: 10,
  },
];

// Background wash per card tone — closer to the card color, still legible
// with dark text.
const toneTint: Record<FeatureCard["tone"], string> = {
  amber: "#fbe09a",
  flame: "#fbc59c",
  rust: "#ecbb9e",
  ink: "#d4cfc5",
  cream: "#ffe9c4",
};

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

function Header() {
  return (
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
      <p className="mt-4 max-w-xl text-[17px] text-ink/65">
        Scroll through everything Feru AI quietly does in the background.
      </p>
    </motion.div>
  );
}

export function Features() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const centersRef = useRef<number[]>([]);
  const x = useMotionValue(0);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Translate the filmstrip so the scroll-position card sits dead centre.
  const apply = (p: number) => {
    const cs = centersRef.current;
    if (!cs.length || typeof window === "undefined") return;
    const n = cs.length;
    const pos = Math.min(n - 1, Math.max(0, p * (n - 1)));
    const i = Math.floor(pos);
    const j = Math.min(n - 1, i + 1);
    const center = cs[i] + (cs[j] - cs[i]) * (pos - i);
    x.set(window.innerWidth / 2 - center);
    setActive(Math.round(pos));
  };

  useMotionValueEvent(scrollYProgress, "change", apply);

  useEffect(() => {
    if (reduced) return;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const kids = Array.from(track.children) as HTMLElement[];
      centersRef.current = kids.map((k) => k.offsetLeft + k.offsetWidth / 2);
      apply(scrollYProgress.get());
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  if (reduced) {
    return (
      <section id="features" className="section relative overflow-hidden">
        <div className="container-x">
          <Header />
          <div className="carousel-track mt-12 flex gap-5 overflow-x-auto pb-6">
            {CARDS.map((c) => (
              <div key={c.title} className="w-[78%] shrink-0 sm:w-[300px]">
                <FeatureCardView {...c} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative"
      style={{ height: `${CARDS.length * 60}vh` }}
    >
      <div
        className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden transition-colors duration-700 ease-out"
        style={{ backgroundColor: toneTint[CARDS[active].tone] }}
      >
        <div className="container-x">
          <Header />
        </div>
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="relative mt-10 flex w-max gap-6 pl-[10vw] pr-[10vw]"
        >
          {CARDS.map((c, i) => (
            <div
              key={c.title}
              className={cn(
                "w-[280px] shrink-0 transition-all duration-500 ease-out sm:w-[320px]",
                i === active
                  ? "scale-100 opacity-100"
                  : "scale-[0.84] opacity-50",
              )}
            >
              <FeatureCardView {...c} />
            </div>
          ))}
        </motion.div>

        <div className="container-x mt-8 flex items-center gap-2">
          {CARDS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-7 bg-flame-500" : "w-1.5 bg-ink/15",
              )}
            />
          ))}
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
      )}
    >
      <div>
        <h3 className="max-w-[80%] text-[26px] font-extrabold leading-[1.08] tracking-tight">
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
