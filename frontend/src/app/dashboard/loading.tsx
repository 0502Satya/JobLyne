import React from "react";

export default function DashboardLoading() {
  return (
    <div className="w-full bg-bg flex flex-col min-h-screen animate-pulse">
      {/* Navbar Placeholder */}
      <div className="w-full border-b border-border bg-surface h-16 shrink-0" />

      <div className="w-full flex-1 mx-auto max-w-[1440px] flex relative">
        {/* Sidebar Placeholder */}
        <div className="w-64 border-border hidden pt-6 pb-6 border-r px-4 bg-surface flex-col md:flex flex-shrink-0 h-[calc(100vh-64px)] space-y-6">
          <div className="flex flex-col items-center pb-6 border-b border-border">
            <div className="w-20 h-20 bg-border rounded-full mb-3" />
            <div className="w-28 h-4 bg-border rounded mb-2" />
            <div className="w-20 h-3 bg-border rounded" />
          </div>
          <div className="space-y-3 flex-1 mt-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-border rounded-lg w-full" />
            ))}
          </div>
        </div>

        {/* Main Content Placeholder */}
        <div className="flex-1 p-6 md:p-10 space-y-6">
          <div className="h-8 bg-border rounded w-48 mb-6" />
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-surface border border-border/60 rounded-3xl p-5" />
            ))}
          </div>

          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 bg-surface border border-border/60 rounded-3xl p-6" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
