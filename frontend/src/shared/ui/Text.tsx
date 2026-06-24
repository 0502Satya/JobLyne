import React from "react";

export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "subtitle"
  | "body"
  | "body-sm"
  | "caption"
  | "label"
  | "ui"
  | "badge"
  | "overline"
  | "code"
  | "link";

export type TextWeight = "regular" | "medium" | "semibold" | "bold";
export type TextAlign = "left" | "center" | "right" | "justify";
export type TextColor =
  | "primary"
  | "muted"
  | "text"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "on-primary"
  | "default";

export type TextProps<C extends React.ElementType = "span"> = {
  as?: C;
  variant?: TextVariant;
  weight?: TextWeight;
  align?: TextAlign;
  truncate?: boolean;
  clamp?: number;
  color?: TextColor;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | "variant" | "weight" | "align" | "color" | "className" | "children">;

// Helper hook / utility to derive classes (consuming tokens)
export function useTextStyles({
  variant = "body",
  weight,
  align,
  truncate,
  clamp,
  color = "default",
}: {
  variant?: TextVariant;
  weight?: TextWeight;
  align?: TextAlign;
  truncate?: boolean;
  clamp?: number;
  color?: TextColor;
}) {
  const classes: string[] = [];

  // Map variants to classes in globals.css or fallback styles
  const variantStyles: Record<TextVariant, string> = {
    display: "type-display",
    h1: "type-h1",
    h2: "type-h2",
    h3: "type-h3",
    title: "type-card-title",
    subtitle: "text-base font-semibold leading-ui tracking-heading text-text",
    body: "type-body",
    "body-sm": "type-body-sm",
    caption: "type-caption",
    label: "type-label",
    ui: "type-ui",
    badge: "type-badge",
    overline: "text-[10px] uppercase tracking-wider font-semibold text-muted",
    code: "font-mono bg-surface-2 px-1 py-0.5 rounded text-xs border border-border/40 text-error",
    link: "underline cursor-pointer hover:text-primary transition-colors",
  };
  classes.push(variantStyles[variant]);

  // Map weights to token helper classes
  if (weight) {
    const weightStyles: Record<TextWeight, string> = {
      regular: "weight-body",
      medium: "weight-ui",
      semibold: "weight-heading",
      bold: "weight-display",
    };
    classes.push(weightStyles[weight]);
  }

  // Align
  if (align) {
    classes.push(`text-${align}`);
  }

  // Color
  if (color !== "default") {
    classes.push(`text-${color}`);
  }

  // Truncation
  if (truncate) {
    classes.push("truncate overflow-hidden text-ellipsis whitespace-nowrap");
  }

  // Multi-line Clamp
  if (clamp && clamp > 0) {
    if (clamp === 1) classes.push("line-clamp-1");
    else if (clamp === 2) classes.push("line-clamp-2");
    else if (clamp === 3) classes.push("line-clamp-3");
    else if (clamp === 4) classes.push("line-clamp-4");
    else if (clamp === 5) classes.push("line-clamp-5");
    else if (clamp === 6) classes.push("line-clamp-6");
  }

  return classes.join(" ");
}

export default function Text<C extends React.ElementType = "span">({
  as,
  variant = "body",
  weight,
  align,
  truncate,
  clamp,
  color = "default",
  className = "",
  children,
  ...props
}: TextProps<C>) {
  // Map default tags based on variants
  const defaultTags: Record<TextVariant, React.ElementType> = {
    display: "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    title: "h4",
    subtitle: "p",
    body: "p",
    "body-sm": "p",
    caption: "span",
    label: "label",
    ui: "span",
    badge: "span",
    overline: "span",
    code: "code",
    link: "a",
  };

  const Component = as || defaultTags[variant] || "span";

  const derivedClass = useTextStyles({
    variant,
    weight,
    align,
    truncate,
    clamp,
    color,
  });

  return (
    <Component className={`${derivedClass} ${className}`} {...props}>
      {children}
    </Component>
  );
}
