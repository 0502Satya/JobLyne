import React from "react";
import Button from "./Button";
import Icon from "./Icon";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  icon = "inbox",
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 bg-surface-0 rounded-lg max-w-md mx-auto ${className}`}
    >
      <div className="h-16 w-16 rounded-full bg-surface-2 flex items-center justify-center text-muted mb-6">
        <Icon name={icon} size={32} aria-hidden="true" />
      </div>
      <h3 className="type-h3 text-text mb-2">{title}</h3>
      <p className="type-body-sm text-muted mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
