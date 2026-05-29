"use client";

import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function MarqueeStrip({
  items,
  className,
}: {
  items: ReadonlyArray<string>;
  className?: string;
}) {
  const doubled = [...items, ...items];

  return (
    <div className={cn("marquee-fade relative w-full overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee items-center gap-12 motion-reduce:animate-none"
        aria-label="Supported integrations"
      >
        {doubled.map((label, i) => (
          <LogoItem key={`${label}-${i}`} label={label} />
        ))}
      </div>
    </div>
  );
}

function LogoItem({ label }: { label: string }) {
  return (
    <div
      className="group grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/70 backdrop-blur-md shadow-[0_8px_24px_-12px_rgba(20,60,110,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-white/60 transition-all duration-300 hover:-translate-y-1 hover:bg-white"
      title={label}
    >
      <BrandLogo name={label} size={30} className="opacity-90 transition-opacity group-hover:opacity-100" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
