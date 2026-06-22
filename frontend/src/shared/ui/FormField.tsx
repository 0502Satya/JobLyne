import React from "react";
import { AlertCircle } from "lucide-react";

type FormFieldProps = {
  children: React.ReactElement<any>;
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  className?: string;
};

export default function FormField({
  children,
  label,
  error,
  helper,
  required = false,
  className = "",
}: FormFieldProps) {
  const childProps = children.props as any;
  const childId = childProps.id || childProps.name || "";

  return (
    <div className={`space-y-1.5 w-full text-left ${className}`}>
      {label && (
        <label className="text-muted type-caption block uppercase tracking-wider" htmlFor={childId}>
          {label}
          {required ? (
            <span className="text-error ml-1 select-none" aria-hidden="true">*</span>
          ) : (
            <span className="text-[10px] text-muted ml-1.5 font-normal normal-case">(optional)</span>
          )}
        </label>
      )}
      
      {React.cloneElement(children, {
        id: childId,
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": error
          ? `${childId}-error`
          : helper
          ? `${childId}-hint`
          : undefined,
        className: `${childProps.className || ""} ${
          error ? "border-error! focus:ring-error! focus:border-error!" : ""
        }`,
      })}

      {error ? (
        <p
          id={`${childId}-error`}
          role="alert"
          className="text-error text-xs flex items-center gap-1 mt-1 font-medium"
        >
          <AlertCircle size={14} className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : helper ? (
        <p id={`${childId}-hint`} className="text-muted text-xs mt-1">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
