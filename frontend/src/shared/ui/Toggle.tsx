"use client";

import React, { useId } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Toggle (Switch) component.
 *
 * UX Note: Toggle represents a binary state with an *immediate* effect.
 * It should never be paired with a "Save" button.
 *
 * Specification:
 * - Markup: Semantic <button role="switch" aria-checked={checked}>
 * - Sizes:
 *   - sm: Track 20px x 36px (h-5 w-9), Thumb 14px x 14px (h-3.5 w-3.5), translate-x-[16px]
 *   - md (default): Track 24px x 44px (h-6 w-11), Thumb 18px x 18px (h-4.5 w-4.5), translate-x-[20px]
 *   - lg: Track 28px x 56px (h-7 w-14), Thumb 22px x 22px (h-5.5 w-5.5), translate-x-[28px]
 * - Focus: Visible focus ring around the track on :focus-visible.
 * - Accessibility: aria-describedby connects helper/error text to the switch.
 * - Performance: Respects prefers-reduced-motion (motion-reduce:transition-none).
 */

type ToggleSize = "sm" | "md" | "lg";
type ToggleState = "default" | "valid" | "error";

type ToggleProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  helper?: string;
  error?: string;
  state?: ToggleState;
  size?: ToggleSize;
  disabled?: boolean;
  id?: string;
  className?: string;
};

const TRACK_SIZES: Record<ToggleSize, string> = {
  sm: "h-5 w-9",
  md: "h-6 w-11",
  lg: "h-7 w-14",
};

const THUMB_SIZES: Record<ToggleSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4.5 w-4.5",
  lg: "h-5.5 w-5.5",
};

export default function Toggle({
  checked = false,
  onChange,
  label,
  helper,
  error,
  state = "default",
  size = "md",
  disabled = false,
  id,
  className = "",
}: ToggleProps) {
  const autoId = useId();
  const toggleId = id || `toggle-${autoId}`;
  const helperId = `${toggleId}-helper`;
  const errorId = `${toggleId}-error`;

  const computedState = error ? "error" : state;

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const describedBy = [
    computedState === "error" && error ? errorId : "",
    computedState !== "error" && helper ? helperId : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const getTrackClasses = () => {
    const base = [
      "relative rounded-full transition-all duration-200 ease-in-out motion-reduce:transition-none cursor-pointer border",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      TRACK_SIZES[size],
    ].join(" ");

    if (disabled) {
      return `${base} opacity-40 cursor-not-allowed bg-surface-3 border-border/40`;
    }

    const focusRing = {
      default: "focus-visible:ring-primary",
      valid:   "focus-visible:ring-success/30",
      error:   "focus-visible:ring-error/30",
    }[computedState];

    if (checked) {
      const activeColors = {
        default: "bg-primary border-transparent",
        valid:   "bg-success border-transparent",
        error:   "bg-error border-transparent",
      }[computedState];
      return `${base} ${focusRing} ${activeColors}`;
    } else {
      const inactiveColors = {
        default: "bg-surface-3 border-border/40 hover:border-border/80",
        valid:   "bg-success/10 border-success",
        error:   "bg-error/10 border-error",
      }[computedState];
      return `${base} ${focusRing} ${inactiveColors}`;
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex items-center min-h-[44px]">
        {/* Toggle Button (Track) */}
        <button
          type="button"
          id={toggleId}
          role="switch"
          aria-checked={checked}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={handleToggle}
          className={getTrackClasses()}
        >
          {/* Thumb */}
          <span
            className={[
              "absolute rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out motion-reduce:transition-none pointer-events-none",
              THUMB_SIZES[size],
              checked ? {
                sm: "translate-x-[16px]",
                md: "translate-x-[20px]",
                lg: "translate-x-[28px]",
              }[size] : "translate-x-0",
            ].join(" ")}
            style={{ left: "3px", top: "3px" }}
            aria-hidden="true"
          />
        </button>

        {/* Label */}
        {label && (
          <label
            htmlFor={toggleId}
            className={[
              "text-sm select-none ml-3 font-medium leading-tight",
              disabled ? "cursor-not-allowed text-muted opacity-50" : "cursor-pointer text-text",
            ].join(" ")}
          >
            {label}
          </label>
        )}
      </div>

      {/* Helper message */}
      {computedState !== "error" && helper && (
        <p id={helperId} className="text-xs text-muted leading-normal pl-0.5">
          {helper}
        </p>
      )}

      {/* Error message */}
      {computedState === "error" && error && (
        <div id={errorId} className="text-error text-xs gap-1 items-center flex pl-0.5" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
