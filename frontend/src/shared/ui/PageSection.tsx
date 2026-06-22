import React from "react";

type PageSectionProps = {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg";
  className?: string;
  as?: React.ElementType;
};

const spacingMap = {
  sm: "py-8 md:py-12",
  md: "py-12 md:py-20", // Standard section padding
  lg: "py-20 md:py-32",
};

export default function PageSection({
  children,
  spacing = "md",
  className = "",
  as: Component = "section",
}: PageSectionProps) {
  return (
    <Component className={`${spacingMap[spacing]} ${className}`}>
      {children}
    </Component>
  );
}
