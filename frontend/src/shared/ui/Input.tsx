"use client";

/**
 * Input Specification Block:
 * Heights:        40px (default / md) | 48px (large / lg) | 32px (compact / sm)
 * Padding:         16px (pl-4/pr-4) horizontal by default; with slots: 40px (pl-10/pr-10) for md, 48px (pl-12/pr-12) for lg, 32px (pl-8/pr-8) for sm
 * Border radius:   8px (rounded-lg) for lg, 6px (rounded-md) for md/sm
 * Font:            14px (sm/md), 16px (lg), weight 400 (normal)
 * Focus ring:      2px (focus-visible:ring-2), visible on :focus-visible only
 * Theme Customizations: caretColor, background, text, border variables mapped from theme
 */

import React, { forwardRef, useState } from "react";
import FormField from "./FormField";
import Icon from "./Icon";
import { Eye, EyeOff } from "lucide-react";

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  icon?: string; // Legacy support: maps to leftSlot using Icon name
  showVisibilityToggle?: boolean;
  label?: string;
  error?: string;
  helper?: string;
  isValid?: boolean; // Legacy validation indicator
  validationState?: "error" | "warning" | "success" | "none";
  size?: "sm" | "md" | "lg";
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  labelAction?: React.ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      icon,
      type = "text",
      showVisibilityToggle = false,
      id,
      label,
      error,
      helper,
      isValid,
      validationState: customValidationState,
      size = "md",
      leftSlot,
      rightSlot,
      required,
      disabled,
      readOnly,
      labelAction,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputId = id || props.name || "";
    
    // Resolve validation state: priority to customValidationState, then legacy props
    const validationState = customValidationState
      ? customValidationState
      : error
      ? "error"
      : isValid
      ? "success"
      : "none";

    const resolvedType =
      type === "password" && showVisibilityToggle && isPasswordVisible
        ? "text"
        : type;

    // Outer layout wrap in FormField if FormField-relevant props are present
    if (label || error || helper) {
      return (
        <FormField
          label={label}
          error={error}
          helper={helper}
          required={required}
          status={validationState !== "none" ? validationState : undefined}
          labelAction={labelAction}
        >
          <Input
            ref={ref}
            icon={icon}
            type={type}
            showVisibilityToggle={showVisibilityToggle}
            id={inputId}
            required={required}
            className={className}
            validationState={validationState}
            size={size}
            leftSlot={leftSlot}
            rightSlot={rightSlot}
            disabled={disabled}
            readOnly={readOnly}
            {...props}
          />
        </FormField>
      );
    }

    // Sizes classes mapping strictly height, horizontal padding, and fonts
    const sizes: Record<"sm" | "md" | "lg", {
      input: string;
      left: string;
      right: string;
      leftSlotPadding: string;
      rightSlotPadding: string;
    }> = {
      sm: {
        input: "h-8 py-1.5 text-sm rounded-md",
        left: "pl-8",
        right: "pr-8",
        leftSlotPadding: "left-2.5",
        rightSlotPadding: "right-2.5",
      },
      md: {
        input: "h-10 py-2.5 text-sm rounded-md",
        left: "pl-10",
        right: "pr-10",
        leftSlotPadding: "left-3",
        rightSlotPadding: "right-3",
      },
      lg: {
        input: "h-12 py-3.5 text-base rounded-lg",
        left: "pl-12",
        right: "pr-12",
        leftSlotPadding: "left-4",
        rightSlotPadding: "right-4",
      },
    };

    // State machine precedence styling classes
    const stateClasses = disabled
      ? "bg-[var(--input-disabled-bg)] text-[var(--input-disabled-text)] border-[var(--input-disabled-border)] cursor-not-allowed opacity-50 select-none pointer-events-none"
      : readOnly
      ? "bg-[var(--input-readonly-bg)] text-[var(--input-readonly-text)] border-[var(--input-readonly-border)] cursor-default"
      : validationState === "error"
      ? "bg-[var(--input-error-bg)]/20 border-[var(--input-error-border)] focus-visible:ring-2 focus-visible:ring-[var(--input-error-ring)] focus-visible:border-[var(--input-error-border)]"
      : validationState === "warning"
      ? "bg-[var(--input-warning-bg)]/20 border-[var(--input-warning-border)] focus-visible:ring-2 focus-visible:ring-[var(--input-warning-ring)] focus-visible:border-[var(--input-warning-border)]"
      : validationState === "success"
      ? "bg-[var(--input-success-bg)]/20 border-[var(--input-success-border)] focus-visible:ring-2 focus-visible:ring-[var(--input-success-ring)] focus-visible:border-[var(--input-success-border)]"
      : "border-[var(--input-border)] hover:border-[var(--input-border-hover)] focus-visible:ring-2 focus-visible:ring-[var(--input-border-focus)] focus-visible:border-[var(--input-border-focus)]";

    // Legacy icon mapping
    const resolvedLeftSlot = leftSlot ? leftSlot : icon ? <Icon name={icon} size={18} /> : null;

    // Password visibility toggle component complying with accessibility guidelines
    const passwordToggle = type === "password" && showVisibilityToggle ? (
      <button
        type="button"
        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
        onMouseDown={(e) => e.preventDefault()} // Prevents focus theft
        className="text-muted hover:text-text focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 focus:outline-none select-none flex items-center justify-center h-8 w-8 rounded-full hover:bg-surface-2 cursor-pointer after:absolute after:inset-[-4px] relative shrink-0"
        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
      >
        {isPasswordVisible ? (
          <EyeOff size={18} aria-hidden="true" />
        ) : (
          <Eye size={18} aria-hidden="true" />
        )}
      </button>
    ) : null;

    const resolvedRightSlot = rightSlot ? rightSlot : passwordToggle;

    const sizeConfig = sizes[size];
    const leftPad = resolvedLeftSlot ? sizeConfig.left : "pl-4";
    const rightPad = resolvedRightSlot ? sizeConfig.right : "pr-4";

    return (
      <div className="relative w-full text-text inline-flex items-center">
        {resolvedLeftSlot && (
          <span
            className={`${sizeConfig.leftSlotPadding} absolute top-1/2 -translate-y-1/2 text-muted select-none flex items-center justify-center shrink-0`}
            aria-hidden="true"
          >
            {resolvedLeftSlot}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={validationState === "error" ? "true" : "false"}
          aria-required={required ? "true" : undefined}
          aria-readonly={readOnly ? "true" : undefined}
          aria-disabled={disabled ? "true" : undefined}
          style={{
            caretColor: "var(--input-caret)",
          }}
          className={`w-full text-[var(--input-text)] bg-[var(--input-bg)] outline-none border transition-all placeholder:text-[var(--input-placeholder)] ${stateClasses} ${sizeConfig.input} ${leftPad} ${rightPad} ${className}`}
          {...props}
        />
        
        {resolvedRightSlot && (
          <span
            className={`${sizeConfig.rightSlotPadding} absolute top-1/2 -translate-y-1/2 text-muted select-none flex items-center justify-center shrink-0`}
          >
            {resolvedRightSlot}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;