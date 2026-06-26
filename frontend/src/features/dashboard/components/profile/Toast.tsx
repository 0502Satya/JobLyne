"use client";

import React, { useEffect, useState } from "react";
import Icon from "@/shared/ui/Icon";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  const icon = type === "success" ? "check_circle" : type === "error" ? "error" : "info";
  const iconColor = type === "success" ? "text-success" : type === "error" ? "text-error" : "text-info";

  return (
    <div className={`-translate-x-1/2 transition-all left-1/2 duration-300 bottom-6 z-tooltip fixed ${isVisible ? 'translate-y-0 opacity-100' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="bg-card rounded-xl items-center gap-2 text-white py-3 type-ui shadow-xl flex px-5 dark:text-text dark:bg-surface">
        <Icon name={icon} size={16} className={iconColor} />
        <span>{message}</span>
      </div>
    </div>
  );
}
