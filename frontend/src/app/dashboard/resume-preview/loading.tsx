import React from "react";

export default function Loading() {
  return (
    <div className="bg-bg text-text p-4 min-h-screen sm:p-8 md:p-12 animate-pulse text-left">
      <div className="mx-auto mb-8 h-20 rounded-2xl bg-border/25 max-w-4xl"></div>
      
      <article className="mx-auto min-h-[297mm] rounded-[32px] bg-surface max-w-4xl border-border/50 p-8 border sm:p-16 space-y-8">
        <header className="mb-8 pb-8 border-b-2 border-border/50 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-6 items-center">
            <div className="h-20 w-20 rounded-2xl bg-border/25"></div>
            <div className="space-y-3">
              <div className="h-8 bg-border/25 rounded w-48"></div>
              <div className="h-4 bg-border/25 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-2 md:text-right">
            <div className="h-4 bg-border/25 rounded w-40"></div>
            <div className="h-4 bg-border/25 rounded w-32"></div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="h-6 bg-border/25 rounded w-36 mb-4"></div>
          <div className="h-4 bg-border/25 rounded w-full"></div>
          <div className="h-4 bg-border/25 rounded w-5/6"></div>
        </section>
      </article>
    </div>
  );
}
