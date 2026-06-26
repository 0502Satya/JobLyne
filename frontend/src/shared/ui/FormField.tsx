import React, { useId } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import Text from "./Text";

export type FormFieldStatus = "default" | "success" | "warning" | "info" | "error";

type FormFieldProps = {
  children: React.ReactElement<any>;
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  status?: FormFieldStatus;
  className?: string;
  labelAction?: React.ReactNode;
};

// Hook to generate structured field IDs dynamically
export function useFieldIds(customId?: string) {
  const generatedId = useId();
  const baseId = customId || generatedId;
  return {
    inputId: baseId,
    errorId: `${baseId}-error`,
    hintId: `${baseId}-hint`,
  };
}

export default function FormField({
  children,
  label,
  error,
  helper,
  required = false,
  status,
  className = "",
  labelAction,
}: FormFieldProps) {
  const childProps = children.props as any;
  // Pick child id, fallback to inputId from useFieldIds
  const customId = childProps.id || childProps.name;
  const { inputId, errorId, hintId } = useFieldIds(customId);

  // Determine status (error overrides, status defaults to error if error prop exists)
  const activeStatus: FormFieldStatus = error ? "error" : status || "default";

  // Build status style classes for focus and border rings
  const statusBorderClasses = {
    default: "",
    success: "border-success! focus:ring-success! focus:border-success!",
    warning: "border-warning! focus:ring-warning! focus:border-warning!",
    info: "border-info! focus:ring-info! focus:border-info!",
    error: "border-error! focus:ring-error! focus:border-error!",
  }[activeStatus];

  // Map status colors for texts
  const statusColor = {
    default: "muted" as const,
    success: "success" as const,
    warning: "warning" as const,
    info: "info" as const,
    error: "error" as const,
  }[activeStatus];

  // Icons
  const StatusIcon = {
    default: null,
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
    error: AlertCircle,
  }[activeStatus];

  // Build aria-describedby links
  const hasDescription = error || helper || activeStatus !== "default";
  const ariaDescribedBy = [
    error && errorId,
    helper && hintId,
    activeStatus !== "default" && `${inputId}-status-msg`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`space-y-1.5 w-full text-left ${className}`}>
      {label && (
        <div className="flex justify-between items-center w-full">
          <label className="text-muted type-caption block uppercase tracking-wider" htmlFor={inputId}>
            {label}
            {required ? (
              <span className="text-error ml-1 select-none" aria-hidden="true">*</span>
            ) : (
              <span className="text-[10px] text-muted ml-1.5 font-normal normal-case">(optional)</span>
            )}
          </label>
          {labelAction && (
            <div className="text-xs font-normal normal-case leading-none">
              {labelAction}
            </div>
          )}
        </div>
      )}

      {React.cloneElement(children, {
        id: inputId,
        "aria-invalid": activeStatus === "error" ? "true" : "false",
        "aria-describedby": hasDescription ? ariaDescribedBy : undefined,
        className: `${childProps.className || ""} ${statusBorderClasses}`,
      })}

      {/* Renders validation/error message or helper text */}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-error text-xs flex items-center gap-1.5 mt-1 font-medium"
        >
          <AlertCircle size={14} className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : activeStatus !== "default" && helper ? (
        <p
          id={`${inputId}-status-msg`}
          className={`text-${statusColor} text-xs flex items-center gap-1.5 mt-1 font-medium`}
        >
          {StatusIcon && <StatusIcon size={14} className="shrink-0" aria-hidden="true" />}
          {helper}
        </p>
      ) : helper ? (
        <p id={hintId} className="text-muted text-xs mt-1">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
