'use client';

import React from 'react';
import { ErrorState } from '@/shared/ui';

export default function DashboardError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="my-12">
      <ErrorState
        title="Something went wrong"
        description="An error occurred while loading the dashboard components."
        onRetry={reset}
      />
    </div>
  );
}
