"use client";

import React, { useState } from "react";
import Icon from "./Icon";

type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: string;
};

type TabsProps = {
  items: TabItem[];
  defaultTabId?: string;
  onChange?: (id: string) => void;
  className?: string;
};

export default function Tabs({ items, defaultTabId, onChange, className = "" }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || items[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTabId(id);
    if (onChange) onChange(id);
  };

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      <div 
        role="tablist" 
        className="flex border-b border-border/60 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {items.map((item) => {
          const isActive = item.id === activeTabId;
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 -mb-[1px] transition-all duration-150 outline-none whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-text hover:border-border/60"
              }`}
            >
              {item.icon && (
                <Icon name={item.icon} size={18} aria-hidden="true" />
              )}
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`tabpanel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${item.id}`}
          className={item.id === activeTabId ? "block animate-in fade-in-50 duration-200" : "hidden"}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
