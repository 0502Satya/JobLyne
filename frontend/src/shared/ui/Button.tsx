import React from "react";

/**
 * Button Specification Block:
 * Heights:        40px (default / md) | 48px (large / lg) | 32px (compact / sm)
 * Padding:         16px horizontal, fixed regardless of height variant (px-4)
 * Border radius:   8px (rounded-lg)
 * Font:            14px (sm/md), 16px (lg), weight 600 (semibold)
 * Icon gap:        8px (gap-2) between icon and label
 * Min width:       80px (min-w-[80px])
 * Focus ring:      2px, offset 2px, visible on :focus-visible only
 */

type ButtonProps<T extends React.ElementType = "button"> = {
  as?: T;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  status?: "default" | "success" | "error" | "offline";
  selected?: boolean;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "variant" | "size" | "className" | "status">;

export default function Button<T extends React.ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  status = "default",
  selected = false,
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";

  const base =
    "relative inline-flex items-center justify-center type-ui font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/95 shadow-sm shadow-primary/10",
    secondary: "bg-surface-2 text-text hover:bg-surface-3 border border-border/40 shadow-xs",
    outline: "border border-border/60 bg-transparent text-text hover:bg-surface-2",
    ghost: "bg-transparent text-muted hover:text-text hover:bg-surface-2",
    danger: "bg-error text-white hover:bg-error/95 shadow-sm shadow-error/10",
  };

  const statusStyles = {
    default: "",
    success: "bg-success text-white hover:bg-success/95 shadow-sm shadow-success/10 border-none!",
    error: "bg-error text-white hover:bg-error/95 shadow-sm shadow-error/10 border-none!",
    offline: "bg-surface-2 text-muted border border-border/40 opacity-50 cursor-not-allowed pointer-events-none",
  };

  const sizes = {
    sm: "h-8 px-4 text-sm min-w-[80px] rounded-lg",
    md: "h-10 px-4 text-sm min-w-[80px] rounded-lg",
    lg: "h-12 px-4 text-base min-w-[80px] rounded-lg",
  };

  const selectedStyle = selected ? "ring-2 ring-primary ring-offset-2 scale-[0.98]" : "";

  // Determine if it should be disabled.
  // Standard HTML buttons accept disabled, but anchors do not.
  const isDisabled = disabled || isLoading || status === "offline";

  // Use status styles if they are not default
  const activeVariantStyles = status !== "default" ? statusStyles[status] : variants[variant];

  return (
    <Component
      className={`${base} ${activeVariantStyles} ${sizes[size]} ${selectedStyle} ${className}`}
      disabled={Component === "button" ? isDisabled : undefined}
      aria-disabled={Component !== "button" && isDisabled ? "true" : undefined}
      {...props}
    >
      <span className={isLoading ? "opacity-0" : "flex items-center gap-2"}>
        {children}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 border-2 border-current rounded-full border-t-transparent animate-spin" aria-hidden="true" />
        </span>
      )}
    </Component>
  );
}