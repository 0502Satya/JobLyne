'use client';

import React, { useEffect, useRef } from 'react';
import { ErrorState } from '@/shared/ui';

export default function CompanyError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div 
      ref={containerRef}
      tabIndex={-1}
      className="my-12 focus:outline-none"
    >
      <ErrorState
        title="Something went wrong"
        description="An error occurred while loading the institutional company portal components."
        onRetry={reset}
      />
    </div>
  );
}
