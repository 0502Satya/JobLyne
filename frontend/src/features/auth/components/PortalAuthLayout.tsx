"use client";

import React from "react";
import Link from "next/link";

interface PortalAuthLayoutProps {
  title: string;
  subtitle: string;
  registerUrl: string;
  children: React.ReactNode;
}

export default function PortalAuthLayout({
  title,
  subtitle,
  registerUrl,
  children
}: PortalAuthLayoutProps) {
  return (
    <div className="bg-bg transition-colors text-text flex min-h-screen flex-col dark:bg-surface">
      {/* Header */}
      <header className="border-b px-6 py-4 items-center border-border bg-surface sticky z-50 flex top-0 justify-between dark:bg-card dark:border-border md:px-20">
        <Link href="/" className="text-primary group gap-4 items-center flex">
          <div className="size-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="type-h3 text-text leading-tight">JobLyne</h2>
        </Link>
        <div className="gap-4 flex items-center">
          <span className="italic text-muted hidden text-xs sm:block">Don&apos;t have an account?</span>
          <Link href={registerUrl} className="type-ui text-primary hover:underline">Register Now</Link>
        </div>
      </header>

      {/* Main Form container */}
      <main className="justify-center py-12 flex-1 relative overflow-hidden items-center flex px-4 flex-col">
        {/* Background Decor */}
        <div className="-translate-x-1/2 absolute max-h-[600px] bg-primary/5 left-1/2 w-[60vw] blur-[100px] rounded-full top-1/2 max-w-[600px] pointer-events-none -translate-y-1/2 h-[60vw]"></div>

        <div className="w-full z-10 rounded-3xl relative transition-all bg-surface border-border max-w-md shadow-2xl p-8 border dark:bg-card dark:border-border md:p-10">
          <div className="text-center mb-10">
            <h1 className="text-text type-h1">{title}</h1>
            <p className="italic text-muted text-sm mt-2">{subtitle}</p>
          </div>
          <div className="space-y-6">
            {children}
          </div>
        </div>

        <div className="text-xs text-muted z-10 relative mt-10 transition-colors flex gap-6">
          <Link href="#" className="hover:text-primary cursor-pointer transition-colors">Contact Support</Link>
          <Link href="#" className="hover:text-primary cursor-pointer transition-colors">Security Overview</Link>
          <Link href="#" className="hover:text-primary cursor-pointer transition-colors">Service Status</Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 gap-4 text-xs uppercase items-center border-border bg-surface py-8 tracking-widest flex transition-colors text-muted justify-between flex-col md:px-20 dark:bg-card dark:border-border sm:flex-row">
        <p>© 2026 JobLyne Inc. All rights reserved.</p>
        <div className="italic flex gap-8">
          <Link className="hover:text-primary" href="#">Privacy</Link>
          <Link className="hover:text-primary" href="#">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
