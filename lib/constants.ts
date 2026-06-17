export const SITE = {
  name: "Feru AI",
  tagline: "Your AI memory layer. Everywhere you work.",
  subTagline:
    "Set reminders, capture ideas, and stay in flow — across WhatsApp, Telegram, Email, and your web dashboard. One AI that never forgets.",
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
] as const;

export const INTEGRATIONS = [
  "WhatsApp",
  "Telegram",
  "Gmail",
  "Google Calendar",
  "Notion",
  "Apple Calendar",
  "Outlook",
] as const;

export const FEATURES = [
  {
    icon: "🧠",
    title: "Universal Memory",
    description:
      "Captures reminders, ideas, and tasks across every channel. Nothing slips through.",
  },
  {
    icon: "📱",
    title: "Multi-Channel",
    description:
      "Works where you already are: WhatsApp, Telegram, Email, and a full web dashboard.",
  },
  {
    icon: "🔁",
    title: "Smart Recurrence",
    description:
      "Daily, weekly, monthly, or custom. Set it once and Feru AI handles the rest forever.",
  },
  {
    icon: "📅",
    title: "Calendar Sync",
    description:
      "Two-way sync with Google Calendar, Outlook, and Apple Calendar. Always in lockstep.",
  },
  {
    icon: "👥",
    title: "Team Memory",
    description:
      "Send reminders to teammates. Track completion. Keep everyone aligned — without limits.",
  },
  {
    icon: "🎙️",
    title: "Voice-to-Action",
    description:
      "Just speak. Feru AI transcribes, understands, and acts — in any language.",
  },
] as const;

export const STEPS = [
  {
    num: "01",
    title: "Connect your world",
    description:
      "Link your WhatsApp, Telegram, email, or just open the web app. No new apps to install. No learning curve.",
  },
  {
    num: "02",
    title: "Just talk to it",
    description:
      "Type or speak naturally. ‘Remind me to call James tomorrow at 3pm’ or ‘Add oat milk to my shopping list’ — Feru AI gets it.",
  },
  {
    num: "03",
    title: "It never forgets",
    description:
      "Get reminded at the right time, on the right channel. Review everything from your clean web dashboard.",
  },
] as const;

export const STATS = [
  { value: 50000, suffix: "+", label: "Users" },
  { value: 4.9, suffix: "★", label: "Average Rating", decimals: 1 },
  { value: 120, suffix: "+", label: "Countries" },
  { value: 2, suffix: "M+", label: "Reminders Sent" },
] as const;

export const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Founder, Hexa Labs",
    quote:
      "I used to miss follow-ups constantly. Feru AI changed that in day one.",
    rating: 5,
    featured: true,
    seed: "Priya Sharma",
    photo:
      "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=200&h=200&fit=crop&crop=faces&auto=format&q=75",
  },
  {
    name: "Arjun Mehta",
    role: "Product Lead, Quill",
    quote:
      "The multi-channel support is unreal. I get reminded on WhatsApp while my team sees it in the dashboard.",
    rating: 5,
    featured: false,
    seed: "Arjun Mehta",
    photo:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces&auto=format&q=75",
  },
  {
    name: "Ananya Iyer",
    role: "Freelance Designer",
    quote: "Setup took 90 seconds. I've been using it every day for 6 months.",
    rating: 5,
    featured: false,
    seed: "Ananya Iyer",
    photo:
      "https://images.unsplash.com/photo-1648486656752-89e2c9c0a6f6?w=200&h=200&fit=crop&crop=faces&auto=format&q=75",
  },
  {
    name: "Rohan Verma",
    role: "Startup Operator",
    quote: "Finally an AI tool that works how my brain works.",
    rating: 5,
    featured: false,
    seed: "Rohan Verma",
    photo:
      "https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?w=200&h=200&fit=crop&crop=faces&auto=format&q=75",
  },
  {
    name: "Sneha Reddy",
    role: "Executive Assistant",
    quote: "The voice input on Telegram is witchcraft. It just works.",
    rating: 5,
    featured: false,
    seed: "Sneha Reddy",
    photo:
      "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=200&h=200&fit=crop&crop=faces&auto=format&q=75",
  },
  {
    name: "Vikram Nair",
    role: "Engineering Manager",
    quote:
      "Switched our whole team over. The shared reminders feature alone is worth it.",
    rating: 5,
    featured: false,
    seed: "Vikram Nair",
    photo:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=faces&auto=format&q=75",
  },
] as const;

