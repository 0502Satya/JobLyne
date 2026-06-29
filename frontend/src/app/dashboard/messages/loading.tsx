import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 text-left animate-pulse">
      <div>
        <div className="h-8 bg-border/20 rounded w-32 mb-2"></div>
        <div className="h-4 bg-border/20 rounded w-96"></div>
      </div>

      <div className="w-full max-w-full border-border rounded-3xl relative overflow-hidden h-[648px] shadow-sm flex bg-surface border">
        <div className="w-full h-full border-border flex border-r bg-surface flex-col md:w-[352px] lg:w-[400px]">
          <div className="border-b p-4 border-border">
            <div className="h-10 bg-border/20 rounded-2xl w-full"></div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="size-12 bg-border/20 rounded-2xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-border/20 rounded w-24"></div>
                <div className="h-3 bg-border/20 rounded w-48"></div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="size-12 bg-border/20 rounded-2xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-border/20 rounded w-32"></div>
                <div className="h-3 bg-border/20 rounded w-36"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-1 bg-bg/20 h-full flex-col items-center justify-center p-6 text-center">
          <div className="size-16 bg-border/20 rounded-full mb-4"></div>
          <div className="h-6 bg-border/20 rounded w-48 mb-2"></div>
          <div className="h-4 bg-border/20 rounded w-64"></div>
        </div>
      </div>
    </div>
  );
}
