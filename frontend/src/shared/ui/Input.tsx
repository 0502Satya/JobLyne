"use client";

import React, { forwardRef, useState } from "react";
import FormField from "./FormField";
import Icon from "./Icon";
import { Eye, EyeOff } from "lucide-react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: string;
  showVisibilityToggle?: boolean;
  label?: string;
  error?: string;
  helper?: string;
  isValid?: boolean;
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
      required,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputId = id || props.name || "";
    const resolvedType =
      type === "password" && showVisibilityToggle && isPasswordVisible
        ? "text"
        : type;

    if (label || error || helper) {
      return (
        <FormField
          label={label}
          error={error}
          helper={helper}
          required={required}
        >
          <Input
            ref={ref}
            icon={icon}
            type={type}
            showVisibilityToggle={showVisibilityToggle}
            id={inputId}
            required={required}
            className={className}
            error={error}
            isValid={isValid}
            {...props}
          />
        </FormField>
      );
    }

    const stateBorderClass = error
      ? "border-error! focus:ring-error! focus:border-error!"
      : isValid
      ? "border-success! focus:ring-success! focus:border-success!"
      : "border-input-border focus:ring-primary focus:border-primary";

    return (
      <div className="relative w-full text-text">
        {icon && (
          <span
            className="left-3 absolute top-1/2 -translate-y-1/2 text-muted select-none"
            aria-hidden="true"
          >
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          required={required}
          className={`w-full text-text outline-none transition-all rounded-md py-3 border bg-input-bg focus:ring-2 placeholder:text-muted disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-surface-2/60 read-only:text-muted read-only:border-border/40 read-only:cursor-default read-only:focus:ring-0 read-only:focus:border-border/40 ${stateBorderClass} ${
            icon ? "pl-10" : "pl-4"
          } ${
            type === "password" && showVisibilityToggle ? "pr-10" : "pr-4"
          } ${className}`}
          {...props}
        />
        {type === "password" && showVisibilityToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text focus:outline-none select-none flex items-center justify-center h-8 w-8 rounded-full hover:bg-surface-2 cursor-pointer"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;