export type MascotName =
  | "default"
  | "glasses"
  | "headphones"
  | "goggles"
  | "hat"
  | "wink";

export type PricingPlan = {
  name: string;
  category: string;
  monthly: number;
  annual: number;
  blurb: string;
  features: string[];
  cta: string;
  mascot: MascotName;
  highlight?: boolean;
};

export const PRICING: PricingPlan[] = [
  {
    name: "Free",
    category: "For personal use",
    monthly: 0,
    annual: 0,
    blurb: "Everything you need to get started.",
    features: [
      "20 reminders per month",
      "WhatsApp or Telegram",
      "Basic recurrence",
      "Community support",
    ],
    cta: "Get started free",
    mascot: "glasses",
  },
  {
    name: "Pro",
    category: "For power users",
    monthly: 149,
    annual: 104,
    blurb: "For solopreneurs who run on reminders.",
    features: [
      "Unlimited reminders",
      "All channels (WhatsApp, Telegram, Email, Web)",
      "Voice input in any language",
      "Calendar sync (Google, Outlook, Apple)",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Start Pro",
    mascot: "goggles",
    highlight: true,
  },
  {
    name: "Team",
    category: "For teams",
    monthly: 499,
    annual: 349,
    blurb: "Keep everyone in sync, automatically.",
    features: [
      "Everything in Pro",
      "Up to 25 team members",
      "Shared reminder spaces",
      "Team dashboard + analytics",
      "Admin controls & SSO",
      "Dedicated support",
    ],
    cta: "Start Team",
    mascot: "headphones",
  },
];

export const FAQS = [
  {
    q: "Can I switch plans later?",
    a: "Yes — upgrade, downgrade, or cancel at any time from your dashboard. Changes prorate automatically, and your data follows you between plans.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Pro and Team both include a 14-day free trial with full access to every feature. No card required to start.",
  },
  {
    q: "What channels are supported?",
    a: "WhatsApp, Telegram, Email, and the web dashboard out of the box. Calendar sync covers Google Calendar, Outlook, and Apple Calendar.",
  },
  {
    q: "How does team billing work?",
    a: "One subscription covers up to 25 seats. Add or remove members anytime — billing prorates to the day, and admins get a single invoice.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Data is encrypted in transit and at rest, scoped per workspace, and never used to train third-party models. You own and can export everything at any time.",
  },
] as const;

export const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  Company: [{ label: "About", href: "/about" }],
  Integrations: [
    { label: "WhatsApp", href: "#whatsapp" },
    { label: "Telegram", href: "#telegram" },
    { label: "Gmail", href: "#gmail" },
    { label: "Calendar", href: "#calendar" },
    { label: "Notion", href: "#notion" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
} as const;

export const REMINDERS_DEMO = [
  {
    title: "Call James about the Q3 roadmap",
    time: "3:00 PM",
    channel: "whatsapp",
    done: false,
  },
  {
    title: "Review brand guidelines PDF",
    time: "4:30 PM",
    channel: "email",
    done: false,
  },
  {
    title: "Pick up dry cleaning",
    time: "6:00 PM",
    channel: "telegram",
    done: true,
  },
  {
    title: "Send invoice to Hexa Labs",
    time: "8:00 PM",
    channel: "email",
    done: false,
  },
  {
    title: "Plan tomorrow’s standup agenda",
    time: "9:30 PM",
    channel: "web",
    done: false,
  },
] as const;

export const ACTIVITY_DEMO = [
  { icon: "📨", text: "Reminder sent on WhatsApp — ‘Call James’", ago: "2m" },
  { icon: "✅", text: "Completed: ‘Pick up dry cleaning’", ago: "14m" },
  { icon: "🎙️", text: "Voice note transcribed from Telegram", ago: "1h" },
  { icon: "📅", text: "New Google Calendar event synced", ago: "3h" },
  { icon: "🔁", text: "Recurring reminder ‘Standup prep’ scheduled", ago: "yesterday" },
] as const;

export const CHANNELS_DEMO = [
  { name: "WhatsApp", connected: true, status: "Connected" },
  { name: "Telegram", connected: true, status: "Connected" },
  { name: "Email", connected: true, status: "Connected" },
  { name: "Notion", connected: false, status: "Connect" },
] as const;
