import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

/**
 * Setting up the 'Inter' font for the whole website.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} antialiased font-display bg-bg text-text transition-colors flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
