"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

/* A serene golden-hour valley, built in layers so each can parallax at its own
   depth. Vector — crisp at any resolution, warm tones that tie to the brand. */
export function HeroScene({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const skyY = useTransform(progress, [0, 1], [0, 16]);
  const sunY = useTransform(progress, [0, 1], [0, 10]);
  const farY = useTransform(progress, [0, 1], [0, 34]);
  const midY = useTransform(progress, [0, 1], [0, 52]);
  const nearY = useTransform(progress, [0, 1], [0, 78]);
  const yv = (mv: MotionValue<number>) => (reduced ? undefined : { y: mv });

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Sky gradient — deep blue up top fading to warm dawn at the horizon */}
      <motion.div
        style={{
          background:
            "linear-gradient(180deg,#1e3a60 0%,#3c6098 16%,#7b9bc2 34%,#bcb6c8 52%,#edc7ab 68%,#ffd49a 82%,#ffe7c4 95%)",
          ...(reduced ? {} : { y: skyY }),
        }}
        className="absolute -top-[6%] left-0 right-0 h-[118%]"
      />

      {/* Soft sun bloom near the horizon */}
      <motion.div
        style={{
          background:
            "radial-gradient(circle, rgba(255,244,214,0.95) 0%, rgba(255,206,141,0.55) 28%, rgba(255,168,99,0.18) 48%, transparent 66%)",
          ...(reduced ? {} : { y: sunY }),
        }}
        className="absolute left-0 right-0 top-[40%] mx-auto h-[480px] w-[480px] rounded-full"
      />

      {/* Drifting clouds (reuse the global cloud system) */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-3" />

      {/* Far range — pale, atmospheric */}
      <motion.div
        style={yv(farY)}
        className="absolute inset-x-0 bottom-[-80px] h-[58%]"
      >
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full"
        >
          <path
            d="M0,176 C160,120 300,150 460,112 C620,74 760,140 920,112 C1080,84 1240,150 1440,120 L1440,320 L0,320 Z"
            fill="#a9bdd6"
            opacity="0.75"
          />
        </svg>
      </motion.div>

      {/* Mid range */}
      <motion.div
        style={yv(midY)}
        className="absolute inset-x-0 bottom-[-80px] h-[54%]"
      >
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full"
        >
          <path
            d="M0,210 C200,158 360,206 560,178 C760,150 900,224 1100,188 C1260,160 1360,214 1440,196 L1440,320 L0,320 Z"
            fill="#7f93b6"
            opacity="0.9"
          />
        </svg>
      </motion.div>

      {/* Low mist band */}
      <div
        className="absolute inset-x-0 bottom-[24%] h-24 blur-2xl"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(255,243,224,0.85), transparent)",
        }}
      />

      {/* Near hills — deepest, warmest */}
      <motion.div
        style={yv(nearY)}
        className="absolute inset-x-0 bottom-[-90px] h-[46%]"
      >
        <svg
          viewBox="0 0 1440 300"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full"
        >
          <path
            d="M0,150 C240,96 420,150 640,132 C860,114 1020,176 1240,150 C1340,138 1400,158 1440,150 L1440,300 L0,300 Z"
            fill="#5a5f7e"
          />
        </svg>
      </motion.div>

      {/* Blend the bottom into the page cream */}
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-b from-transparent to-[#fff8f0]" />
    </div>
  );
}
