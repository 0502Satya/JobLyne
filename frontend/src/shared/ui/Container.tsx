import React from "react";

type ContainerProps = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  as?: React.ElementType;
};

const sizeMap = {
  sm: "max-w-2xl", // ~640px (Article, text columns)
  md: "max-w-3xl", // 768px (Settings & detailed forms)
  lg: "max-w-5xl", // 1024px (Standard forms / listing feeds)
  xl: "max-w-7xl", // 1280px (Dashboards / listing pages)
};

export default function Container({
  children,
  size = "xl",
  className = "",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeMap[size]} ${className}`}>
      {children}
    </Component>
  );
}
