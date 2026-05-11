import React from "react";
import { cn } from "@/lib/utils";

export type MascotVariant =
  | "default"
  | "glasses"
  | "headphones"
  | "goggles"
  | "hat"
  | "wink";

type Props = {
  variant?: MascotVariant;
  size?: number;
  className?: string;
  hueShift?: number; // degrees, 0 = warm orange
};

/**
 * A friendly little orb mascot. Pure SVG — no assets required.
 * Variants give each card a unique character without bloat.
 */
export function Mascot({
  variant = "default",
  size = 96,
  className,
  hueShift = 0,
}: Props) {
  const id = React.useId();
  const bodyId = `mascot-body-${id}`;
  const shineId = `mascot-shine-${id}`;
  const innerId = `mascot-inner-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={cn("select-none", className)}
      style={{ filter: `hue-rotate(${hueShift}deg)` }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={bodyId} cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="40%" stopColor="#fdba74" />
          <stop offset="75%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#9a3412" />
        </radialGradient>
        <radialGradient id={innerId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="75%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(154,52,18,0.45)" />
        </radialGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="60" cy="60" r="58" fill={`url(#${bodyId})`} opacity="0.35" />

      {/* Body */}
      <circle cx="60" cy="60" r="42" fill={`url(#${bodyId})`} />
      <circle cx="60" cy="60" r="42" fill={`url(#${innerId})`} />

      {/* Top highlight */}
      <ellipse
        cx="50"
        cy="38"
        rx="20"
        ry="10"
        fill={`url(#${shineId})`}
        opacity="0.9"
      />

      {/* Face */}
      <Face variant={variant} />

      {/* Accessory overlays */}
      {variant === "glasses" && <Glasses />}
      {variant === "headphones" && <Headphones />}
      {variant === "goggles" && <Goggles />}
      {variant === "hat" && <Hat />}
    </svg>
  );
}

function Face({ variant }: { variant: MascotVariant }) {
  const winking = variant === "wink";
  const blocked = variant === "goggles" || variant === "glasses";

  return (
    <g>
      {/* Eyes */}
      {!blocked && (
        <>
          {winking ? (
            <path
              d="M44 60 Q48 56 52 60"
              stroke="#1c1917"
              strokeWidth="2.6"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <circle cx="48" cy="60" r="3" fill="#1c1917" />
          )}
          <circle cx="72" cy="60" r="3" fill="#1c1917" />
          {/* Eye highlights */}
          {!winking && (
            <circle cx="49" cy="58.8" r="0.9" fill="#fff" />
          )}
          <circle cx="73" cy="58.8" r="0.9" fill="#fff" />
        </>
      )}

      {/* Mouth */}
      <path
        d="M50 72 Q60 80 70 72"
        stroke="#1c1917"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Cheek blush */}
      <ellipse cx="44" cy="70" rx="4" ry="2.4" fill="#fb7185" opacity="0.45" />
      <ellipse cx="76" cy="70" rx="4" ry="2.4" fill="#fb7185" opacity="0.45" />
    </g>
  );
}

function Glasses() {
  return (
    <g
      stroke="#0c0a09"
      strokeWidth="2.2"
      fill="rgba(15,12,9,0.06)"
      strokeLinecap="round"
    >
      <circle cx="48" cy="60" r="9" />
      <circle cx="72" cy="60" r="9" />
      <path d="M57 60 H63" />
      <path d="M39 58 L33 55" />
      <path d="M81 58 L87 55" />
    </g>
  );
}

function Headphones() {
  return (
    <g>
      <path
        d="M28 60 Q28 32 60 32 Q92 32 92 60"
        stroke="#0c0a09"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <rect
        x="22"
        y="56"
        width="12"
        height="18"
        rx="6"
        fill="#0c0a09"
      />
      <rect
        x="86"
        y="56"
        width="12"
        height="18"
        rx="6"
        fill="#0c0a09"
      />
      {/* speaker dot */}
      <path
        d="M30 84 Q34 96 46 96"
        stroke="#0c0a09"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function Goggles() {
  return (
    <g>
      <path
        d="M28 56 L32 50 H88 L92 56 V70 Q92 76 86 76 H34 Q28 76 28 70 Z"
        fill="rgba(12,10,9,0.92)"
        stroke="#0c0a09"
        strokeWidth="2"
      />
      {/* Glass shine */}
      <path
        d="M36 56 L42 53 H80 L84 56 L78 70 H42 Z"
        fill="url(#goggle-shine)"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="goggle-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <circle cx="46" cy="64" r="2" fill="rgba(255,255,255,0.85)" />
      <circle cx="74" cy="64" r="2" fill="rgba(255,255,255,0.85)" />
    </g>
  );
}

function Hat() {
  return (
    <g>
      <ellipse cx="60" cy="32" rx="30" ry="4" fill="#0c0a09" />
      <path
        d="M44 32 Q44 14 60 14 Q76 14 76 32 Z"
        fill="#0c0a09"
      />
      <rect x="44" y="29" width="32" height="4" fill="#f97316" rx="1" />
    </g>
  );
}

