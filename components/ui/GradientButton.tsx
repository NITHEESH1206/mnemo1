"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "glass-dark" | "ink" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  href?: string;
  target?: string;
  rel?: string;
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-6 py-3 text-[14.5px]",
  lg: "px-8 py-4 text-[16px]",
};

const variantClasses: Record<Variant, string> = {
  primary: "btn-primary",
  glass: "btn-glass",
  "glass-dark": "btn-glass-dark",
  ink: "btn-ink",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-ink hover:text-flame-600 transition-colors",
};

export const GradientButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      children,
      href,
      target,
      rel,
      ...props
    },
    ref,
  ) => {
    const classes = cn(variantClasses[variant], sizeClasses[size], className);

    if (href) {
      const computedRel =
        rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
      return (
        <a href={href} target={target} rel={computedRel} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
GradientButton.displayName = "GradientButton";
