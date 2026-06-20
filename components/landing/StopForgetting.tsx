"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type Chat = { title: string; user: string; reply: string };

const CHATS: Chat[] = [
  {
    title: "Add things on the go",
    user: "Feru, add milk and eggs to my grocery list.",
    reply: "Done — added milk and eggs to your grocery list. 🛒",
  },
  {
    title: "See only what’s pending",
    user: "Feru, what’s still left on my Today list?",
    reply: "Here’s what’s still pending on “Today” — 3 items left.",
  },
  {
    title: "Reminders that recur",
    user: "Remind me to pay rent on the 1st, every month.",
    reply: "Got it — every month on the 1st at 9:00 AM. 🔁",
  },
  {
    title: "Turn a list into a reminder",
    user: "Tomorrow at 9, remind me of everything on my Admin list.",
    reply: "Perfect — tomorrow at 9:00 AM I’ll send your Admin list.",
  },
  {
    title: "Just send a voice note",
    user: "🎙️ “remind me to call the dentist on Friday at 4”",
    reply: "Heard you — reminder set for Friday at 4:00 PM. ✅",
  },
  {
    title: "Remind a friend",
    user: "Remind Ashok to send the file at 6pm.",
    reply: "On it — I’ll nudge Ashok at 6:00 PM for you.",
  },
];

export function StopForgetting() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section id="how-it-works" className="section relative overflow-hidden">
      <div className="ambient-warm opacity-60" aria-hidden />
      <div className="container-x relative z-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-h2 max-w-2xl text-ink"
          >
            How you’ll stop forgetting{" "}
            <span className="gradient-text">forever.</span>
          </motion.h2>

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
            {CHATS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                className="w-[82%] shrink-0 sm:w-[48%] lg:w-[31%]"
              >
                <ChatCard {...c} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatCard({ title, user, reply }: Chat) {
  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/70 bg-[linear-gradient(155deg,#fff7ed_0%,#ffffff_46%,#e0f2fe_100%)] p-7 shadow-[0_26px_60px_-30px_rgba(30,64,110,0.35)]">
      <h3 className="text-[21px] font-extrabold leading-tight tracking-tight text-ink">
        {title}
      </h3>

      <div className="mt-7 flex flex-col gap-3.5">
        {/* user bubble */}
        <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-gradient-primary px-4 py-3 text-[14px] font-medium leading-snug text-white shadow-[0_8px_20px_-8px_rgba(249,115,22,0.5)]">
          {user}
        </div>

        {/* Feru reply */}
        <div className="mr-auto max-w-[94%] rounded-2xl rounded-bl-md border border-ink/8 bg-white px-4 py-3 shadow-[0_8px_22px_-12px_rgba(15,12,9,0.2)]">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Logo showText={false} />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-flame-700">
              Feru AI
            </span>
          </div>
          <div className="text-[14px] leading-snug text-ink/80">{reply}</div>
        </div>
      </div>
    </article>
  );
}
