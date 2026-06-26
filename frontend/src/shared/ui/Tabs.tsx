"use client";

/**
 * Tabs Specification Block:
 * Heights:        Underline: Auto/determined by vertical padding; Pill list: ~40px height for tablist container.
 * Padding:        Tab buttons: Underline variant has py-3 px-4, Pill variant has py-2 px-4.
 * Border radius:  Underline: None; Pill tab: rounded-lg (8px); Pill container: rounded-xl (12px)
 * Typography:     14px text (text-sm), font-medium (weight 500)
 * Icon gap:        8px (gap-2) between icon and text
 * Focus ring:      2px (focus-visible:ring-2), offset 2px, visible on :focus-visible only
 * Keyboard:       ArrowLeft/Right to move focus, Home to first, End to last, Enter/Space to activate. Roving tabIndex managed dynamically.
 * Variants:       Underline (default), Pill
 * 
 * Keyboard navigation — MANUAL ACTIVATION pattern (WAI-ARIA recommended
 * for content that is expensive to switch, e.g. data-heavy panels):
 *   ArrowLeft / ArrowRight  →  moves FOCUS only; does NOT switch active tab
 *   Home                    →  focus first enabled tab
 *   End                     →  focus last enabled tab
 *   Enter / Space           →  activates the focused (but not yet selected) tab
 *
 * Accessibility (§16):
 *   - role="tablist" on the container
 *   - role="tab" + aria-selected + aria-controls on each button
 *   - role="tabpanel" + aria-labelledby on each panel
 *   - Roving tabIndex: active=0, rest=-1 (focus managed via ref array)
 *   - Disabled tabs: aria-disabled + pointer-events-none
 */

import React, { useState, useRef, useId } from "react";
import Icon from "./Icon";

type TabVariant = "underline" | "pill";

export type TabItem = {
  id:        string;
  label:     string;
  content:   React.ReactNode;
  icon?:     string;
  /** When true the tab button is visible but not activatable */
  disabled?: boolean;
};

type TabsProps = {
  items:         TabItem[];
  defaultTabId?: string;
  onChange?:     (id: string) => void;
  variant?:      TabVariant;
  className?:    string;
};

export default function Tabs({
  items,
  defaultTabId,
  onChange,
  variant = "underline",
  className = "",
}: TabsProps) {
  const [activeTabId,  setActiveTabId]  = useState(defaultTabId || items[0]?.id);
  // Separate "focused but not yet activated" tab for manual-activation pattern
  const [focusedTabId, setFocusedTabId] = useState<string | null>(null);

  const baseId    = useId();
  const tabRefs   = useRef<(HTMLButtonElement | null)[]>([]);
  const enabledItems = items.filter((t) => !t.disabled);

  // ── Activate tab ──────────────────────────────────────────────────────
  const handleTabActivate = (id: string) => {
    setActiveTabId(id);
    setFocusedTabId(null);
    if (onChange) onChange(id);
  };

  // ── Keyboard navigation ───────────────────────────────────────────────
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    const allIndices = items.map((_, i) => i);
    const enabledIndices = allIndices.filter((i) => !items[i].disabled);

    const currentEnabledPos = enabledIndices.indexOf(currentIndex);

    let nextEnabledIndex: number | null = null;

    switch (e.key) {
      case "ArrowRight": {
        e.preventDefault();
        const next = (currentEnabledPos + 1) % enabledIndices.length;
        nextEnabledIndex = enabledIndices[next];
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        const prev =
          (currentEnabledPos - 1 + enabledIndices.length) % enabledIndices.length;
        nextEnabledIndex = enabledIndices[prev];
        break;
      }
      case "Home": {
        e.preventDefault();
        nextEnabledIndex = enabledIndices[0];
        break;
      }
      case "End": {
        e.preventDefault();
        nextEnabledIndex = enabledIndices[enabledIndices.length - 1];
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        // Activate the currently focused tab (manual-activation pattern)
        const focused = focusedTabId ?? activeTabId;
        if (focused) handleTabActivate(focused);
        return;
      }
      default:
        return;
    }

    if (nextEnabledIndex !== null) {
      const nextId = items[nextEnabledIndex].id;
      setFocusedTabId(nextId);
      tabRefs.current[nextEnabledIndex]?.focus();
    }
  };

  // ── Style helpers ─────────────────────────────────────────────────────
  const getTabClasses = (item: TabItem): string => {
    const isActive   = item.id === activeTabId;
    const isFocused  = item.id === focusedTabId;
    const isDisabled = !!item.disabled;

    const base = [
      "flex items-center gap-2 text-sm font-medium outline-none whitespace-nowrap cursor-pointer",
      "transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded",
    ].join(" ");

    if (isDisabled) {
      return `${base} opacity-40 cursor-not-allowed pointer-events-none`;
    }

    if (variant === "underline") {
      return [
        base,
        "py-3 px-4 border-b-2 -mb-[1px]",
        isActive
          ? "border-primary text-primary"
          : isFocused
          ? "border-border text-text"
          : "border-transparent text-muted hover:text-text hover:border-border/60",
      ].join(" ");
    }

    // pill variant
    return [
      base,
      "py-2 px-4 rounded-lg",
      isActive
        ? "bg-primary text-white shadow-sm"
        : isFocused
        ? "bg-surface-2 text-text"
        : "text-muted hover:text-text hover:bg-surface-2/60",
    ].join(" ");
  };

  const listClasses =
    variant === "underline"
      ? "flex border-b border-border/60 overflow-x-auto no-scrollbar scroll-smooth"
      : "flex gap-1 p-1 rounded-xl bg-surface-2/40 overflow-x-auto no-scrollbar scroll-smooth";

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {/* Tab list */}
      <div role="tablist" className={listClasses}>
        {items.map((item, index) => {
          const isActive = item.id === activeTabId;
          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${item.id}`}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${item.id}`}
              aria-disabled={item.disabled || undefined}
              // Roving tabIndex: only the active tab is in the natural tab order
              tabIndex={isActive ? 0 : -1}
              onClick={() => !item.disabled && handleTabActivate(item.id)}
              onKeyDown={(e) => !item.disabled && handleKeyDown(e, index)}
              onFocus={() => !isActive && setFocusedTabId(item.id)}
              onBlur={() => setFocusedTabId(null)}
              className={getTabClasses(item)}
            >
              {item.icon && (
                <Icon name={item.icon} size={18} aria-hidden="true" />
              )}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {items.map((item) => (
        <div
          key={item.id}
          id={`${baseId}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${item.id}`}
          // Hidden panels are removed from accessibility tree
          hidden={item.id !== activeTabId}
          className={
            item.id === activeTabId
              ? "motion-safe:animate-in motion-safe:fade-in-50 motion-safe:duration-200"
              : ""
          }
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
