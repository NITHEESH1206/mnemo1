import { Analytics } from "@vercel/analytics/next"
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
  metadataBase: new URL("https://www.feruai.com"),
  title: {
    default: "Feru AI — Your AI memory layer. Everywhere you work.",
    template: "%s · Feru AI",
  },
  description:
    "Set reminders, capture ideas, and stay in flow — across WhatsApp, Email, and your web dashboard. One AI that never forgets.",
  openGraph: {
    title: "Feru AI — Your AI memory layer.",
    description:
      "One AI that never forgets. Across WhatsApp, Email, and your web dashboard.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Feru AI — Your AI memory layer.",
    description: "One AI that never forgets.",
  },
};

export const viewport: Viewport = {
  themeColor: "#7dd3fc",
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
      <head>
        {/* Satoshi — premium geometric display face (Fontshare) */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-base text-ink antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        <div className="relative z-[1]">{children}</div>
      </body>
    </html>
  );
}
