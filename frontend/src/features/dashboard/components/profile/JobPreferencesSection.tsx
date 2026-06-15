"use client";

import React, { useState } from "react";
import { Profile } from "@/types/profile";

interface JobPreferencesSectionProps {
  data: Profile;
  onChange: <K extends keyof Profile>(field: K, value: Profile[K]) => void;
}

export default function JobPreferencesSection({ data, onChange }: JobPreferencesSectionProps) {
  const [locInput, setLocInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const workModes = ["Remote", "Hybrid", "On-site"];
  const companySizes = ["Startup (<50)", "Mid-size (50-500)", "Enterprise (>500)", "No preference"];

  // Helper to safely parse preferred locations
  const getPreferredLocations = (): string[] => {
    if (!data.preferred_locations) return [];
    if (Array.isArray(data.preferred_locations)) return data.preferred_locations;
    try {
      const parsed = JSON.parse(data.preferred_locations);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    if (typeof data.preferred_locations === "string") {
      return data.preferred_locations.split(",").map((l) => l.trim()).filter(Boolean);
    }
    return [];
  };

  const locations = getPreferredLocations();

  const handleToggleWorkMode = (mode: string) => {
    let current: string[] = [];
    if (Array.isArray(data.work_mode)) {
      current = data.work_mode;
    } else if (typeof data.work_mode === "string") {
      try {
        current = JSON.parse(data.work_mode);
      } catch (e) {
        current = data.work_mode.split(",").map((m) => m.trim()).filter(Boolean);
      }
    }
    const updated = current.includes(mode)
      ? current.filter((m) => m !== mode)
      : [...current, mode];
    onChange("work_mode", updated);
  };

  const handleAddLocation = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = locInput.trim();
      if (val && !locations.includes(val)) {
        const updated = [...locations, val];
        onChange("preferred_locations", updated);
      }
      setLocInput("");
    }
  };

  const handleRemoveLocation = (loc: string) => {
    const updated = locations.filter((l) => l !== loc);
    onChange("preferred_locations", updated);
  };

  const isComplete = !!(data.desired_titles && data.expected_salary);

  // Helper to safely get work modes array for rendering
  const getActiveWorkModes = (): string[] => {
    if (Array.isArray(data.work_mode)) return data.work_mode;
    if (typeof data.work_mode === "string") {
      try {
        const parsed = JSON.parse(data.work_mode);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return data.work_mode.split(",").map((m) => m.trim()).filter(Boolean);
    }
    return [];
  };

  const activeModes = getActiveWorkModes();

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="preferences">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">tune</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Job Preferences</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Define your ideal career opportunities</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary hover:text-primary-dark text-xs font-bold flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 min-h-[40px]"
          >
            <span className="material-symbols-outlined text-sm font-bold">
              {isEditing ? "check" : "edit"}
            </span>
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 bg-card space-y-6">
        {isEditing ? (
          /* EDIT MODE */
          <div className="space-y-6">
            {/* Desired Titles */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Desired Job Roles</label>
              <input
                type="text"
                value={data.desired_titles || ""}
                onChange={(e) => onChange("desired_titles", e.target.value)}
                placeholder="e.g. Senior Product Manager, Technical Lead"
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
              />
              <span className="text-xs text-muted block mt-1">Separate multiple titles with commas</span>
            </div>

            {/* Expected & Current Salaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Expected Salary (Annual)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-muted text-sm font-semibold">{data.currency || "$"}</span>
                  <input
                    type="text"
                    value={data.expected_salary || ""}
                    onChange={(e) => onChange("expected_salary", e.target.value)}
                    placeholder="120,000"
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Current CTC / Salary</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-muted text-sm font-semibold">{data.currency || "$"}</span>
                  <input
                    type="text"
                    value={data.current_salary || ""}
                    onChange={(e) => onChange("current_salary", e.target.value)}
                    placeholder="95,000"
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Notice Period</label>
                <select
                  value={data.notice_period || ""}
                  onChange={(e) => onChange("notice_period", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text cursor-pointer"
                >
                  <option value="">Select Notice Period</option>
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                </select>
              </div>
            </div>

            {/* Work Mode & Company Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Preferred Work Mode</label>
                <div className="flex flex-wrap gap-2">
                  {workModes.map((mode) => {
                    const isSelected = activeModes.includes(mode);
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleToggleWorkMode(mode)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-card border-border text-muted hover:border-muted/80"
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Preferred Company Size</label>
                <select
                  value={data.preferred_company_size || ""}
                  onChange={(e) => onChange("preferred_company_size", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text cursor-pointer"
                >
                  <option value="">Select Company Size</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Relocation & International Opportunities Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-bg border border-border rounded-xl">
                <div>
                  <p className="text-xs font-bold text-text">Open to Relocation</p>
                  <p className="text-[11px] text-muted font-semibold mt-0.5">Willing to move for correct opportunities</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange("open_to_relocation", !data.open_to_relocation)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 min-h-[44px] cursor-pointer ${
                    data.open_to_relocation ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-card rounded-full shadow-xs transition-transform ${
                      data.open_to_relocation ? "right-0.5" : "left-0.5"
                    }`}
                  ></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-bg border border-border rounded-xl">
                <div>
                  <p className="text-xs font-bold text-text">International Opportunities</p>
                  <p className="text-[11px] text-muted font-semibold mt-0.5">Open to jobs based outside home country</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange("open_to_international", !data.open_to_international)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 min-h-[44px] cursor-pointer ${
                    data.open_to_international ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-card rounded-full shadow-xs transition-transform ${
                      data.open_to_international ? "right-0.5" : "left-0.5"
                    }`}
                  ></span>
                </button>
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">Preferred Cities / Locations</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {locations.map((loc) => (
                  <span
                    key={loc}
                    className="flex items-center gap-1.5 bg-bg border border-border text-text pl-3 pr-1 py-1 rounded-lg text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    <span>{loc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(loc)}
                      className="hover:text-red-500 text-muted flex items-center justify-center cursor-pointer min-h-[32px] min-w-[32px]"
                      title="Remove Location"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={locInput}
                  onChange={(e) => setLocInput(e.target.value)}
                  onKeyDown={handleAddLocation}
                  placeholder="Type preferred city and press Enter..."
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                />
              </div>
            </div>
          </div>
        ) : (
          /* READONLY VIEW MODE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="md:col-span-2 lg:col-span-3">
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Desired Job Roles</span>
              <div className="flex flex-wrap gap-1.5">
                {data.desired_titles ? (
                  data.desired_titles.split(",").map((title) => (
                    <span key={title} className="inline-flex h-7 items-center rounded-lg bg-primary/10 dark:bg-primary/20 px-3 text-xs font-bold text-primary">
                      {title.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-muted italic">Not specified</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-0.5">Expected Salary</span>
              <span className="font-semibold text-text">
                {data.expected_salary ? `${data.currency || "$"}${parseFloat(String(data.expected_salary).replace(/,/g, "")).toLocaleString()}` : "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-0.5">Current Salary</span>
              <span className="font-semibold text-text">
                {data.current_salary ? `${data.currency || "$"}${parseFloat(String(data.current_salary).replace(/,/g, "")).toLocaleString()}` : "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-0.5">Notice Period</span>
              <span className="font-semibold text-text">{data.notice_period || "Not specified"}</span>
            </div>

            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Preferred Work Mode</span>
              <div className="flex flex-wrap gap-1">
                {activeModes.length > 0 ? (
                  activeModes.map((mode) => (
                    <span key={mode} className="inline-flex h-6 items-center rounded-md bg-bg border border-border px-2 text-[10px] font-bold text-text uppercase tracking-wide">
                      {mode}
                    </span>
                  ))
                ) : (
                  <span className="text-muted italic">Not specified</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-0.5">Company Size Preference</span>
              <span className="font-semibold text-text">{data.preferred_company_size || "Not specified"}</span>
            </div>

            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-0.5">Relocation & International</span>
              <div className="flex flex-wrap gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  data.open_to_relocation
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/20"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                  Relocation: {data.open_to_relocation ? "YES" : "NO"}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  data.open_to_international
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/20"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                  International: {data.open_to_international ? "YES" : "NO"}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 pt-5 border-t border-border/60">
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">Preferred Cities / Locations</span>
              <div className="flex flex-wrap gap-2">
                {locations.length > 0 ? (
                  locations.map((loc) => (
                    <span key={loc} className="flex items-center gap-1 px-3 py-1 bg-bg border border-border rounded-xl text-xs font-semibold text-text">
                      <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                      {loc}
                    </span>
                  ))
                ) : (
                  <span className="text-muted italic">No cities selected.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
