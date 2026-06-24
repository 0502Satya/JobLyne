"use client";

import React, { useState, useRef, useEffect, useId } from "react";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  delay?:     number;
  maxWidth?:  number;
};

export default function Tooltip({
  content,
  children,
  position = "top",
  className = "",
  delay = 200,
  maxWidth,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = `tooltip-${useId()}`;

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      <div
        id={tooltipId}
        role="tooltip"
        className={[
          "absolute bg-text text-bg text-xs px-2.5 py-1.5 rounded shadow-md pointer-events-none transition-opacity duration-150 ease-out",
          isVisible ? "opacity-100" : "opacity-0",
          positionStyles[position],
        ].join(" ")}
        style={{
          zIndex: "var(--z-tooltip)",
          maxWidth: maxWidth ? `${maxWidth}px` : undefined,
          whiteSpace: maxWidth ? "normal" : "nowrap",
        }}
      >
        {content}
      </div>
    </span>
  );
}
