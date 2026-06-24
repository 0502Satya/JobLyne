"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { UserCircle, X } from "lucide-react";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionText?: string;
}

export default function SignUpModal({
  isOpen,
  onClose,
  title = "Join JobLyne to continue",
  description = "Create a free candidate profile to search jobs, match your skills, apply to opportunities, and access premium courses.",
  actionText = "to perform this action"
}: SignUpModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Capture and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Short timeout to let the modal render and focus first element
      const timer = setTimeout(() => {
        if (containerRef.current) {
          const focusable = containerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex="0"]'
          );
          if (focusable.length > 0) {
            (focusable[0] as HTMLElement).focus();
          }
        }
      }, 50);

      return () => clearTimeout(timer);
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle Escape key and Tab key focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!containerRef.current) return;
        const focusable = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex="0"]'
        );
        if (focusable.length === 0) return;

        const firstEl = focusable[0] as HTMLElement;
        const lastEl = focusable[focusable.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="justify-center fade-in items-center inset-0 animate-in bg-card/60 flex backdrop-blur-sm duration-300 z-50 p-4 fixed"
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      {/* Backdrop Dismissal */}
      <div className="inset-0 absolute cursor-default" onClick={onClose}></div>
      
      {/* Modal Dialog Container */}
      <div 
        ref={containerRef}
        className="w-full border-border rounded-3xl relative overflow-hidden duration-200 scale-in flex-col animate-in p-6 max-w-md shadow-2xl flex gap-6 bg-surface border"
      >
        
        {/* Header Block */}
        <div className="border-border/40 border-b pb-3 items-center flex justify-between">
          <h3 id="modal-title" className="type-card-title items-center gap-2 flex font-bold text-text">
            <UserCircle size={24} className="text-primary font-bold" aria-hidden="true" />
            Account required
          </h3>
          <button 
            onClick={onClose}
            className="justify-center items-center bg-bg rounded-full h-8 flex w-8 text-muted hover:text-text hover:bg-border/20 transition-colors cursor-pointer select-none font-bold"
            aria-label="Close modal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex flex-col gap-2">
          <h4 className="text-text type-h3 leading-snug font-bold">{title}</h4>
          <p className="text-sm text-muted leading-relaxed mt-1">
            {description}
          </p>
          <p className="text-xs text-muted/80 italic mt-2">
            You must be logged in as a candidate {actionText}.
          </p>
        </div>

        {/* Actions Frame */}
        <div className="border-border/40 border-t gap-3 flex mt-2 pt-4 flex-col sm:flex-row">
          
          <button 
            onClick={onClose}
            className="flex-grow min-h-[44px] py-2.5 type-ui rounded-xl hover:bg-bg transition-colors text-muted hover:text-text font-semibold border-none cursor-pointer bg-transparent"
          >
            Cancel
          </button>
          
          <Link 
            href="/auth/signin"
            className="flex-grow min-h-[44px] py-2.5 text-center border border-primary text-primary type-ui rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center font-semibold"
          >
            Log in
          </Link>

          <Link 
            href="/auth/signup"
            className="flex-grow min-h-[44px] py-2.5 text-center shadow-lg shadow-primary/20 bg-primary text-white type-ui rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center font-semibold"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
