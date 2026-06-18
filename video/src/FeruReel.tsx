import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

/* ------------------------------------------------------------------ */
/*  Set to true AFTER you add  video/public/voiceover.mp3  +  music.mp3 */
/* ------------------------------------------------------------------ */
const INCLUDE_AUDIO = true;

const FLAME = "#f97316";
const EMBER = "#ea580c";
const INK = "#0c0a09";

/* ---------- spring bounce wrapper ---------- */
const Bounce: React.FC<{
  delay?: number;
  children: React.ReactNode;
  damping?: number;
  y?: number;
  from?: number;
}> = ({ delay = 0, children, damping = 11, y = 50, from = 0.6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness: 150, mass: 0.8 },
  });
  const scale = interpolate(s, [0, 1], [from, 1]);
  const ty = interpolate(s, [0, 1], [y, 0]);
  const opacity = interpolate(frame - delay, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ transform: `translateY(${ty}px) scale(${scale})`, opacity }}>
      {children}
    </div>
  );
};

/* ---------- F-monogram logo (matches the brand) ---------- */
const ReelLogo: React.FC<{ size?: number; color?: string }> = ({
  size = 120,
  color = FLAME,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <g
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.5 9.5 V 23.5" />
      <path d="M12.5 9.5 H 20.5" />
      <path d="M12.5 16.3 H 18" />
    </g>
    <circle cx="24" cy="8" r="2.4" fill={color} />
  </svg>
);

/* ---------- background: blue sky -> cream + warm glow ---------- */
const Bg: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 50) * 18;
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg,#2a93e0 0%,#6fc0f5 28%,#bce5fd 52%,#fef3e6 78%,#fff8f0 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -260,
          right: -180 + drift,
          width: 820,
          height: 820,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,244,214,0.95), rgba(251,146,60,0.34) 45%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: -120 - drift,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(125,211,252,0.4), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
    </AbsoluteFill>
  );
};

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      padding: 90,
      textAlign: "center",
      fontFamily,
    }}
  >
    {children}
  </AbsoluteFill>
);

const Pill: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({
  children,
  dark,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      padding: "22px 38px",
      borderRadius: 999,
      fontSize: 44,
      fontWeight: 700,
      color: dark ? "#fff" : INK,
      background: dark
        ? "linear-gradient(135deg,#fb923c,#ea580c)"
        : "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))",
      border: "1.5px solid rgba(255,255,255,0.85)",
      boxShadow:
        "inset 0 2px 0 rgba(255,255,255,1), 0 22px 50px -22px rgba(30,64,110,0.45)",
    }}
  >
    {children}
  </div>
);

/* ============================ SCENES ============================ */

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const chips = [
    { t: "Pay rent", x: -360, y: -520, r: -8 },
    { t: "Mom's birthday", x: 250, y: -430, r: 7 },
    { t: "Reply to client", x: -300, y: 430, r: 6 },
    { t: "Meeting at 3pm", x: 300, y: 520, r: -6 },
    { t: "Call the doctor", x: -30, y: -640, r: 3 },
  ];
  return (
    <Center>
      {chips.map((c, i) => {
        const shake = Math.sin((frame + i * 12) / 6) * 5;
        return (
          <div
            key={c.t}
            style={{
              position: "absolute",
              transform: `translate(${c.x}px, ${c.y + shake}px) rotate(${c.r}deg)`,
            }}
          >
            <Bounce delay={6 + i * 4} y={30} from={0.7}>
              <div
                style={{
                  padding: "18px 30px",
                  borderRadius: 22,
                  fontSize: 34,
                  fontWeight: 600,
                  color: "#7c2d12",
                  background: "rgba(255,255,255,0.7)",
                  border: "1.5px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 14px 30px -16px rgba(30,64,110,0.4)",
                }}
              >
                {c.t}
              </div>
            </Bounce>
          </div>
        );
      })}

      <Bounce delay={2} y={10} from={0.9}>
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 6,
            color: "#0c4a6e",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          Be honest…
        </div>
      </Bounce>
      <Bounce delay={10} y={60}>
        <div
          style={{
            fontSize: 150,
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            color: "#fff",
            textShadow: "0 6px 40px rgba(12,74,110,0.45)",
          }}
        >
          you forgot.
          <br />
          <span style={{ color: "#ffd6a0" }}>again.</span>
        </div>
      </Bounce>
    </Center>
  );
};

const SceneTurn: React.FC = () => (
  <Center>
    <Bounce delay={2} y={50}>
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: INK,
          maxWidth: 880,
        }}
      >
        your brain wasn’t built
        <br />
        to hold it all.
      </div>
    </Bounce>
    <div style={{ height: 70 }} />
    <Bounce delay={26} y={60} damping={9}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <ReelLogo size={130} />
        <span
          style={{
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: INK,
          }}
        >
          Feru AI
        </span>
      </div>
    </Bounce>
  </Center>
);

