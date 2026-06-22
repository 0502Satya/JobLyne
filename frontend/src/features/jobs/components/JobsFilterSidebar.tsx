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

  return (
    <aside className={`max-w-full rounded-2xl border-border/60 bg-surface p-6 gap-6 border flex flex-col ${className}`}>
      <div className="border-border/40 pb-3 border-b items-center flex justify-between">
        <h3 className="items-center text-base gap-2 flex font-semibold text-text">
          <SlidersHorizontal size={18} className="text-primary" aria-hidden="true" />
          Advanced Filters
        </h3>
        <button
          onClick={handleResetFilters}
          disabled={isPending}
          className="text-primary type-caption hover:underline cursor-pointer font-medium"
        >
          Reset All
        </button>
      </div>

      <form onSubmit={handleKeywordSearch} className="gap-4 flex flex-col">
        {/* Search Input */}
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
              placeholder="Role, title, or skill..."
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

        {/* City/Location Input */}
        <div className="flex gap-1.5 flex-col">
          <label htmlFor="filter-location" className="uppercase tracking-wider type-caption text-muted font-bold">
            City or Location
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

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center min-h-[48px] gap-1.5 items-center py-3"
        >
          <Search size={16} aria-hidden="true" />
          Apply Keywords
        </Button>
      </form>

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
        <span className="uppercase tracking-wider type-caption text-muted font-bold">Experience Level</span>
        <div className="gap-2 grid-cols-2 grid">
          {["All", "Entry", "Mid", "Senior"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setExperienceLevel(level)}
              className={`transition-all py-2 type-caption rounded-xl border font-semibold ${
                experienceLevel === level
                  ? "text-primary border-primary bg-primary/10"
                  : "bg-bg text-muted border-border/60 hover:text-text cursor-pointer"
              }`}
            >
              {level === "Entry" ? "0-1 Years" : level === "Mid" ? "2-4 Years" : level === "Senior" ? "5+ Years" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Bounds Limits */}
      <div className="gap-2 flex flex-col">
        <span className="uppercase tracking-wider type-caption text-muted font-bold">Expected Salary Range</span>
        <div className="gap-2 flex items-center">
          <div className="relative flex-1">
            <label htmlFor="filter-salary-min" className="sr-only">Minimum Salary</label>
            <input
              id="filter-salary-min"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="Min"
              className="w-full text-xs min-h-[44px] px-3 border-border/60 bg-bg py-2 rounded-xl border focus:outline-none focus:border-primary"
            />
          </div>
          <span className="type-caption text-muted">to</span>
          <div className="relative flex-1">
            <label htmlFor="filter-salary-max" className="sr-only">Maximum Salary</label>
            <input
              id="filter-salary-max"
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="Max"
              className="w-full text-xs min-h-[44px] px-3 border-border/60 bg-bg py-2 rounded-xl border focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Match Score Threshold */}
      <div className="gap-2 flex flex-col">
        <div className="flex type-caption justify-between">
          <label htmlFor="filter-match-threshold" className="uppercase text-muted tracking-wider font-bold">Min Match Score</label>
          <span className="text-primary font-bold">{matchThreshold}%+</span>
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
      </div>
    </aside>
  );
}
