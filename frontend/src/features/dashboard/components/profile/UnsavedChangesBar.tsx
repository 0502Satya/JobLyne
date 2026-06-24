"use client";

import React from "react";
import { Button } from "@/shared/ui";
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesBarProps {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export default function UnsavedChangesBar({ isVisible, onSave, onDiscard }: UnsavedChangesBarProps) {
  return (
    <div className={`bg-warning px-6 items-center transition-all left-0 text-white fixed py-2.5 duration-300 type-ui z-[100] flex justify-between shadow-lg right-0 top-0 ${isVisible ? 'translate-y-0 opacity-100' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
      <div className="gap-2 flex items-center">
        <AlertTriangle size={16} aria-hidden="true" />
        You have unsaved changes
      </div>
      <div className="flex gap-3 items-center">
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          className="text-white/80 hover:text-white hover:bg-white/10 underline min-h-[40px] px-3 font-normal"
        >
          Discard
        </Button>
        <Button 
          type="button"
          variant="secondary"
          onClick={onSave}
          className="text-warning hover:text-warning-dark bg-white hover:bg-warning-bg border-0 shadow-md font-semibold px-5"
        >
          Save now
        </Button>
      </div>
    </div>
  );
}

