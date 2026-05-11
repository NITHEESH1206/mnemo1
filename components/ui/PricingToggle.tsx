"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PricingToggleProps = {
  billing: "monthly" | "annual";
  onChange: (next: "monthly" | "annual") => void;
};

export function PricingToggle({ billing, onChange }: PricingToggleProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <div
        role="tablist"
        aria-label="Billing period"
        className="relative inline-flex items-center rounded-full glass p-1"
      >
        {(["monthly", "annual"] as const).map((opt) => {
          const active = billing === opt;
          return (
            <button
              key={opt}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt)}
              className={cn(
                "relative z-10 px-5 py-2 text-[14px] font-semibold transition-colors",
                active ? "text-white" : "text-ink/65 hover:text-ink",
              )}
            >
              {active && (
                <motion.span
                  layoutId="pricing-pill"
                  className="absolute inset-0 rounded-full bg-gradient-primary shadow-[0_8px_24px_-6px_rgba(234,88,12,0.55)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative capitalize">{opt}</span>
            </button>
          );
        })}
      </div>
      <span
        className={cn(
          "rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 transition-opacity",
          billing === "annual" ? "opacity-100" : "opacity-60",
        )}
      >
        SAVE 30%
      </span>
    </div>
  );
}
