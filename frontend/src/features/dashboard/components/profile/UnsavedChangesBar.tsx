"use client";

import React from "react";

interface UnsavedChangesBarProps {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export default function UnsavedChangesBar({ isVisible, onSave, onDiscard }: UnsavedChangesBarProps) {
  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-sm font-semibold py-2.5 px-6 flex items-center justify-between shadow-lg transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-base">warning</span>
        You have unsaved changes
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onDiscard}
          className="text-amber-100 hover:text-white underline text-xs transition-colors px-3 py-2.5 min-h-[44px] flex items-center justify-center"
        >
          Discard
        </button>
        <button 
          onClick={onSave}
          className="bg-white text-amber-600 text-xs font-bold px-5 py-2 rounded-xl hover:bg-amber-50 transition-colors min-h-[44px] flex items-center justify-center shadow-md active:scale-95"
        >
          Save now
        </button>
      </div>
    </div>
  );
}
