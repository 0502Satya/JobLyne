"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/shared/ui";
import ThemeToggle from "@/shared/ui/ThemeToggle";
import { ArrowLeft, Network, Save } from "lucide-react";

interface ProfileHeaderProps {
  onSave: () => void;
  onDiscard: () => void;
}

export default function ProfileHeader({ onSave, onDiscard }: ProfileHeaderProps) {
  return (
    <header className="border-b items-center border-border sticky bg-surface flex py-3 shadow-sm z-50 justify-between px-4 top-0 dark:bg-card dark:border-border md:px-8">
      <div className="flex gap-3 items-center">
        <Link 
          href="/dashboard" 
          className="text-muted items-center gap-2 type-ui transition-colors flex hover:text-primary"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <span className="text-muted dark:text-text">|</span>
        <div className="gap-2 flex items-center">
          <Network size={22} className="text-primary" aria-hidden="true" />
          <h2 className="type-h2 text-text hidden sm:block">JobLyne</h2>
        </div>
      </div>
      
      <h1 className="text-text type-card-title hidden md:block">Edit Profile</h1>
      
      <div className="gap-2 flex items-center">
        <ThemeToggle />
        
        <Button 
          onClick={onDiscard}
          variant="ghost"
          size="sm"
          className="hidden sm:block"
        >
          Discard
        </Button>
        
        <Button 
          onClick={onSave}
          variant="primary"
          size="sm"
          className="gap-1.5"
        >
          <Save size={16} aria-hidden="true" /> Save Changes
        </Button>
      </div>
    </header>
  );
}

