"use client";

import React, { useEffect, useRef, useId } from "react";
import { X, AlertTriangle, Info, AlertCircle } from "lucide-react";

/* ─── Specification ────────────────────────────────────────────────────────
 * Sizes:   sm (max-w-sm) | md (max-w-lg, default) | lg (max-w-2xl) | full (max-w-full)
 * Status:  default | destructive | warning | info
 *          → drives a 4px left-border strip on the header
 * Footer:  optional ReactNode rendered in a sticky bottom action row
 *
 * Accessibility (§16 — required):
 *   - On open:  save document.activeElement; move focus to first focusable child
 *   - While open: Tab / Shift+Tab cycles inside dialog only (focus trap)
 *   - On close:   restore focus to the saved trigger element
 *   - Esc:       handled by native <dialog> cancel event
 *   - role="dialog" aria-modal="true" aria-labelledby wired to title
 * ─────────────────────────────────────────────────────────────────────────── */

type DialogSize = "sm" | "md" | "lg" | "full";
type DialogStatus = "default" | "destructive" | "warning" | "info";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: DialogSize;
  status?: DialogStatus;
  className?: string;
};

// All elements that can receive keyboard focus
const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZE_CLASSES: Record<DialogSize, string> = {
  sm:   "max-w-sm",
  md:   "max-w-lg",
  lg:   "max-w-2xl",
  full: "max-w-full",
};

const STATUS_BORDER: Record<DialogStatus, string> = {
  default:     "",
  destructive: "border-l-4 border-l-error",
  warning:     "border-l-4 border-l-warning",
  info:        "border-l-4 border-l-info",
};

const STATUS_ICON: Record<DialogStatus, React.ReactNode> = {
  default:     null,
  destructive: <AlertCircle size={18} className="text-error shrink-0" aria-hidden="true" />,
  warning:     <AlertTriangle size={18} className="text-warning shrink-0" aria-hidden="true" />,
  info:        <Info size={18} className="text-info shrink-0" aria-hidden="true" />,
};

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  status = "default",
  className = "",
}: DialogProps) {
  const dialogRef      = useRef<HTMLDialogElement>(null);
  // Saves the element that triggered the dialog so we can restore focus on close
  const triggerRef     = useRef<Element | null>(null);
  const titleId        = useId();

  // ── Open / Close lifecycle ──────────────────────────────────────────────
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // 1. Save the current focused element as the trigger
      triggerRef.current = document.activeElement;
      if (!dialog.open) {
        dialog.showModal();
      }
      // 2. Move focus to the first focusable element inside the dialog
      requestAnimationFrame(() => {
        const firstFocusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)[0];
        firstFocusable?.focus();
      });
    } else {
      if (dialog.open) {
        dialog.close();
      }
      // 6. Restore focus to the element that opened the dialog
      if (triggerRef.current && "focus" in triggerRef.current) {
        (triggerRef.current as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  // ── Focus Trap ──────────────────────────────────────────────────────────
  // Intercepts Tab / Shift+Tab to cycle within the dialog's focusable children only
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => !el.closest("[disabled]"));

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: wrap from first to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: wrap from last to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  // ── Cancel (Esc) ────────────────────────────────────────────────────────
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className={[
        // Base
        "rounded-2xl border border-border/60 bg-dialog-bg shadow-xl outline-none",
        "w-full p-0",
        "backdrop:bg-black/40 backdrop:backdrop-blur-xs",
        // Entry animation — respects prefers-reduced-motion
        "motion-safe:animate-in motion-safe:scale-in motion-safe:duration-200",
        SIZE_CLASSES[size],
        STATUS_BORDER[status],
        className,
      ].join(" ")}
      style={{ zIndex: "var(--z-modal)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {STATUS_ICON[status]}
          {title ? (
            <h3 id={titleId} className="type-card-title text-text truncate">
              {title}
            </h3>
          ) : (
            <div id={titleId} />
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className={[
            "flex-shrink-0 h-8 w-8 cursor-pointer rounded-full",
            "flex items-center justify-center text-muted",
            "hover:bg-surface-2 hover:text-text transition-colors",
            // Explicit focus ring (§16 — never remove outline without a replacement)
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          ].join(" ")}
          aria-label="Close dialog"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 text-sm leading-relaxed text-text">
        {children}
      </div>

      {/* ── Footer (optional) ───────────────────────────────────────────── */}
      {footer && (
        <div className="flex items-center justify-end gap-3 border-t border-border/40 px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
