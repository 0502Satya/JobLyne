import React from "react";

type InlineProps = {
  children: React.ReactNode;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch" | "between";
  className?: string;
  as?: React.ElementType;
};

const gapMap = {
  none: "",
  xs: "gap-1",   // 4px (--space-1)
  sm: "gap-2",   // 8px (--space-2)
  md: "gap-4",   // 16px (--space-4)
  lg: "gap-6",   // 24px (--space-6)
  xl: "gap-8",   // 32px (--space-8)
};

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  between: "justify-between items-center",
};

export default function Inline({
  children,
  gap = "sm",
  align = "center",
  className = "",
  as: Component = "div",
}: InlineProps) {
  return (
    <Component className={`flex flex-row flex-wrap ${gapMap[gap]} ${alignMap[align]} ${className}`}>
      {children}
    </Component>
  );
}
