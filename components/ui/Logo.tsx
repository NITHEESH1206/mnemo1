import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative">
        <svg
          width="30"
          height="30"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className="drop-shadow-[0_4px_12px_rgba(249,115,22,0.45)]"
        >
          <defs>
            <linearGradient id="feru-grad" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          {/* rounded gradient tile */}
          <rect width="32" height="32" rx="9" fill="url(#feru-grad)" />
          {/* subtle top sheen */}
          <rect width="32" height="16" rx="9" fill="#fff" opacity="0.12" />
          {/* F monogram */}
          <rect x="10" y="8" width="3.2" height="16" rx="1.6" fill="#fff" />
          <rect x="10" y="8" width="12" height="3.2" rx="1.6" fill="#fff" />
          <rect x="10" y="14.4" width="8.5" height="3.2" rx="1.6" fill="#fff" />
          {/* memory spark */}
          <circle cx="23.6" cy="22.6" r="2.1" fill="#fff" />
        </svg>
      </span>
      {showText && (
        <span className="text-[19px] font-extrabold tracking-tight text-ink">
          Feru AI
        </span>
      )}
    </span>
  );
}
