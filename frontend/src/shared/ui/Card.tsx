"use client";

/**
 * Card Specification Block:
 * Heights:        Fluid, determined by content length or container bounds
 * Padding:        SM: 16px (p-4), MD: 24px (p-6), LG: 32px (p-8), None: 0px (p-0)
 * Border radius:  Rounded value defined by CSS variable `var(--card-radius)`
 * Elevation:      Flat (no shadow), Outline (1px border), Elevated (1px border + soft custom shadow)
 * Interactions:   Supports hover effect (hoverable / clickable) and click handling (focus ring, space/enter keydown, role="button")
 * Focus ring:      2px, offset 2px, visible on :focus-visible only
 */

import React from "react";

type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = {
  children: React.ReactNode;
  variant?: "flat" | "outline" | "elevated";
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
  as?: React.ElementType;
};

const CardContext = React.createContext<{ padding: CardPadding; hasSubcomponents: boolean }>({
  padding: "md",
  hasSubcomponents: false,
});

export function CardHeader({
  children,
  title,
  subtitle,
  action,
  className = "",
  divider = false,
}: {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  divider?: boolean;
}) {
  const { padding } = React.useContext(CardContext);

  const paddingClasses = {
    none: "p-0",
    sm: "px-4 pt-4 pb-2",
    md: "px-6 pt-6 pb-3",
    lg: "px-8 pt-8 pb-4",
  }[padding];

  return (
    <header
      className={`flex items-start justify-between gap-4 ${divider ? "border-b border-[var(--card-border)]" : ""} ${paddingClasses} ${className}`}
    >
      {children ? (
        children
      ) : (
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold text-text leading-snug tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted mt-1 leading-normal">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {action && <div className="shrink-0 flex items-center">{action}</div>}
    </header>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { padding } = React.useContext(CardContext);

  const paddingClasses = {
    none: "p-0",
    sm: "px-4 py-4",
    md: "px-6 py-6",
    lg: "px-8 py-8",
  }[padding];

  return <div className={`${paddingClasses} ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
  divider = false,
}: {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}) {
  const { padding } = React.useContext(CardContext);

  const paddingClasses = {
    none: "p-0",
    sm: "px-4 pb-4 pt-2",
    md: "px-6 pb-6 pt-3",
    lg: "px-8 pb-8 pt-4",
  }[padding];

  return (
    <footer
      className={`${divider ? "border-t border-[var(--card-border)]" : ""} ${paddingClasses} ${className}`}
    >
      {children}
    </footer>
  );
}

export default function Card({
  children,
  variant = "elevated",
  padding = "md",
  hoverable = false,
  clickable = false,
  className = "",
  onClick,
  as: Component = "div",
}: CardProps) {
  // Detect if structured subcomponents are used
  const hasSubcomponents = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === CardHeader ||
        child.type === CardContent ||
        child.type === CardFooter)
  );

  const paddingClasses = hasSubcomponents
    ? "p-0"
    : {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      }[padding];

  const variantClasses = {
    flat: "bg-[var(--card-bg-flat)] border-transparent",
    outline: "bg-[var(--card-bg-outline)] border-[var(--card-border)]",
    elevated: "bg-[var(--card-bg-elevated)] border-[var(--card-border)] [box-shadow:var(--card-shadow)]",
  }[variant];

  const hoverClasses =
    hoverable || clickable
      ? "transition-all duration-200 ease-in-out hover:border-[var(--card-border-hover)] hover:[box-shadow:var(--card-shadow-hover)] hover:-translate-y-0.5"
      : "";

  const clickClasses = clickable
    ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 active:scale-[0.99] select-none"
    : "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (clickable && onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <CardContext.Provider value={{ padding, hasSubcomponents }}>
      <Component
        onClick={clickable ? onClick : undefined}
        onKeyDown={clickable ? handleKeyDown : undefined}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? "button" : undefined}
        className={`rounded-[var(--card-radius)] border overflow-hidden ${variantClasses} ${paddingClasses} ${hoverClasses} ${clickClasses} ${className}`}
      >
        {children}
      </Component>
    </CardContext.Provider>
  );
}

// Attach subcomponents to main default export
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;