const ChatBubble: React.FC<{
  text: string;
  me?: boolean;
  delay: number;
}> = ({ text, me, delay }) => (
  <Bounce delay={delay} y={26} from={0.85} damping={12}>
    <div
      style={{
        alignSelf: me ? "flex-end" : "flex-start",
        maxWidth: 620,
        margin: "10px 0",
        padding: "26px 34px",
        borderRadius: 34,
        borderBottomRightRadius: me ? 10 : 34,
        borderBottomLeftRadius: me ? 34 : 10,
        fontSize: 40,
        fontWeight: 600,
        lineHeight: 1.25,
        color: me ? "#fff" : INK,
        background: me
          ? "linear-gradient(135deg,#fb923c,#ea580c)"
          : "#ffffff",
        boxShadow: "0 18px 40px -20px rgba(30,64,110,0.4)",
      }}
    >
      {text}
    </div>
  </Bounce>
);

const SceneWhat: React.FC = () => (
  <Center>
    <Bounce delay={2} y={20} from={0.9}>
      <Pill>It lives in your WhatsApp</Pill>
    </Bounce>
    <div style={{ height: 50 }} />
    <Bounce delay={10} y={70} damping={13}>
      <div
        style={{
          width: 760,
          borderRadius: 48,
          padding: 36,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.66))",
          border: "1.5px solid rgba(255,255,255,0.85)",
          boxShadow:
            "inset 0 2px 0 rgba(255,255,255,1), 0 40px 90px -34px rgba(30,64,110,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            paddingBottom: 24,
            borderBottom: "1px solid rgba(15,12,9,0.08)",
            marginBottom: 14,
          }}
        >
          <ReelLogo size={56} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: INK }}>
              Feru AI
            </div>
            <div style={{ fontSize: 24, color: "#16a34a", fontWeight: 600 }}>
              online
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <ChatBubble me text="remind me to pay rent on the 1st" delay={24} />
          <ChatBubble
            text="Got it — I’ll ping you on the 1st ✓"
            delay={46}
          />
        </div>
      </div>
    </Bounce>
  </Center>
);

const SceneCapture: React.FC = () => {
  const items = ["Text it.", "Talk it.", "Screenshot it."];
  return (
    <Center>
      <Bounce delay={2} y={40}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: INK,
            marginBottom: 60,
          }}
        >
          Capture it any way.
        </div>
      </Bounce>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {items.map((t, i) => (
          <Bounce key={t} delay={16 + i * 12} y={50} damping={10}>
            <Pill dark={i === 2}>{t}</Pill>
          </Bounce>
        ))}
      </div>
    </Center>
  );
};

const SceneEverywhere: React.FC = () => {
  const ch = ["WhatsApp", "Telegram", "Email", "Web"];
  return (
    <Center>
      <Bounce delay={2} y={40}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: INK,
            lineHeight: 1.04,
            marginBottom: 60,
          }}
        >
          Reminds you
          <br />
          everywhere.
        </div>
      </Bounce>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 22,
          justifyContent: "center",
          maxWidth: 820,
        }}
      >
        {ch.map((c, i) => (
          <Bounce key={c} delay={14 + i * 9} y={40} damping={10} from={0.7}>
            <div
              style={{
                padding: "24px 44px",
                borderRadius: 999,
                fontSize: 46,
                fontWeight: 700,
                color: INK,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.7))",
                border: "1.5px solid rgba(255,255,255,0.85)",
                boxShadow: "0 20px 44px -22px rgba(30,64,110,0.45)",
              }}
            >
              {c}
            </div>
          </Bounce>
        ))}
      </div>
    </Center>
  );
};

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 9) * 0.02;
  return (
    <Center>
      <Bounce delay={2} y={50} damping={9}>
        <div
          style={{
            fontSize: 130,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            background: "linear-gradient(135deg,#fbbf24,#f97316 55%,#dc2626)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Free your
          <br />
          mind.
        </div>
      </Bounce>
      <div style={{ height: 46 }} />
      <Bounce delay={20} y={36}>
        <div style={{ fontSize: 52, fontWeight: 700, color: INK }}>
          Try Feru AI free for 7 days
        </div>
      </Bounce>
      <div style={{ height: 40 }} />
      <Bounce delay={32} y={40} damping={10}>
        <div style={{ transform: `scale(${pulse})` }}>
          <Pill dark>Message us on WhatsApp →</Pill>
        </div>
      </Bounce>
      <div style={{ height: 48 }} />
      <Bounce delay={44} y={24} from={0.85}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <ReelLogo size={64} />
          <span style={{ fontSize: 40, fontWeight: 700, color: INK }}>
            feruai.com · @feru.ai
          </span>
        </div>
      </Bounce>
    </Center>
  );
};

/* ============================ ROOT ============================ */

export const FeruReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Bg />

      <Sequence from={0} durationInFrames={110}>
        <SceneHook />
      </Sequence>
      <Sequence from={110} durationInFrames={100}>
        <SceneTurn />
      </Sequence>
      <Sequence from={210} durationInFrames={180}>
        <SceneWhat />
      </Sequence>
      <Sequence from={390} durationInFrames={170}>
        <SceneCapture />
      </Sequence>
      <Sequence from={560} durationInFrames={150}>
        <SceneEverywhere />
      </Sequence>
      <Sequence from={710} durationInFrames={190}>
        <SceneCTA />
      </Sequence>

      {INCLUDE_AUDIO && (
        <>
          <Audio src={staticFile("music.mp3")} volume={0.18} />
          <Audio src={staticFile("voiceover.mp3")} />
        </>
      )}
    </AbsoluteFill>
  );
};
