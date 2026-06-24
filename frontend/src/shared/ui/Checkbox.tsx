"use client";

import React, { forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import { AlertCircle } from "lucide-react";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  error?: string;
  helper?: string;
  state?: "default" | "valid" | "error";
  indeterminate?: boolean;
};

const STATE_CLASSES: Record<"default" | "valid" | "error", string> = {
  default: "border-input-border focus-visible:ring-primary",
  valid:   "border-success focus-visible:ring-success/30 text-success focus-visible:border-success",
  error:   "border-error focus-visible:ring-error/30 text-error focus-visible:border-error",
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className = "",
      label,
      error,
      helper,
      state,
      indeterminate,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || props.name || "";
    const localRef = useRef<HTMLInputElement>(null);

    // Expose localRef to parent component if ref is passed
    useImperativeHandle(ref, () => localRef.current!);

    // Handle indeterminate state on the DOM input element
    useEffect(() => {
      if (localRef.current) {
        localRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate]);

    const computedState = error ? "error" : (state || "default");

    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center min-h-[40px]">
          <input
            ref={localRef}
            id={checkboxId}
            type="checkbox"
            required={required}
            aria-invalid={computedState === "error" || undefined}
            className={[
              "h-4 w-4 cursor-pointer rounded transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border",
              computedState === "default" ? "text-primary bg-input-bg" : "",
              STATE_CLASSES[computedState],
              className,
            ].join(" ")}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm select-none cursor-pointer text-text ml-2 font-medium leading-tight"
            >
              {label}
              {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
            </label>
          )}
        </div>
        {helper && !error && (
          <p className="text-xs text-muted leading-normal pl-6">{helper}</p>
        )}
        {error && (
          <div className="text-error text-xs gap-1 items-center flex pl-6" role="alert">
            <AlertCircle size={14} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
