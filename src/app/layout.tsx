import type { Metadata } from "next";
import localFont from "next/font/local";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts/KeyboardShortcuts";
import "./globals.css";

const offbit = localFont({
  variable: "--font-offbit",
  src: [
    {
      path: "./fonts/OffBitTrial-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
});

const nohemi = localFont({
  variable: "--font-nohemi",
  src: [
    {
      path: "./fonts/Nohemi-Light.otf",
      weight: "300",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
});

const galgo = localFont({
  variable: "--font-galgo",
  src: [
    {
      path: "./fonts/Galgo-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Galgo-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Galgo-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chrona-timer.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chrona Desktop",
    template: "%s | Chrona Desktop",
  },
  description: "Precision-focused, distraction-free desktop timer for power users. Boost productivity with multi-timer workflows, keyboard shortcuts, and focus sessions.",
  keywords: [
    "timer",
    "pomodoro",
    "focus",
    "productivity",
    "stopwatch",
    "desktop timer",
    "productivity app",
    "time management",
    "focus timer",
    "work timer",
    "nextjs",
    "typescript",
  ],
  authors: [{ name: "Chrona" }],
  creator: "Walid Houssaf",
  category: "productivity",
  openGraph: {
    title: "Chrona Desktop",
    description:
      "Precision-focused, distraction-free desktop timer for power users.",
    url: siteUrl,
    siteName: "Chrona Desktop",
    images: [
      {
        url: "/screenshots/timers-dashboard.png",
        width: 1600,
        height: 900,
        alt: "Chrona Desktop interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chrona Desktop",
    description:
      "Precision-focused, distraction-free desktop timer for power users.",
    images: ["/screenshots/timers-dashboard.png"],
  },
  icons: {
    icon: "/logo1.png",
    shortcut: "/logo1.png",
    apple: "/logo1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${offbit.variable} ${galgo.variable} ${nohemi.variable} antialiased bg-zinc-950 text-zinc-50`}
      >
        <KeyboardShortcuts />
        {children}
      </body>
    </html>
  );
}