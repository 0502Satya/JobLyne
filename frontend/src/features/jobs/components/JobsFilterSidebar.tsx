"use client";

import React from "react";
import { Button } from "@/shared/ui";
import { SlidersHorizontal, Search, MapPin, X } from "lucide-react";

interface JobsFilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  locationQuery: string;
  setLocationQuery: (v: string) => void;
  experienceLevel: string;
  setExperienceLevel: (v: string) => void;
  salaryMin: string;
  setSalaryMin: (v: string) => void;
  salaryMax: string;
  setSalaryMax: (v: string) => void;
  selectedEmpTypes: string[];
  setSelectedEmpTypes: (v: string[]) => void;
  matchThreshold: number;
  setMatchThreshold: (v: number) => void;
  handleKeywordSearch: (e: React.FormEvent) => void;
  handleResetFilters: () => void;
  isPending: boolean;
  className?: string;
}

export default function JobsFilterSidebar({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  experienceLevel,
  setExperienceLevel,
  salaryMin,
  setSalaryMin,
  salaryMax,
  setSalaryMax,
  selectedEmpTypes,
  setSelectedEmpTypes,
  matchThreshold,
  setMatchThreshold,
  handleKeywordSearch,
  handleResetFilters,
  isPending,
  className = "",
}: JobsFilterSidebarProps) {
  const handleEmpTypeToggle = (type: string) => {
    setSelectedEmpTypes(
      selectedEmpTypes.includes(type)
        ? selectedEmpTypes.filter((t) => t !== type)
        : [...selectedEmpTypes, type]
    );
  };

  // Salary range validation helpers
  const salaryMinNum = salaryMin === "" ? null : Number(salaryMin);
  const salaryMaxNum = salaryMax === "" ? null : Number(salaryMax);
  const salaryRangeError =
    salaryMinNum !== null &&
    salaryMaxNum !== null &&
    salaryMinNum > salaryMaxNum;

  const handleSalaryMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || Number(val) >= 0) {
      setSalaryMin(val);
    }
  };

  const handleSalaryMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || Number(val) >= 0) {
      setSalaryMax(val);
    }
  };

  return (
    <aside className={`max-w-full rounded-2xl border-border/60 bg-surface p-6 gap-6 border flex flex-col ${className}`}>
      {/* Header */}
      <div className="border-border/40 pb-3 border-b items-center flex justify-between">
        <h3 className="items-center text-base gap-2 flex font-semibold text-text">
          <SlidersHorizontal size={18} className="text-primary" aria-hidden="true" />
          Advanced Filters
        </h3>
        <button
          type="button"
          onClick={handleResetFilters}
          disabled={isPending}
          className="text-primary type-caption hover:underline cursor-pointer font-medium"
        >
          Reset All
        </button>
      </div>

      {/* All filters wrapped in a single form */}
      <form onSubmit={handleKeywordSearch} className="gap-6 flex flex-col">

        {/* Keywords */}
        <div className="flex gap-1.5 flex-col">
          <label htmlFor="filter-keywords" className="uppercase tracking-wider type-caption text-muted font-bold">
            Keywords
          </label>
          <div className="relative">
            <input
              id="filter-keywords"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Role, Title, or Skills"
              className="w-full pl-9 min-h-[44px] pr-8 text-sm border-border/60 bg-bg py-2.5 rounded-xl border focus:outline-none focus:border-primary"
            />
            <Search size={18} className="left-3 absolute text-muted top-3" aria-hidden="true" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="right-3 absolute text-muted top-3 hover:text-text cursor-pointer flex items-center justify-center h-5 w-5"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex gap-1.5 flex-col">
          <label htmlFor="filter-location" className="uppercase tracking-wider type-caption text-muted font-bold">
            City or location
          </label>
          <div className="relative">
            <input
              id="filter-location"
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="e.g. San Francisco, Remote"
              className="w-full pl-9 min-h-[44px] pr-8 text-sm border-border/60 bg-bg py-2.5 rounded-xl border focus:outline-none focus:border-primary"
            />
            <MapPin size={18} className="left-3 absolute text-muted top-3" aria-hidden="true" />
            {locationQuery && (
              <button
                type="button"
                onClick={() => setLocationQuery("")}
                className="right-3 absolute text-muted top-3 hover:text-text cursor-pointer flex items-center justify-center h-5 w-5"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Employment Type Multi-Select */}
        <div className="gap-2 flex flex-col">
          <span className="uppercase tracking-wider type-caption text-muted font-bold">Employment Type</span>
          <div className="gap-2 flex flex-col">
            {["Full-time", "Part-time", "Contract", "Remote", "Internship"].map((type) => {
              const inputId = `emp-type-${type.toLowerCase()}`;
              return (
                <label key={type} htmlFor={inputId} className="cursor-pointer group gap-2.5 items-center type-ui flex">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={selectedEmpTypes.includes(type)}
                    onChange={() => handleEmpTypeToggle(type)}
                    className="h-4 w-4 cursor-pointer rounded accent-primary"
                  />
                  <span className="group-hover:text-primary transition-colors">{type}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Experience Required Range Selector */}
        <div className="gap-2 flex flex-col">
          <div className="flex type-caption justify-between">
            <label htmlFor="filter-experience" className="uppercase text-muted tracking-wider font-bold">Experience Required</label>
            <span className="text-primary font-bold">
              {(() => {
                if (experienceLevel === "All" || experienceLevel === "30") return "Any";
                const years = Number(experienceLevel);
                if (isNaN(years)) return experienceLevel;
                if (years === 0) return "0 Years";
                if (years >= 1 && years <= 2) return "1 – 2 Years";
                if (years >= 3 && years <= 5) return "3 – 5 Years";
                if (years >= 6 && years <= 9) return "6 – 9 Years";
                if (years >= 10 && years <= 14) return "10 – 14 Years";
                return "15+ Years";
              })()}
            </span>
          </div>
          <input
            id="filter-experience"
            type="range"
            min="0"
            max="30"
            step="1"
            value={experienceLevel === "All" ? 30 : Number(experienceLevel)}
            onChange={(e) => {
              const val = Number(e.target.value);
              setExperienceLevel(val === 30 ? "All" : val.toString());
            }}
            className="w-full h-1.5 appearance-none rounded-lg bg-border/40 cursor-pointer accent-primary"
          />
          <div className="flex justify-between type-caption text-muted">
            <span>0 yrs</span>
            <span>Any</span>
          </div>
        </div>

        {/* Salary Range */}
        <div className="gap-2 flex flex-col">
          <span className="uppercase tracking-wider type-caption text-muted font-bold">Expected Salary Range</span>
          <div className="gap-2 flex items-start">
            <div className="flex flex-col flex-1 gap-1">
              <label htmlFor="filter-salary-min" className="sr-only">Minimum Salary</label>
              <input
                id="filter-salary-min"
                type="number"
                min={0}
                value={salaryMin}
                onChange={handleSalaryMinChange}
                placeholder="Min"
                className={`w-full text-xs min-h-[44px] px-3 bg-bg py-2 rounded-xl border focus:outline-none transition-colors
                  ${salaryRangeError
                    ? "border-error focus:border-error"
                    : "border-border/60 focus:border-primary"
                  }`}
              />
            </div>
            <span className="type-caption text-muted mt-3.5">–</span>
            <div className="flex flex-col flex-1 gap-1">
              <label htmlFor="filter-salary-max" className="sr-only">Maximum Salary</label>
              <input
                id="filter-salary-max"
                type="number"
                min={salaryMinNum !== null ? salaryMinNum : 0}
                value={salaryMax}
                onChange={handleSalaryMaxChange}
                placeholder="Max"
                className={`w-full text-xs min-h-[44px] px-3 bg-bg py-2 rounded-xl border focus:outline-none transition-colors
                  ${salaryRangeError
                    ? "border-error focus:border-error"
                    : "border-border/60 focus:border-primary"
                  }`}
              />
            </div>
          </div>
          {salaryRangeError && (
            <p className="text-error type-caption mt-0.5" role="alert">
              Min salary cannot exceed max salary.
            </p>
          )}
        </div>

        {/* Match Score Threshold */}
        <div className="gap-2 flex flex-col">
          <div className="flex type-caption justify-between">
            <label htmlFor="filter-match-threshold" className="uppercase text-muted tracking-wider font-bold">Min Match Score</label>
            <span className="text-primary font-bold">{matchThreshold === 0 ? "Any" : `${matchThreshold}%+`}</span>
          </div>
          <input
            id="filter-match-threshold"
            type="range"
            min="0"
            max="95"
            step="5"
            value={matchThreshold}
            onChange={(e) => setMatchThreshold(Number(e.target.value))}
            className="w-full h-1.5 appearance-none rounded-lg bg-border/40 cursor-pointer accent-primary"
          />
          <div className="flex justify-between type-caption text-muted">
            <span>Any</span>
            <span>95%+</span>
          </div>
        </div>

        {/* Apply Filters — always at the bottom */}
        <div className="border-border/40 border-t pt-4 mt-auto">
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            disabled={salaryRangeError || isPending}
            className="w-full justify-center min-h-[48px] gap-1.5 items-center py-3"
          >
            <Search size={16} aria-hidden="true" />
            Apply Filters
          </Button>
        </div>

      </form>
    </aside>
  );
}
