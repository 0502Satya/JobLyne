import React, { forwardRef, useId } from "react";
import { ChevronsUpDown, AlertCircle, CheckCircle2 } from "lucide-react";

/* ─── Specification ────────────────────────────────────────────────────────
 * Heights:       40px (md, default) | 32px (sm) | 48px (lg)
 * Padding:       px-4 pr-10 (chevron gap stays constant)
 * Border radius: 12px (rounded-xl)
 * Focus ring:    ring-2 ring-primary/30 border-primary
 *
 * validationState drives border + ring colour:
 *   none    → border-input-border  ring-primary/30 (default)
 *   success → border-success       ring-success/30
 *   error   → border-error         ring-error/30
 *
 * Using a single enum prevents the impossible combo error="..." + isValid={true}.
 * aria-describedby links both helper and error text to the <select> for screen readers.
 * ─────────────────────────────────────────────────────────────────────────── */

type SelectSize = "sm" | "md" | "lg";
type ValidationState = "none" | "success" | "error";

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  options:          { value: string; label: string }[];
  /** Visible label rendered above the select */
  label?:           React.ReactNode;
  /** Neutral hint text shown below the select (hidden when validationState="error") */
  helper?:          string;
  /** Error message shown below the select when validationState="error" */
  error?:           string;
  /** Controls border/ring colour — single enum prevents impossible state combos */
  validationState?: ValidationState;
  size?:            SelectSize;
  className?:       string;
};

const HEIGHT_CLASSES: Record<SelectSize, string> = {
  sm: "min-h-[32px] py-1.5 text-xs",
  md: "min-h-[40px] py-2.5 text-sm",
  lg: "min-h-[48px] py-3   text-base",
};

const VALIDATION_CLASSES: Record<ValidationState, string> = {
  none:    "border-input-border focus:border-primary   focus:ring-primary/30",
  success: "border-success      focus:border-success   focus:ring-success/30",
  error:   "border-error        focus:border-error     focus:ring-error/30",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      helper,
      error,
      validationState = "none",
      size = "md",
      className = "",
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const autoId       = useId();
    const selectId     = id ?? autoId;
    const helperId     = `${selectId}-helper`;
    const errorId      = `${selectId}-error`;
    const describedBy  = [
      validationState === "error" && error    ? errorId  : "",
      validationState !== "error" && helper   ? helperId : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-text leading-tight"
          >
            {label}
            {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        {/* Select wrapper */}
        <div className="relative w-full text-text">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-invalid={validationState === "error" || undefined}
            aria-describedby={describedBy}
            className={[
              // Base
              "w-full appearance-none outline-none transition-all rounded-xl pl-4 pr-10 border",
              "bg-input-bg text-text",
              // Focus ring
              "focus:outline-none focus:ring-2",
              // Disabled
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Cursor
              disabled ? "cursor-not-allowed" : "cursor-pointer",
              // Height
              HEIGHT_CLASSES[size],
              // Validation state
              VALIDATION_CLASSES[validationState],
              className,
            ].join(" ")}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Trailing icon — validation icon overrides chevron when state is active */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-muted select-none" aria-hidden="true">
            {validationState === "error"   && <AlertCircle  size={16} className="text-error"   />}
            {validationState === "success" && <CheckCircle2 size={16} className="text-success" />}
            {validationState === "none"    && <ChevronsUpDown size={16} />}
          </div>
        </div>

        {/* Helper text */}
        {validationState !== "error" && helper && (
          <p id={helperId} className="text-xs text-muted leading-normal pl-0.5">
            {helper}
          </p>
        )}

        {/* Error text */}
        {validationState === "error" && error && (
          <div id={errorId} className="text-error text-xs gap-1 items-center flex pl-0.5" role="alert">
            <AlertCircle size={14} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
