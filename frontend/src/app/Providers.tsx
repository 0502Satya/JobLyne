"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import OverlayProvider from "@/shared/ui/OverlayProvider";

/**
 * Providers component for client-side context providers.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        {...({ containerAriaProps: { "aria-live": "polite", "aria-atomic": "true" } } as any)} 
      />
      <OverlayProvider>
        {children}
      </OverlayProvider>
    </GoogleOAuthProvider>
  );
}
