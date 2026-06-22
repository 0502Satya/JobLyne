import React from "react";

type CardProps = {
  children: React.ReactNode;
  variant?: "flat" | "outline" | "elevated";
  className?: string;
};

const variantMap = {
  flat: "bg-surface-2 border-transparent",
  outline: "bg-transparent border-border/60",
  elevated: "bg-card-bg border-border/40 shadow-md",
};

export default function Card({
  children,
  variant = "elevated",
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-lg p-6 border ${variantMap[variant]} ${className}`}
    >
      {children}
    </div>
  );
}