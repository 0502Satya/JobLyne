'use client';

import React from 'react';
import { ErrorState } from '@/shared/ui';

export default function CompanyError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="my-12">
      <ErrorState
        title="Something went wrong"
        description="An error occurred while loading the institutional company portal components."
        onRetry={reset}
      />
    </div>
  );
}
