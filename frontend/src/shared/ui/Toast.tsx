import { toast as hotToast, ToastOptions } from "react-hot-toast";
import React from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const baseToastStyles =
  "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg type-ui font-medium animate-in slide-in-from-top-2 duration-200 bg-card-bg border-border/40 text-text max-w-sm";

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <div
          className={`${baseToastStyles} border-success/20 bg-success-bg/10 text-success`}
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
          className={`${baseToastStyles} border-error/20 bg-error-bg/10 text-error`}
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
          className={`${baseToastStyles} border-info/20 bg-info-bg/10 text-info`}
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
          className={`${baseToastStyles} border-warning/20 bg-warning-bg/10 text-warning`}
          style={{ zIndex: "var(--z-toast)" }}
        >
          <AlertTriangle size={20} aria-hidden="true" />
          <span className="text-text text-sm">{message}</span>
        </div>
      ),
      options
    );
  },
  dismiss: (toastId?: string) => hotToast.dismiss(toastId),
};

export default toast;
