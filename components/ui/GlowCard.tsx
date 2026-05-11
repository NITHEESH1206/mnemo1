"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type GlowCardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export function GlowCard({
  className,
  children,
  hover = true,
  ...props
}: GlowCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-bg-card border border-white/[0.07] p-8 transition-all duration-300",
        hover &&
          "hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-[2px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
