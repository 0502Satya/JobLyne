"use client";

import React from "react";
import Dialog from "./Dialog";
import Button from "./Button";
import Text from "./Text";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "primary" | "danger" | "warning" | "success";
  isLoading?: boolean;
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  // Map dialog status (default | destructive | warning | info) from variant
  const dialogStatusMap = {
    primary: "default" as const,
    danger: "destructive" as const,
    warning: "warning" as const,
    success: "info" as const,
  };

  const dialogStatus = dialogStatusMap[variant] || "default";

  // Map button variant
  const buttonVariantMap = {
    primary: "primary" as const,
    danger: "danger" as const,
    warning: "primary" as const,
    success: "primary" as const,
  };

  const buttonVariant = buttonVariantMap[variant] || "primary";

  // Enforce named confirmation button labels rather than generic "Yes"/"No"/"Ok"
  const isGenericLabel = ["yes", "no", "ok", "confirm", "continue", "submit"].includes(
    confirmLabel.toLowerCase().trim()
  );

  if (isGenericLabel && process.env.NODE_ENV !== "production") {
    console.warn(
      `[ConfirmDialog] Warning: The confirmLabel "${confirmLabel}" is generic. The Product Design Handbook requires specific, named action labels (e.g. "Delete Experience") to reduce cognitive load and prevent accidental errors.`
    );
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      status={dialogStatus}
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            status={variant === "success" ? "success" : "default"}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {typeof description === "string" ? (
        <Text variant="body" color="muted">
          {description}
        </Text>
      ) : (
        description
      )}
    </Dialog>
  );
}
