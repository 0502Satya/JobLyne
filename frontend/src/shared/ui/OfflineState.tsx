"use client";

import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

type OfflineStateProps = {
  className?: string;
};

export default function OfflineState({ className = "" }: OfflineStateProps) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:max-w-sm border border-warning/25 bg-surface-overlay text-text p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-200 animate-in slide-in-from-bottom-2 ${className}`}
      style={{ zIndex: "var(--z-toast)" }}
    >
      <WifiOff size={20} className="text-warning shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-text">You are currently offline</p>
        <p className="text-xs text-muted">Some features may be unavailable. Reconnecting...</p>
      </div>
    </div>
  );
}
