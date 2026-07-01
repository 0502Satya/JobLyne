import React from "react";
import { Breadcrumbs, LoadingState } from "@/shared/ui";

export default function Loading() {
  return (
    <div className="max-w-[1400px] p-4 mx-auto md:p-8 lg:p-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Saved Jobs" },
        ]}
        className="mb-4"
      />
      {/* Skeleton Header */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-border/20 rounded w-48 mb-2"></div>
        <div className="h-4 bg-border/20 rounded w-64"></div>
      </div>
      <LoadingState variant="card" rows={3} />
    </div>
  );
}
