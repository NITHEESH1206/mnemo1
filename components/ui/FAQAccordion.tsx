"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FAQItem = { q: string; a: string };

export function FAQAccordion({ items }: { items: ReadonlyArray<FAQItem> }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="card-soft mx-auto w-full max-w-3xl divide-y divide-ink/8">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="px-6">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-flame-700"
            >
              <span className="text-[16px] font-semibold text-ink">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-ink/50 transition-all duration-300",
                  isOpen && "rotate-180 text-flame-600",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-10 text-[15px] leading-relaxed text-ink/70">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
