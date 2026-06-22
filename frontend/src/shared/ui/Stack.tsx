import React from "react";

type StackProps = {
  children: React.ReactNode;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
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
  "2xl": "gap-12", // 48px
  "3xl": "gap-16", // 64px
};

export default function Stack({
  children,
  gap = "md",
  className = "",
  as: Component = "div",
}: StackProps) {
  return (
    <Component className={`flex flex-col ${gapMap[gap]} ${className}`}>
      {children}
    </Component>
  );
}
