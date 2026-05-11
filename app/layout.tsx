import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mnemo.ai"),
  title: {
    default: "Mnemo — Your AI memory layer. Everywhere you work.",
    template: "%s · Mnemo",
  },
  description:
    "Set reminders, capture ideas, and stay in flow — across WhatsApp, Telegram, Email, and your web dashboard. One AI that never forgets.",
  openGraph: {
    title: "Mnemo — Your AI memory layer.",
    description:
      "One AI that never forgets. Across WhatsApp, Telegram, Email, and your web dashboard.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mnemo — Your AI memory layer.",
    description: "One AI that never forgets.",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff8f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg-base text-ink antialiased">
        <div className="ambient-bg" aria-hidden="true" />
        <div className="grain-overlay" aria-hidden="true" />
        <div className="relative z-[1]">{children}</div>
      </body>
    </html>
  );
}
