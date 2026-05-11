"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type VideoBackgroundProps = {
  src: string;
  opacity?: number;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  className?: string;
  poster?: string;
};

export function VideoBackground({
  src,
  opacity = 0.2,
  overlay = true,
  overlayColor = "#fff8f0",
  overlayOpacity = 0.7,
  className,
  poster,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className,
      )}
      aria-hidden="true"
    >
      {!failed && !reducedMotion ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ opacity }}
          src={src}
        />
      ) : (
        <div
          className="gradient-fallback absolute inset-0 w-full h-full z-0"
          style={{ opacity: Math.max(opacity, 0.35) }}
        />
      )}
      {overlay && (
        <div
          className="absolute inset-0 z-[1]"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        />
      )}
    </div>
  );
}
