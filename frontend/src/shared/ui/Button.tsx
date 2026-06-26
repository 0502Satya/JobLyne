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

type BaseButtonProps = {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg";
  status?: "default" | "success" | "error" | "offline";
  selected?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // Icon-only button
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
};

type PolymorphicButtonProps<T extends React.ElementType = "button"> = {
  as?: T;
} & BaseButtonProps & Omit<React.ComponentPropsWithoutRef<T>, "as" | "variant" | "size" | "className" | "status" | "children">;

const Spinner = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block h-4 w-4 border-2 border-current rounded-full border-t-transparent animate-spin shrink-0 ${className}`}
    aria-hidden="true"
  />
);

export default function Button<T extends React.ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  status = "default",
  selected = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  icon,
  className = "",
  children,
  disabled,
  "aria-label": ariaLabel,
  ...props
}: PolymorphicButtonProps<T>) {
  const Component = as || "button";

  // Base classes with handbook-approved properties (focus ring 2px, offset 2px, focus-visible only)
  const base =
    "relative inline-flex items-center justify-center type-ui font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 active:scale-[0.98] cursor-pointer select-none";

  // Variants mapping directly to the new component tokens
  const variants = {
    primary: "bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] border border-transparent hover:bg-[var(--button-primary-bg-hover)] active:bg-[var(--button-primary-bg-hover)]/95 shadow-sm shadow-primary/10",
    secondary: "bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-bg-hover)] border border-[var(--button-secondary-border)] shadow-xs",
    outline: "border border-[var(--button-outline-border)] bg-[var(--button-outline-bg)] text-[var(--button-outline-text)] hover:bg-[var(--button-outline-bg-hover)]",
    ghost: "bg-[var(--button-ghost-bg)] text-[var(--button-ghost-text)] hover:text-[var(--button-ghost-text-hover)] hover:bg-[var(--button-ghost-bg-hover)] border border-transparent",
    danger: "bg-[var(--button-danger-bg)] text-[var(--button-danger-text)] hover:bg-[var(--button-danger-bg-hover)] border border-transparent shadow-sm shadow-error/10",
    link: "bg-transparent text-[var(--color-primary)] border border-transparent underline underline-offset-4 p-0! h-auto! min-w-0! hover:text-[var(--color-primary-dark)] active:opacity-80 rounded-none",
  };

  // Status overrides
  const statusStyles = {
    default: "",
    success: "bg-[var(--button-success-bg)] text-[var(--button-success-text)] hover:bg-[var(--button-success-bg-hover)] border border-transparent shadow-sm shadow-success/10",
    error: "bg-[var(--button-danger-bg)] text-[var(--button-danger-text)] hover:bg-[var(--button-danger-bg-hover)] border border-transparent shadow-sm shadow-error/10",
    offline: "bg-[var(--color-surface-disabled)] text-[var(--color-text-disabled)] border border-[var(--color-border-disabled)] opacity-50 cursor-not-allowed pointer-events-none",
  };

  // Sizes mapping to height, padding, font, min-width
  const sizes = {
    sm: "h-8 px-4 text-sm rounded-lg",
    md: "h-10 px-4 text-sm rounded-lg",
    lg: "h-12 px-4 text-base rounded-lg",
  };

  // Link variant does not need standard min-width or padding, standard buttons need min-width 80px
  const minWidthClass = variant !== "link" && !icon ? "min-w-[80px]" : "";

  // Selected state
  const selectedStyle = selected ? "ring-2 ring-[var(--color-primary)] ring-offset-2 scale-[0.98]" : "";

  // Disabled and Loading states
  const isDisabled = disabled || isLoading || status === "offline";
  
  // State machine styles overrides
  let stateClasses = "";
  if (isLoading) {
    stateClasses = "cursor-wait pointer-events-none opacity-80";
  } else if (disabled || status === "offline") {
    stateClasses = "bg-[var(--button-disabled-bg)]! text-[var(--button-disabled-text)]! border-[var(--button-disabled-border)]! opacity-50 cursor-not-allowed pointer-events-none";
  }

  // Touch target expansion for small/medium buttons with icon only (44x44px min touch target)
  const isIconOnly = !!icon;
  let touchTargetClass = "";
  if (isIconOnly && variant !== "link") {
    if (size === "sm") {
      touchTargetClass = "w-8 p-0 after:absolute after:-inset-1.5 relative";
    } else if (size === "md") {
      touchTargetClass = "w-10 p-0 after:absolute after:-inset-0.5 relative";
    } else if (size === "lg") {
      touchTargetClass = "w-12 p-0";
    }
  }

  const activeVariantStyles = status !== "default" ? statusStyles[status] : variants[variant];

  // Warning in development for missing aria-label in icon-only buttons
  if (process.env.NODE_ENV !== "production" && isIconOnly && !ariaLabel) {
    console.warn(
      "[DesignSystem] Icon-only buttons require an 'aria-label' to be accessible to screen readers."
    );
  }

  // Stable loading content helper: spinner replaces icon if present, otherwise prepends
  const renderContent = () => {
    if (isIconOnly) {
      if (isLoading) return <Spinner />;
      return <span className="flex items-center justify-center shrink-0">{icon}</span>;
    }

    const showLeftSpinner = isLoading && (!leftIcon && !rightIcon || leftIcon);
    const showRightSpinner = isLoading && !leftIcon && rightIcon;

    return (
      <span className="flex items-center justify-center gap-2">
        {showLeftSpinner ? (
          <Spinner />
        ) : (
          leftIcon && <span className="flex items-center justify-center shrink-0">{leftIcon}</span>
        )}
        
        <span className={isLoading ? "opacity-70 transition-opacity" : ""}>{children}</span>
        
        {showRightSpinner ? (
          <Spinner />
        ) : (
          rightIcon && <span className="flex items-center justify-center shrink-0">{rightIcon}</span>
        )}
      </span>
    );
  };

  return (
    <Component
      className={`${base} ${activeVariantStyles} ${sizes[size]} ${minWidthClass} ${selectedStyle} ${stateClasses} ${touchTargetClass} ${className}`}
      disabled={Component === "button" ? isDisabled : undefined}
      aria-disabled={Component !== "button" && isDisabled ? "true" : undefined}
      aria-busy={isLoading ? "true" : undefined}
      aria-live={isLoading ? "polite" : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {renderContent()}
    </Component>
  );
}