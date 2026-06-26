import { toast as hotToast, ToastOptions } from "react-hot-toast";
import React from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const baseToastStyles = [
  "flex items-center gap-3 px-4 py-3 max-w-sm font-medium transition-all duration-200",
  "rounded-[var(--toast-radius)] border border-[var(--toast-border)] bg-[var(--toast-bg)] [box-shadow:var(--toast-shadow)]",
  "type-ui text-text",
  "animate-in slide-in-from-top-2",
].join(" ");

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <div
          role="status"
          aria-live="polite"
          className={`${baseToastStyles} border-[var(--color-success)]/20 bg-[var(--color-success-bg)] text-[var(--color-success)]`}
          style={{ zIndex: "var(--z-toast)" }}
        >
          <CheckCircle size={20} aria-hidden="true" />
          <span className="text-text text-sm">{message}</span>
        </div>
      ),
      options
    );
  },
  error: (message: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <div
          role="alert"
          aria-live="assertive"
          className={`${baseToastStyles} border-[var(--color-error)]/20 bg-[var(--color-error-bg)] text-[var(--color-error)]`}
          style={{ zIndex: "var(--z-toast)" }}
        >
          <AlertCircle size={20} aria-hidden="true" />
          <span className="text-text text-sm">{message}</span>
        </div>
      ),
      options
    );
  },
  info: (message: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <div
          role="status"
          aria-live="polite"
          className={`${baseToastStyles} border-[var(--color-info)]/20 bg-[var(--color-info-bg)] text-[var(--color-info)]`}
          style={{ zIndex: "var(--z-toast)" }}
        >
          <Info size={20} aria-hidden="true" />
          <span className="text-text text-sm">{message}</span>
        </div>
      ),
      options
    );
  },
  warning: (message: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <div
          role="status"
          aria-live="polite"
          className={`${baseToastStyles} border-[var(--color-warning)]/20 bg-[var(--color-warning-bg)] text-[var(--color-warning)]`}
          style={{ zIndex: "var(--z-toast)" }}
        >
          <AlertTriangle size={20} aria-hidden="true" />
          <span className="text-text text-sm">{message}</span>
        </div>
      ),
      options
    );
  },
  custom: (message: any, options?: ToastOptions) => {
    return hotToast.custom(message, options);
  },
  dismiss: (toastId?: string) => hotToast.dismiss(toastId),
};

export default toast;
