import React from "react";

type ButtonProps<T extends React.ElementType = "button"> = {
  as?: T;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "variant" | "size" | "className">;

export default function Button<T extends React.ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";

  const base =
    "relative inline-flex items-center justify-center type-ui font-semibold transition-all duration-200 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer min-h-[40px]";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/95 shadow-sm shadow-primary/10",
    secondary: "bg-surface-2 text-text hover:bg-surface-3 border border-border/40 shadow-xs",
    outline: "border border-border/60 bg-transparent text-text hover:bg-surface-2",
    ghost: "bg-transparent text-muted hover:text-text hover:bg-surface-2",
    danger: "bg-error text-white hover:bg-error/95 shadow-sm shadow-error/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-8 py-4 text-base rounded-lg",
  };

  // Determine if it should be disabled.
  // Standard HTML buttons accept disabled, but anchors do not.
  const isDisabled = disabled || isLoading;

  return (
    <Component
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
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