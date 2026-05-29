import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#fff8f0",
          tint: "#fef3e6",
          surface: "#ffffff",
          card: "#ffffff",
          deep: "#0c0a09",
          "deep-soft": "#1c1917",
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
          800: "#9a3412",
        },
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
      },
      fontFamily: {
        sans: ["Satoshi", "var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["Satoshi", "var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #fbbf24 0%, #fb923c 35%, #f97316 65%, #ea580c 100%)",
        "gradient-accent": "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
        "gradient-warm": "linear-gradient(135deg, #fde68a, #fb923c, #dc2626)",
        "gradient-dark": "linear-gradient(135deg, #292524 0%, #0c0a09 100%)",
      },
      boxShadow: {
        "glow-orange": "0 0 40px rgba(249,115,22,0.45)",
        "glow-amber": "0 0 30px rgba(251,191,36,0.4)",
      },
      fontSize: {
        hero: [
          "clamp(48px, 7.5vw, 96px)",
          { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "800" },
        ],
        h2: [
          "clamp(36px, 5vw, 60px)",
          { lineHeight: "1.06", letterSpacing: "-0.025em", fontWeight: "800" },
        ],
      },
    },
  },
  plugins: [],
};

export default config;
