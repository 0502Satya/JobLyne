"use client";

import React from "react";
import { ArrowRight, Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
  vacancyCount: number;
}

export default function FeaturedCompanies() {
  const companies: Company[] = [
    { id: "1", name: "Herman-Carter", vacancyCount: 21 },
    { id: "2", name: "Funk Inc.", vacancyCount: 21 },
    { id: "3", name: "Williamson Inc.", vacancyCount: 21 },
    { id: "4", name: "Donnelly Ltd.", vacancyCount: 21 },
    { id: "5", name: "Herman-Carter", vacancyCount: 21 }
  ];

  return (
    <div className="overflow-x-hidden mt-12">
      <div className="mb-8 flex-col flex gap-6 justify-between sm:flex-row sm:items-center">
        <h4 className="text-text type-h2">Featured Companies</h4>
        <div className="w-full gap-4 items-center flex justify-between sm:justify-end sm:w-auto sm:gap-6">
           {/* Pagination Dots */}
           <div className="gap-2 flex">
              <div className="h-2 shrink-0 w-2 rounded-full bg-primary"></div>
              <div className="h-2 shrink-0 w-2 rounded-full bg-border"></div>
              <div className="h-2 shrink-0 w-2 rounded-full bg-border"></div>
           </div>
           <button className="text-primary rounded-2xl min-h-[44px] transition-all type-badge flex shrink-0 group items-center gap-2 bg-primary/5 border-primary/10 py-2.5 px-4 border sm:py-3 sm:px-6 hover:bg-primary/10">
             View More
             <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
           </button>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {companies.map((company) => (
          <div key={company.id} className="cursor-pointer group gap-4 items-center transition-all bg-surface shadow-lg rounded-[24px] flex p-5 min-w-0 sm:p-6 hover:-translate-y-1 hover:shadow-xl">
            <div className="justify-center shrink-0 h-12 rounded-2xl w-12 items-center bg-bg transition-colors flex sm:h-14 sm:w-14 group-hover:bg-primary/5">
               <Building2 className="transition-colors text-muted group-hover:text-primary/40" size={28} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
               <h5 className="text-text truncate text-sm">{company.name}</h5>
               <p className="text-primary text-xs uppercase mt-0.5 tracking-wider">{company.vacancyCount} Vacancy</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
