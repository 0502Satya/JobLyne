import React from "react";
import { Breadcrumbs, LoadingState } from "@/shared/ui";

export default function Loading() {
  return (
    <div className="space-y-6 text-left">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Job Alerts" },
        ]}
      />
      <div className="animate-pulse">
        <div className="h-8 bg-border/20 rounded w-48 mb-2"></div>
        <div className="h-4 bg-border/20 rounded w-96"></div>
      </div>

      <LoadingState variant="list" rows={4} />
    </div>
  );
}
