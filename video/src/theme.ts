// Feru AI brand tokens — mirrors app/globals.css + tailwind.config.ts
export const colors = {
  bg: {
    base: "#fff8f0",
    tint: "#fef3e6",
    surface: "#ffffff",
    deep: "#0c0a09",
    deepSoft: "#1c1917",
  },
  ink: {
    DEFAULT: "#0c0a09",
    900: "#1c1917",
    700: "#44403c",
    500: "#6b6660",
    300: "#a8a29e",
  },
  flame: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
  },
  amber: {
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
  },
  sky: {
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
  },
} as const;

export const gradients = {
  primary: "linear-gradient(135deg, #fbbf24 0%, #fb923c 35%, #f97316 65%, #ea580c 100%)",
  accent: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
  warm: "linear-gradient(135deg, #fde68a, #fb923c, #dc2626)",
  dark: "linear-gradient(135deg, #292524 0%, #0c0a09 100%)",
} as const;

export const fonts = {
  sans: '"Satoshi", system-ui, -apple-system, sans-serif',
  display: '"Satoshi", system-ui, -apple-system, sans-serif',
} as const;

export const shadows = {
  glowOrange: "0 0 40px rgba(249,115,22,0.45)",
  glowAmber: "0 0 30px rgba(251,191,36,0.4)",
  glassSoft: "0 12px 34px -16px rgba(30, 64, 110, 0.2)",
  glass:
    "inset 0 1px 0 rgba(255,255,255,0.95), 0 16px 50px -20px rgba(30, 64, 110, 0.28), 0 2px 8px -2px rgba(15, 12, 9, 0.06)",
  glassStrong:
    "inset 0 1px 0 rgba(255,255,255,1), 0 28px 80px -28px rgba(30, 64, 110, 0.34), 0 6px 18px -6px rgba(15, 12, 9, 0.1)",
} as const;

// Easing helpers
export const easing = {
  // Apple-ish ease-out-quart
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  outQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outExpo: (t: number) =>
    t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
} as const;

// Scene timing (60s @ 30fps = 1800 frames)
export const FPS = 30;

// Cross-fade length between scenes. Every scene after the first is padded
// by this amount so the overlap keeps the total at exactly 1800 frames.
export const TRANSITION_FRAMES = 18;
export const SCENE_FRAMES = {
  hook: 7 * FPS, // 0-7s   (210f)
  brand: 7 * FPS, // 7-14s  (210f)
  channels: 12 * FPS, // 14-26s (360f)
  features: 15 * FPS, // 26-41s (450f)
  howItWorks: 11 * FPS, // 41-52s (330f)
  cta: 8 * FPS, // 52-60s (240f)
} as const;

export const TOTAL_FRAMES =
  SCENE_FRAMES.hook +
  SCENE_FRAMES.brand +
  SCENE_FRAMES.channels +
  SCENE_FRAMES.features +
  SCENE_FRAMES.howItWorks +
  SCENE_FRAMES.cta;
