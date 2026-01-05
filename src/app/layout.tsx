import type { Metadata } from "next";
import localFont from "next/font/local";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts/KeyboardShortcuts";
import "./globals.css";

const harmond = localFont({
  variable: "--font-harmond",
  src: [
    {
      path: "./fonts/Harmond-SemiBoldCondensed.otf",
      weight: "600",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
});

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

export const metadata: Metadata = {
  title: "Chrona Desktop",
  description: "Precision-focused, distraction-free desktop timer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${harmond.variable} ${offbit.variable} ${galgo.variable} ${nohemi.variable} antialiased bg-zinc-950 text-zinc-50`}
      >
        <KeyboardShortcuts />
        {children}
      </body>
    </html>
  );
}