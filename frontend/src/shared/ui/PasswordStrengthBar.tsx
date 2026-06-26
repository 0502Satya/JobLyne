"use client";

import React from "react";

type PasswordStrengthBarProps = {
  password?: string;
};

// Password strength calculation helper
export const getPasswordStrength = (val: string) => {
  if (!val) return 0;
  let score = 0;
  if (val.length >= 8) score += 1;
  if (/[0-9]/.test(val)) score += 1;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
  if (/[^A-Za-z0-9]/.test(val)) score += 1;
  return score;
};

export default function PasswordStrengthBar({ password = "" }: PasswordStrengthBarProps) {
  const strength = getPasswordStrength(password);
  const labels = ["Empty", "Very Weak", "Weak", "Medium", "Strong"];
  const colors = [
    "bg-border/20",
    "bg-error",
    "bg-warning",
    "bg-warning",
    "bg-success"
  ];
  const labelColors = [
    "text-muted",
    "text-error",
    "text-warning",
    "text-warning",
    "text-success"
  ];

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2 px-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted">Password Strength:</span>
        <span className={`font-semibold ${labelColors[strength]}`}>
          {labels[strength]}
        </span>
      </div>
      <div className="flex gap-1 h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
        {[1, 2, 3, 4].map((bar) => (
          <div 
            key={bar} 
            className={`flex-1 h-full transition-all duration-300 ${
              strength >= bar ? colors[strength] : "bg-bg dark:bg-card"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted leading-tight">
        Must be at least 8 characters. Mix letters, numbers, and symbols.
      </p>
    </div>
  );
}
