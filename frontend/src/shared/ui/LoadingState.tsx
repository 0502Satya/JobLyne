import React from "react";

type LoadingStateProps = {
  variant?: "text" | "card" | "list" | "table";
  rows?: number;
  className?: string;
};

export default function LoadingState({ variant = "card", rows = 3, className = "" }: LoadingStateProps) {
  const shimmer = "animate-pulse bg-surface-3 rounded-md";

  if (variant === "text") {
    return (
      <div className={`space-y-3 w-full ${className}`}>
        <div className={`h-6 w-1/3 ${shimmer}`} />
        <div className="space-y-2">
          <div className={`h-4 w-full ${shimmer}`} />
          <div className={`h-4 w-11/12 ${shimmer}`} />
          <div className={`h-4 w-4/5 ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={`space-y-4 w-full ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className={`h-12 w-12 rounded-full ${shimmer} shrink-0`} />
            <div className="flex-1 space-y-2">
              <div className={`h-4 w-1/4 ${shimmer}`} />
              <div className={`h-3 w-3/4 ${shimmer}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={`space-y-4 w-full overflow-hidden ${className}`}>
        <div className="flex gap-4 border-b border-border/40 pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`h-5 w-20 ${shimmer}`} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2 border-b border-border/10">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className={`h-4 w-24 ${shimmer}`} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // default card layout
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-6 rounded-lg border border-border/40 bg-card-bg space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className={`h-10 w-10 rounded-md ${shimmer}`} />
            <div className={`h-5 w-16 ${shimmer}`} />
          </div>
          <div className="space-y-2">
            <div className={`h-5 w-3/4 ${shimmer}`} />
            <div className={`h-4 w-1/2 ${shimmer}`} />
          </div>
          <div className="flex gap-2 pt-2">
            <div className={`h-8 w-20 ${shimmer}`} />
            <div className={`h-8 w-20 ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
