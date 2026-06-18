import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fonts, colors } from "../theme";

const FORGOTTEN_THINGS = [
  { text: "Reply to Sarah ☝️", x: -520, y: -90, rot: -7, delay: 4 },
  { text: "Pay rent 🏠", x: 300, y: -160, rot: 5, delay: 8 },
  { text: "Call mom 📞", x: -240, y: 120, rot: -3, delay: 12 },
  { text: "Send invoice 💸", x: 440, y: 80, rot: 8, delay: 16 },
  { text: "Dentist at 3pm 🦷", x: -480, y: 220, rot: -6, delay: 20 },
  { text: "Pick up dry cleaning 👕", x: 220, y: 240, rot: 4, delay: 24 },
  { text: "Standup notes 📝", x: 0, y: -260, rot: -2, delay: 28 },
];

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase 1: "Ever forget..." (0 → 60f)
  const line1Progress = spring({
    frame,
    fps,
    config: { damping: 26, stiffness: 70 },
    durationInFrames: 45,
  });

  // Phase 2: "...the thing that mattered?" (45 → 105f)
  const line2Progress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 26, stiffness: 70 },
    durationInFrames: 45,
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Forgotten things — drop in late, scatter around the heading */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {FORGOTTEN_THINGS.map((item, idx) => {
          const enter = spring({
            frame: frame - 90 - item.delay,
            fps,
            config: { damping: 15, stiffness: 72, mass: 0.8 },
            durationInFrames: 40,
          });
          if (enter <= 0) return null;
          const ty = interpolate(enter, [0, 1], [-220, 0]);
          const op = interpolate(enter, [0, 1], [0, 1]);
          const sc = interpolate(enter, [0, 1], [0.85, 1]);
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                transform: `translate(${item.x}px, ${item.y + ty}px) rotate(${item.rot}deg) scale(${sc})`,
                opacity: op,
                background:
                  "linear-gradient(135deg, #fff8f0 0%, #fef3e6 100%)",
                color: colors.ink.DEFAULT,
                fontFamily: fonts.sans,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                padding: "18px 26px",
                borderRadius: 14,
                boxShadow:
                  "0 18px 40px -16px rgba(120,53,15,0.4), 0 4px 12px -4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1)",
                border: "1px solid rgba(251,146,60,0.18)",
                whiteSpace: "nowrap",
              }}
            >
              {item.text}
            </div>
          );
        })}
      </div>

      {/* Big headline */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          zIndex: 5,
          fontFamily: fonts.display,
          fontWeight: 900,
          letterSpacing: "-0.045em",
          lineHeight: 1.02,
        }}
      >
        <div
          style={{
            fontSize: 132,
            color: colors.ink.DEFAULT,
            opacity: line1Progress,
            transform: `translateY(${(1 - line1Progress) * 30}px)`,
          }}
        >
          Ever forget
        </div>
        <div
          style={{
            fontSize: 92,
            marginTop: 8,
            opacity: line2Progress,
            transform: `translateY(${(1 - line2Progress) * 30}px)`,
            background:
              "linear-gradient(135deg, #fb923c 0%, #ea580c 60%, #c2410c 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          the thing that mattered?
        </div>
      </div>
    </AbsoluteFill>
  );
};
