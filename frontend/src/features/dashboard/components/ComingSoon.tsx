"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/shared/ui/Icon";
import { ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: string;
}

export default function ComingSoon({
  title = "Coming Soon",
  description = "We're working hard to bring you this feature. Stay tuned!",
  icon = "rocket_launch"
}: ComingSoonProps) {
  return (
    <div className="justify-center flex-1 items-center flex p-8 min-h-[60vh]">
      <div className="text-center max-w-md">
        {/* Animated Icon */}
        <div className="mx-auto h-32 w-32 mb-8 relative">
          <div className="opacity-20 animate-ping inset-0 absolute rounded-full bg-primary/10"></div>
          <div className="justify-center w-32 h-32 to-accent-gradient relative items-center bg-gradient-to-br from-primary rounded-full shadow-2xl shadow-primary/30 flex">
            <Icon name={icon} size={48} className="text-white" aria-hidden="true" />
          </div>
        </div>

        {/* Text */}
        <h2 className="mb-3 type-h1 text-text">{title}</h2>
        <p className="mb-8 text-muted leading-relaxed type-ui">{description}</p>

        {/* Back Button */}
        <Link
          href="/dashboard"
          className="px-8 inline-flex rounded-2xl uppercase py-3.5 items-center gap-2 transition-all text-white tracking-widest shadow-xl shadow-primary/20 bg-primary type-badge hover:scale-[1.02] active:scale-95"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
