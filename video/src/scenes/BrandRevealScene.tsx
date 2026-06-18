import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeruLogo } from "../components/FeruLogo";
import { colors, fonts, gradients } from "../theme";

export const BrandRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sun bloom expands
  const bloom = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60 },
    durationInFrames: 50,
  });

  // Logo springs in
  const logoIn = spring({
    frame: frame - 6,
    fps,
    config: { damping: 16, stiffness: 95, mass: 0.9 },
    durationInFrames: 55,
  });
  const logoScale = interpolate(logoIn, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(logoIn, [0, 1], [0, 1]);

  // Tagline 1
  const t1 = spring({
    frame: frame - 70,
    fps,
    config: { damping: 24, stiffness: 72 },
    durationInFrames: 45,
  });

  // Tagline 2
  const t2 = spring({
    frame: frame - 110,
    fps,
    config: { damping: 24, stiffness: 72 },
    durationInFrames: 45,
  });

  // Subtle pulse
  const pulse = 1 + Math.sin(frame / 12) * 0.012;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Radial sun bloom */}
      <div
        style={{
          position: "absolute",
          width: 1600,
          height: 1600,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(251,146,60,0.22) 28%, rgba(249,115,22,0.10) 50%, transparent 72%)",
          transform: `scale(${bloom})`,
          opacity: bloom,
          filter: "blur(8px)",
        }}
      />

      {/* Soft outer ring */}
      <div
        style={{
          position: "absolute",
          width: 820,
          height: 820,
          borderRadius: 9999,
          border: "1.5px solid rgba(251,146,60,0.22)",
          transform: `scale(${bloom * pulse})`,
          opacity: bloom * 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: 9999,
          border: "1.5px solid rgba(251,146,60,0.12)",
          transform: `scale(${bloom * (2 - pulse)})`,
          opacity: bloom * 0.5,
        }}
      />

      <div
        style={{
          transform: `scale(${logoScale * pulse})`,
          opacity: logoOpacity,
          marginBottom: 36,
        }}
      >
        <FeruLogo size={160} glow withWordmark />
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 68,
          letterSpacing: "-0.03em",
          textAlign: "center",
          color: colors.ink.DEFAULT,
          marginTop: 8,
          opacity: t1,
          transform: `translateY(${(1 - t1) * 20}px)`,
        }}
      >
        Your AI memory layer.
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 68,
          letterSpacing: "-0.03em",
          textAlign: "center",
          marginTop: 6,
          background: gradients.warm,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          opacity: t2,
          transform: `translateY(${(1 - t2) * 20}px)`,
        }}
      >
        Everywhere you work.
      </div>
    </AbsoluteFill>
  );
};
