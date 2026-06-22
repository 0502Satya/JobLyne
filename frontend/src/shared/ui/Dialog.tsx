"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      className={`rounded-xl border border-border/60 bg-dialog-bg p-6 shadow-xl max-w-lg w-full outline-none backdrop:bg-black/40 backdrop:backdrop-blur-xs scale-in animate-in duration-200 ${className}`}
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          {title ? (
            <h3 className="type-card-title text-text">{title}</h3>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 cursor-pointer rounded-full hover:bg-surface-2 flex items-center justify-center text-muted hover:text-text transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="text-sm leading-relaxed text-text">{children}</div>
      </div>
    </dialog>
  );
}
