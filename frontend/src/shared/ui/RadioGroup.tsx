"use client";

import React, {
  createContext,
  useContext,
  useId,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { AlertCircle } from "lucide-react";

/* ─── Specification ────────────────────────────────────────────────────────
 * Orientation: horizontal | vertical (default: vertical)
 * Roving focus: Tab lands on selected, arrow keys cycle and select, tab exits
 * Semantics: fieldset + legend + aria-describedby for assistive text
 * Disabled behavior: Group-level (opacity-50, pointer-events-none), Item-level (remains visible, skipped by arrow keys)
 * ─────────────────────────────────────────────────────────────────────────── */

type RadioGroupContextType = {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  state?: "default" | "valid" | "error";
  registerItem: (value: string, disabled: boolean) => void;
  unregisterItem: (value: string) => void;
  activeTabbableValue: string | null;
};

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

type RadioGroupProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: React.ReactNode;
  helper?: string;
  error?: string;
  state?: "default" | "valid" | "error";
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
  className?: string;
};

export function RadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  label,
  helper,
  error,
  state = "default",
  disabled = false,
  orientation = "vertical",
  children,
  className = "",
}: RadioGroupProps) {
  const autoName = useId();
  const groupName = name || autoName;
  const helperId = `${groupName}-helper`;
  const errorId = `${groupName}-error`;
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);

  const [registeredItems, setRegisteredItems] = useState<{ value: string; disabled: boolean }[]>([]);
  const [internalValue, setInternalValue] = useState(defaultValue);

  const registerItem = useCallback((val: string, dis: boolean) => {
    setRegisteredItems((prev) => {
      const existing = prev.find((item) => item.value === val);
      if (existing && existing.disabled === dis) return prev;
      const filtered = prev.filter((item) => item.value !== val);
      return [...filtered, { value: val, disabled: dis }];
    });
  }, []);

  const unregisterItem = useCallback((val: string) => {
    setRegisteredItems((prev) => prev.filter((item) => item.value !== val));
  }, []);

  const currentValue = value !== undefined ? value : internalValue;
  const computedState = error ? "error" : state;

  const handleValueChange = (val: string) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    if (onChange) {
      onChange(val);
    }
  };

  // Determine roving focus: which item should get tabIndex=0
  const enabledItems = registeredItems.filter((item) => !item.disabled && !disabled);
  const firstEnabledValue = enabledItems[0]?.value || null;

  // The active item is either the currently selected value, or if none is selected, the first enabled option
  const activeTabbableValue = registeredItems.some((item) => item.value === currentValue)
    ? (currentValue || null)
    : firstEnabledValue;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFieldSetElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();

    if (enabledItems.length === 0) return;

    const currentTabbable = activeTabbableValue || enabledItems[0]?.value;
    const currentIndex = enabledItems.findIndex((item) => item.value === currentTabbable);

    let nextIndex = 0;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % enabledItems.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      nextIndex = currentIndex === -1 ? enabledItems.length - 1 : (currentIndex - 1 + enabledItems.length) % enabledItems.length;
    }

    const nextValue = enabledItems[nextIndex].value;
    
    // Focus the target input element
    const inputEl = fieldsetRef.current?.querySelector<HTMLInputElement>(
      `input[value="${CSS.escape(nextValue)}"]`
    );
    inputEl?.focus();
    handleValueChange(nextValue);
  };

  const describedBy = [
    computedState === "error" && error ? errorId : "",
    computedState !== "error" && helper ? helperId : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <RadioGroupContext.Provider
      value={{
        name: groupName,
        value: currentValue,
        onChange: handleValueChange,
        disabled,
        state: computedState,
        registerItem,
        unregisterItem,
        activeTabbableValue,
      }}
    >
      <fieldset
        ref={fieldsetRef}
        role="radiogroup"
        aria-describedby={describedBy}
        onKeyDown={handleKeyDown}
        className={[
          "border-none p-0 m-0 w-full flex flex-col gap-1.5",
          disabled ? "opacity-50 pointer-events-none" : "",
          className,
        ].join(" ")}
      >
        {label && (
          <legend className="text-sm font-medium text-text leading-tight mb-2">
            {label}
          </legend>
        )}

        <div className={orientation === "horizontal" ? "flex flex-row flex-wrap gap-4" : "flex flex-col gap-2"}>
          {children}
        </div>

        {/* Helper message */}
        {computedState !== "error" && helper && (
          <p id={helperId} className="text-xs text-muted leading-normal pl-0.5 mt-1">
            {helper}
          </p>
        )}

        {/* Error message */}
        {computedState === "error" && error && (
          <div id={errorId} className="text-error text-xs gap-1 items-center flex pl-0.5 mt-1" role="alert">
            <AlertCircle size={14} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

type RadioItemProps = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function RadioItem({
  value,
  label,
  disabled = false,
  id,
  className = "",
}: RadioItemProps) {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioItem must be used within a RadioGroup component");
  }

  const {
    name,
    value: selectedValue,
    onChange,
    disabled: groupDisabled,
    state: groupState,
    registerItem,
    unregisterItem,
    activeTabbableValue,
  } = context;

  const isItemDisabled = !!(disabled || groupDisabled);
  const isChecked = selectedValue === value;
  const isTabbable = activeTabbableValue === value;

  const autoId = useId();
  const itemId = id || `${name}-item-${value}-${autoId}`;

  useEffect(() => {
    registerItem(value, isItemDisabled);
    return () => unregisterItem(value);
  }, [value, isItemDisabled, registerItem, unregisterItem]);

  const computedState = groupState || "default";

  const getRadioCircleClasses = () => {
    const base = "h-5 w-5 rounded-full border flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2";
    
    if (isItemDisabled) {
      return `${base} opacity-40 cursor-not-allowed border-input-border bg-input-bg`;
    }

    const focusRing = {
      default: "peer-focus-visible:ring-primary",
      valid:   "peer-focus-visible:ring-success/30",
      error:   "peer-focus-visible:ring-error/30",
    }[computedState];

    if (isChecked) {
      const checkedColors = {
        default: "bg-primary border-primary text-white",
        valid:   "bg-success border-success text-white",
        error:   "bg-error border-error text-white",
      }[computedState];
      return `${base} ${focusRing} ${checkedColors}`;
    } else {
      const uncheckedColors = {
        default: "border-input-border bg-input-bg hover:border-border/80",
        valid:   "border-success bg-input-bg",
        error:   "border-error bg-input-bg",
      }[computedState];
      return `${base} ${focusRing} ${uncheckedColors}`;
    }
  };

  return (
    <label
      htmlFor={itemId}
      className={[
        "flex items-center gap-3 select-none text-text min-h-[40px] px-0.5",
        isItemDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      ].join(" ")}
    >
      <input
        type="radio"
        id={itemId}
        name={name}
        value={value}
        checked={isChecked}
        disabled={isItemDisabled}
        tabIndex={isTabbable ? 0 : -1}
        onChange={() => !isItemDisabled && onChange?.(value)}
        className="sr-only peer"
      />
      
      {/* Custom Radio Ring */}
      <div className={getRadioCircleClasses()} aria-hidden="true">
        <div
          className={[
            "h-2 w-2 rounded-full bg-current transition-transform duration-150",
            isChecked ? "scale-100" : "scale-0",
          ].join(" ")}
        />
      </div>

      {/* Label Text */}
      <span className={isItemDisabled ? "text-muted" : "text-text font-medium text-sm"}>
        {label}
      </span>
    </label>
  );
}
