import React, { forwardRef } from "react";
import { ChevronsUpDown } from "lucide-react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
  className?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, className = "", ...props }, ref) => {
    return (
      <div className="relative w-full text-text">
        <select
          ref={ref}
          className={`w-full appearance-none outline-none transition-all rounded-xl py-3 pl-4 pr-10 border bg-input-bg border-input-border focus:ring-2 focus:border-primary focus:ring-primary placeholder:text-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronsUpDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted select-none" aria-hidden="true" />
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
