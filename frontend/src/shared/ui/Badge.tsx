import React from "react";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
  className?: string;
};

const variantMap = {
  primary: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-accent/10 text-accent border-accent/20",
  success: "bg-success-bg text-success border-success/20",
  warning: "bg-warning-bg text-warning border-warning/20",
  error: "bg-error-bg text-error border-error/20",
  info: "bg-info-bg text-info border-info/20",
  neutral: "bg-surface-2 text-muted border-border/60",
};

export default function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border type-badge ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
