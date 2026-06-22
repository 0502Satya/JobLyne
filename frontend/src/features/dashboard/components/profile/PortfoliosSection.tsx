"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { Input } from "@/shared/ui";

interface PortfoliosSectionProps {
  social_links?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  onChange: (network: string, value: string) => void;
}

export default function PortfoliosSection({ social_links = {}, onChange }: PortfoliosSectionProps) {
  const networks = [
    { id: "facebook", name: "Facebook", icon: "facebook" },
    { id: "instagram", name: "Instagram", icon: "photo_camera" },
    { id: "linkedin", name: "LinkedIn", icon: "work" },
  ];

  return (
    <section className="rounded-2xl bg-card shadow-sm border-border p-5 border sm:p-6 text-left">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
          <Share2 size={20} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-text type-card-title leading-tight">Portfolios & Social Links</h3>
          <p className="text-xs text-muted mt-0.5">Link your external professional profiles</p>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4">
        {networks.map((network) => (
          <div key={network.id} className="text-left">
            <Input
              label={network.name}
              type="text"
              icon={network.icon}
              value={(social_links as any)?.[network.id] || ""}
              onChange={(e) => onChange(network.id, e.target.value)}
              placeholder={`https://${network.id}.com/username`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
