"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // Initialize from local storage or document class if preset
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || 
                   localStorage.getItem("theme") === "dark";
    setDark(isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      type="button"
      className="size-10 rounded-xl border border-border bg-surface hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-center text-text hover:text-primary transition-all cursor-pointer shadow-sm select-none"
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      <span className="material-symbols-outlined text-lg">
        {dark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}