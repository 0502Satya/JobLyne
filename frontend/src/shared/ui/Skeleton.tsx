import React from "react";

export type SkeletonAnimation = "pulse" | "wave" | "none";
export type SkeletonVariant = "text" | "circular" | "rectangular";

export type SkeletonProps = {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
};

// Helper hook / utility to derive dimensions
export function useSkeletonDimensions(width?: string | number, height?: string | number) {
  const styles: React.CSSProperties = {};
  if (width !== undefined) {
    styles.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    styles.height = typeof height === "number" ? `${height}px` : height;
  }
  return styles;
}

export default function Skeleton({
  variant = "rectangular",
  animation = "pulse",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const dimensionStyles = useSkeletonDimensions(width, height);

  const baseClass = "bg-surface-3 rounded-md";
  
  // Animation classes
  const animationClass = {
    pulse: "animate-pulse",
    wave: "animate-skeleton-wave",
    none: "",
  }[animation];

  // Variant shapes
  const variantClass = {
    text: "h-4 w-full rounded-sm",
    circular: "rounded-full",
    rectangular: "",
  }[variant];

  return (
    <>
      {animation === "wave" && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes skeleton-wave {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-skeleton-wave {
            background: linear-gradient(90deg, var(--color-surface-3) 25%, var(--color-surface-2) 50%, var(--color-surface-3) 75%) !important;
            background-size: 200% 100% !important;
            animation: skeleton-wave 1.6s infinite linear !important;
          }
        `}} />
      )}
      <div
        className={`${baseClass} ${animationClass} ${variantClass} ${className}`}
        style={{ ...dimensionStyles, ...style }}
        {...props}
      />
    </>
  );
}

// ── Composable Building Blocks ──────────────────────────────────────────

export function SkeletonAvatar({
  size = 40,
  animation = "pulse",
  className = "",
}: {
  size?: number;
  animation?: SkeletonAnimation;
  className?: string;
}) {
  return (
    <Skeleton
      variant="circular"
      animation={animation}
      width={size}
      height={size}
      className={className}
    />
  );
}

export function SkeletonText({
  lines = 3,
  animation = "pulse",
  className = "",
}: {
  lines?: number;
  animation?: SkeletonAnimation;
  className?: string;
}) {
  return (
    <div className={`space-y-2.5 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        // Stagger width: 100%, 91%, 75% repeating
        const width = i % 3 === 0 ? "100%" : i % 3 === 1 ? "91%" : "75%";
        return (
          <Skeleton
            key={i}
            variant="text"
            animation={animation}
            width={width}
          />
        );
      })}
    </div>
  );
}

export function SkeletonButton({
  animation = "pulse",
  className = "",
}: {
  animation?: SkeletonAnimation;
  className?: string;
}) {
  return (
    <Skeleton
      variant="rectangular"
      animation={animation}
      className={`h-9 w-24 rounded-lg ${className}`}
    />
  );
}

export function SkeletonInput({
  animation = "pulse",
  className = "",
}: {
  animation?: SkeletonAnimation;
  className?: string;
}) {
  return (
    <Skeleton
      variant="rectangular"
      animation={animation}
      className={`h-10 w-full rounded-lg ${className}`}
    />
  );
}

export function SkeletonList({
  rows = 3,
  animation = "pulse",
  className = "",
}: {
  rows?: number;
  animation?: SkeletonAnimation;
  className?: string;
}) {
  return (
    <div className={`space-y-4 w-full ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <SkeletonAvatar size={40} animation={animation} className="shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" animation={animation} width="30%" />
            <Skeleton variant="text" animation={animation} width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({
  animation = "pulse",
  className = "",
}: {
  animation?: SkeletonAnimation;
  className?: string;
}) {
  return (
    <div className={`p-6 rounded-2xl border border-border/40 bg-card-bg space-y-4 shadow-sm ${className}`}>
      <div className="flex justify-between items-start">
        <SkeletonAvatar size={40} animation={animation} />
        <Skeleton variant="rectangular" animation={animation} className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" animation={animation} width="60%" />
        <Skeleton variant="text" animation={animation} width="40%" />
      </div>
      <div className="flex gap-2 pt-2">
        <SkeletonButton animation={animation} />
        <SkeletonButton animation={animation} className="w-20" />
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 4,
  columns = 4,
  animation = "pulse",
  className = "",
}: {
  rows?: number;
  columns?: number;
  animation?: SkeletonAnimation;
  className?: string;
}) {
  return (
    <div className={`space-y-4 w-full overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex gap-4 border-b border-border/40 pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            animation={animation}
            className="h-5 flex-1 rounded-md"
          />
        ))}
      </div>
      {/* Body Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2.5 border-b border-border/10">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton
              key={j}
              variant="rectangular"
              animation={animation}
              className="h-4 flex-1 rounded-md"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
