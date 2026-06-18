import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ChannelIcon } from "../components/ChannelIcon";
import { ChatBubble } from "../components/ChatBubble";
import { FeruLogo } from "../components/FeruLogo";
import { colors, fonts } from "../theme";

type Beat = {
  kind: "whatsapp" | "telegram" | "email" | "web";
  message: string;
  voice?: boolean;
  // Where the channel sits while it "speaks"
  origin: { x: number; y: number };
  start: number;
};

const BEATS: Beat[] = [
  {
    kind: "whatsapp",
    message: "Remind me to call James tomorrow at 3pm",
    origin: { x: -620, y: -180 },
    start: 0,
  },
  {
    kind: "telegram",
    message: "New idea: ship the AI inbox",
    voice: true,
    origin: { x: 580, y: -200 },
    start: 80,
  },
  {
    kind: "email",
    message: "Forward this to Sarah next week",
    origin: { x: -620, y: 200 },
    start: 160,
  },
  {
    kind: "web",
    message: "Daily standup notes at 9am",
    origin: { x: 580, y: 180 },
    start: 240,
  },
];

export const ChannelsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Central Feru orb pulse + intro
  const orbIn = spring({
    frame,
    fps,
    config: { damping: 17, stiffness: 90 },
    durationInFrames: 35,
  });
  const pulse = 1 + Math.sin(frame / 10) * 0.025;

  // Title appears briefly at the end
  const titleProgress = spring({
    frame: frame - 290,
    fps,
    config: { damping: 24, stiffness: 72 },
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
      {/* Concentric subtle rings around Feru */}
      {[1, 2, 3].map((i) => {
        const breathe = 1 + Math.sin((frame - i * 8) / 14) * 0.04;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 260 + i * 140,
              height: 260 + i * 140,
              borderRadius: 9999,
              border: `1.5px solid rgba(251,146,60,${0.28 - i * 0.07})`,
              transform: `scale(${orbIn * breathe})`,
              opacity: orbIn,
            }}
          />
        );
      })}

      {/* Central Feru orb */}
      <div
        style={{
          position: "absolute",
          transform: `scale(${orbIn * pulse})`,
        }}
      >
        <FeruLogo size={140} glow withWordmark={false} />
      </div>

      {/* Channels + bubbles */}
      {BEATS.map((beat, i) => {
        const local = frame - beat.start;
        // Phase A: enter (0-25): channel + bubble appear at origin
        // Phase B: hold (25-60): bubble visible
        // Phase C: absorb (60-90): they shoot to the center and fade
        const enter = spring({
          frame: local,
          fps,
          config: { damping: 16, stiffness: 92 },
          durationInFrames: 35,
        });
        const absorb = interpolate(local, [58, 92], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        });
        const opacity = local < 0 ? 0 : interpolate(absorb, [0, 1], [1, 0]);
        const tx = beat.origin.x * (1 - absorb);
        const ty = beat.origin.y * (1 - absorb);
        const scale = interpolate(enter, [0, 1], [0.6, 1]) * (1 - absorb * 0.4);

        // Place bubble next to the channel icon
        const bubbleSide = beat.origin.x < 0 ? 1 : -1; // left channel → bubble to the right
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              opacity,
              display: "flex",
              alignItems: "center",
              gap: 28,
              flexDirection: bubbleSide === 1 ? "row" : "row-reverse",
            }}
          >
            <ChannelIcon kind={beat.kind} size={120} />
            <ChatBubble
              text={beat.message}
              voice={beat.voice}
              align={bubbleSide === 1 ? "left" : "right"}
            />
          </div>
        );
      })}

      {/* Closing line */}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          width: "100%",
          textAlign: "center",
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize: 56,
          letterSpacing: "-0.03em",
          color: colors.ink.DEFAULT,
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 18}px)`,
        }}
      >
        One AI.{" "}
        <span
          style={{
            background:
              "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Every channel.
        </span>
      </div>
    </AbsoluteFill>
  );
};
