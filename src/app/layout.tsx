import type { Metadata } from "next";
import localFont from "next/font/local";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts/KeyboardShortcuts";
import "./globals.css";

const harmond = localFont({
  variable: "--font-harmond",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/Harmond-SemiBoldCondensed.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Harmond-SemBdItaCond.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/Harmond-ExtraBoldExpanded.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Harmond-ExtBdItaExp.otf",
      weight: "800",
      style: "italic",
    },
  ],
});

const offbit = localFont({
  variable: "--font-offbit",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/OffBitTrial-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/OffBitTrial-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
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
        className={`${harmond.variable} ${offbit.variable} antialiased bg-zinc-950 text-zinc-50`}
      >
        <KeyboardShortcuts />
        {children}
      </body>
    </html>
  );
}

