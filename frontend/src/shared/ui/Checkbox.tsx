"use client";

import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  error?: string;
  helper?: string;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, error, helper, id, required, ...props }, ref) => {
    const checkboxId = id || props.name || "";

    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center min-h-[40px]">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            required={required}
            className={`text-primary border-input-border h-4 w-4 cursor-pointer rounded focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm select-none cursor-pointer text-text ml-2 font-medium leading-tight"
            >
              {label}
              {required && <span className="text-error ml-0.5">*</span>}
            </label>
          )}
        </div>
        {helper && !error && (
          <p className="text-xs text-muted leading-normal pl-6">{helper}</p>
        )}
        {error && (
          <div className="text-error text-xs gap-1 items-center flex pl-6">
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
