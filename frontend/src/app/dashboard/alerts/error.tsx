"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/shared/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="justify-center flex-1 overflow-y-auto items-center py-8 bg-bg/50 flex h-[calc(100vh-var(--height-header)-1px)] px-4 md:py-12 md:px-10">
      <ErrorState
        title="Alerts fail to load"
        description="We couldn't load your alerts or notification preferences. Please try refreshing."
        onRetry={reset}
      />
    </main>
  );
}
