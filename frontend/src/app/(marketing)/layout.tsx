import { cookies } from "next/headers";
import React from "react";
import Navbar from "@/shared/layout/Navbar";
import Footer from "@/shared/layout/Footer";

/**
 * Marketing Layout.
 * Includes the Navbar and Footer for all marketing/landing pages.
 */
export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("joblyne_session")?.value === "true";

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
