import React from "react";
import Button from "./Button";
import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export default function ErrorState({
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again or contact support if the issue persists.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-error/15 bg-error-bg/5 rounded-lg max-w-md mx-auto ${className}`}
    >
      <div className="h-12 w-12 rounded-full bg-error-bg flex items-center justify-center text-error mb-4">
        <AlertCircle size={24} aria-hidden="true" />
      </div>
      <h3 className="type-h3 text-text mb-2">{title}</h3>
      <p className="type-body-sm text-muted mb-6 leading-relaxed">{description}</p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} className="min-w-[120px]">
          Try Again
        </Button>
      )}
    </div>
  );
}
