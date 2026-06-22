"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

type ComboboxProps = {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export default function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className = "",
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative w-full text-text ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left outline-none transition-all rounded-xl py-3 pl-4 pr-10 border bg-input-bg border-input-border focus:ring-2 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-between"
      >
        <span className={selectedOption ? "text-text" : "text-muted"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className="text-muted select-none shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 right-0 mt-1.5 border border-border/60 bg-surface-overlay rounded-xl shadow-lg overflow-hidden flex flex-col"
          style={{ zIndex: "var(--z-dropdown)" }}
        >
          <div className="p-2 border-b border-border/40 bg-surface-0 flex items-center gap-2">
            <Search size={16} className="text-muted select-none shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent outline-none border-none py-1 text-sm focus:ring-0"
              autoFocus
            />
          </div>

          <ul className="max-h-48 overflow-y-auto py-1 text-sm bg-surface-overlay">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full text-left py-2 px-4 cursor-pointer hover:bg-surface-2 transition-colors flex items-center justify-between ${
                        isSelected ? "bg-primary/10 text-primary font-medium" : ""
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <Check size={14} className="text-primary select-none" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="py-3 px-4 text-muted text-center text-xs bg-surface-overlay">
                No matching results
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
