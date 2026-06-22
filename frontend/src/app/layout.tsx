import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

/* ─── FONT CONTROL ────────────────────────────────────────────
   To change the app font, replace "Inter" with any Google Font:
     import { Geist } from "next/font/google"
     import { Plus_Jakarta_Sans } from "next/font/google"
     import { DM_Sans } from "next/font/google"
   Then update the variable name below to match.
   No other file needs to change.
──────────────────────────────────────────────────────────────── */
const primaryFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobLyne - Your AI-Powered Career Intelligence Platform",
  description: "JobLyne helps teams find skill gaps, plan growth, and track success with precision.",
};

/**
 * The Root Layout is the shell for every page on the site.
 * Navbar and Footer are now in (marketing)/layout.tsx to avoid auth page conflicts.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={primaryFont.variable} suppressHydrationWarning>
      <body
        className="flex min-h-screen transition-colors flex-col"
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
