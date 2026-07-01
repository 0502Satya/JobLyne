"use client";

import React, { useEffect, useRef } from "react";
import { ErrorState } from "@/shared/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.error(error);
    containerRef.current?.focus();
  }, [error]);

  return (
    <main 
      ref={containerRef}
      tabIndex={-1}
      className="justify-center flex-1 overflow-y-auto items-center py-8 bg-bg/50 flex h-[calc(100vh-var(--height-header)-1px)] px-4 md:py-12 md:px-10 focus:outline-none"
    >
      <ErrorState
        title="Dashboard failed to load"
        description="We couldn't load your candidate dashboard statistics. Please try refreshing or checking your login session."
        onRetry={reset}
      />
    </main>
  );
}
