"use client";

import React, { useState } from "react";
import { Profile } from "@/types/profile";
import { Button, Input, Select, FormField } from "@/shared/ui";
import { SlidersHorizontal, Check, Pencil, MapPin, X } from "lucide-react";

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
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border" id="preferences">
      {/* Card Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <SlidersHorizontal size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">Job Preferences</h3>
            <p className="text-xs text-muted mt-0.5">Define your ideal career opportunities</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary hover:text-primary-dark border-primary/10 bg-primary/5 hover:bg-primary/10 gap-2"
          >
            {isEditing ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Pencil size={16} aria-hidden="true" />
            )}
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Card Body */}
      <div className="bg-card p-5 space-y-6 sm:p-6 text-left">
        {isEditing ? (
          /* EDIT MODE */
          <div className="space-y-6">
            {/* Desired Titles */}
            <div className="text-left">
              <Input
                label="Desired job roles"
                type="text"
                value={data.desired_titles || ""}
                onChange={(e) => onChange("desired_titles", e.target.value)}
                placeholder="e.g. Senior Product Manager, Technical Lead"
                helper="Separate multiple titles with commas"
              />
            </div>

            {/* Expected & Current Salaries */}
            <div className="gap-5 grid grid-cols-1 md:grid-cols-3">
              <div>
                <FormField label="Expected salary (annual)">
                  <div className="relative w-full text-text">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted select-none type-label z-10">
                      {data.currency || "$"}
                    </span>
                    <Input
                      type="text"
                      value={data.expected_salary || ""}
                      onChange={(e) => onChange("expected_salary", e.target.value)}
                      placeholder="120,000"
                      className="pl-8!"
                    />
                  </div>
                </FormField>
              </div>
              <div>
                <FormField label="Current CTC / salary">
                  <div className="relative w-full text-text">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted select-none type-label z-10">
                      {data.currency || "$"}
                    </span>
                    <Input
                      type="text"
                      value={data.current_salary || ""}
                      onChange={(e) => onChange("current_salary", e.target.value)}
                      placeholder="95,000"
                      className="pl-8!"
                    />
                  </div>
                </FormField>
              </div>
              <div>
                <FormField label="Notice period">
                  <Select
                    value={data.notice_period || ""}
                    onChange={(e) => onChange("notice_period", e.target.value)}
                    options={[
                      { value: "", label: "Select Notice Period" },
                      { value: "Immediate", label: "Immediate" },
                      { value: "15 Days", label: "15 Days" },
                      { value: "1 Month", label: "1 Month" },
                      { value: "2 Months", label: "2 Months" },
                      { value: "3 Months", label: "3 Months" },
                    ]}
                  />
                </FormField>
              </div>
            </div>

            {/* Work Mode & Company Size */}
            <div className="gap-5 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Preferred Work Mode</label>
                <div className="gap-2 flex flex-wrap">
                  {workModes.map((mode) => {
                    const isSelected = activeModes.includes(mode);
                    return (
                      <Button
                        key={mode}
                        type="button"
                        variant={isSelected ? "primary" : "outline"}
                        onClick={() => handleToggleWorkMode(mode)}
                        className="type-caption px-4 py-2"
                      >
                        {mode}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <FormField label="Preferred company size">
                  <Select
                    value={data.preferred_company_size || ""}
                    onChange={(e) => onChange("preferred_company_size", e.target.value)}
                    options={[
                      { value: "", label: "Select Company Size" },
                      ...companySizes.map((size) => ({ value: size, label: size })),
                    ]}
                  />
                </FormField>
              </div>
            </div>

            {/* Relocation and international Opportunities Toggles */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div className="border border-border items-center bg-bg/40 flex p-4 rounded-xl justify-between">
                <div>
                  <p className="text-text type-caption font-medium">Open to relocation</p>
                  <p className="text-xs mt-0.5 text-muted">Willing to move for correct opportunities</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!data.open_to_relocation}
                  onClick={() => onChange("open_to_relocation", !data.open_to_relocation)}
                  className={`flex-shrink-0 relative min-h-[44px] w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    data.open_to_relocation ? "bg-primary" : "bg-border dark:bg-border"
                  }`}
                >
                  <span
                    className={`top-0.5 h-5 absolute bg-surface transition-transform w-5 rounded-full shadow ${
                      data.open_to_relocation ? "right-0.5" : "left-0.5"
                    }`}
                  ></span>
                </button>
              </div>

              <div className="border border-border items-center bg-bg/40 flex p-4 rounded-xl justify-between">
                <div>
                  <p className="text-text type-caption font-medium">International Opportunities</p>
                  <p className="text-xs mt-0.5 text-muted">Open to jobs based outside home country</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!data.open_to_international}
                  onClick={() => onChange("open_to_international", !data.open_to_international)}
                  className={`flex-shrink-0 relative min-h-[44px] w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    data.open_to_international ? "bg-primary" : "bg-border dark:bg-border"
                  }`}
                >
                  <span
                    className={`top-0.5 h-5 absolute bg-surface transition-transform w-5 rounded-full shadow ${
                      data.open_to_international ? "right-0.5" : "left-0.5"
                    }`}
                  ></span>
                </button>
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Preferred Cities / Locations</label>
              <div className="gap-2 flex flex-wrap mb-3">
                {locations.map((loc) => (
                  <span
                    key={loc}
                    className="text-text py-1 gap-1.5 border-border items-center pr-1 bg-bg/40 pl-3 rounded-lg flex type-caption border"
                  >
                    <MapPin size={14} className="text-primary" aria-hidden="true" />
                    <span>{loc}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLocation(loc)}
                      className="hover:text-error min-w-8 h-8 p-0 flex items-center justify-center text-muted"
                      title="Remove location"
                      aria-label={`Remove ${loc}`}
                    >
                      <X size={12} aria-hidden="true" />
                    </Button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <Input
                  type="text"
                  value={locInput}
                  onChange={(e) => setLocInput(e.target.value)}
                  onKeyDown={handleAddLocation}
                  placeholder="Type preferred city and press Enter..."
                />
              </div>
            </div>
          </div>
        ) : (
          /* READONLY VIEW MODE */
          <div className="gap-6 grid grid-cols-1 text-sm md:grid-cols-2 lg:grid-cols-3 text-left">
            <div className="md:col-span-2 lg:col-span-3">
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Desired Job Roles</span>
              <div className="flex flex-wrap gap-1.5">
                {data.desired_titles ? (
                  data.desired_titles.split(",").map((title) => (
                    <span key={title} className="text-primary h-7 inline-flex px-3 items-center rounded-lg type-caption bg-primary/10 dark:bg-primary/20">
                      {title.trim()}
                    </span>
                  ))
                ) : (
                  <span className="italic text-muted">Not specified</span>
                )}
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Expected Salary</span>
              <span className="text-text">
                {data.expected_salary ? `${data.currency || "$"}${parseFloat(String(data.expected_salary).replace(/,/g, "")).toLocaleString()}` : "Not specified"}
              </span>
            </div>

            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Current Salary</span>
              <span className="text-text">
                {data.current_salary ? `${data.currency || "$"}${parseFloat(String(data.current_salary).replace(/,/g, "")).toLocaleString()}` : "Not specified"}
              </span>
            </div>

            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Notice Period</span>
              <span className="text-text">{data.notice_period || "Not specified"}</span>
            </div>

            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Preferred Work Mode</span>
              <div className="gap-1 flex flex-wrap">
                {activeModes.length > 0 ? (
                  activeModes.map((mode) => (
                    <span key={mode} className="text-text px-2 border-border inline-flex text-xs uppercase items-center h-6 bg-bg tracking-wide rounded-md border">
                      {mode}
                    </span>
                  ))
                ) : (
                  <span className="italic text-muted">Not specified</span>
                )}
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Company Size Preference</span>
              <span className="text-text">{data.preferred_company_size || "Not specified"}</span>
            </div>

            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Relocation and international</span>
              <div className="gap-2 flex flex-wrap mt-0.5">
                <span className={`px-2 gap-1 inline-flex text-xs items-center rounded-full py-0.5 border ${
                  data.open_to_relocation
                    ? "text-success border-success/20 bg-success-bg"
                    : "border-error/20 bg-error-bg text-error"
                }`}>
                  <span className="h-1.5 shrink-0 bg-current rounded-full w-1.5"></span>
                  Relocation: {data.open_to_relocation ? "YES" : "NO"}
                </span>
                <span className={`px-2 gap-1 inline-flex text-xs items-center rounded-full py-0.5 border ${
                  data.open_to_international
                    ? "text-success border-success/20 bg-success-bg"
                    : "border-error/20 bg-error-bg text-error"
                }`}>
                  <span className="h-1.5 shrink-0 bg-current rounded-full w-1.5"></span>
                  International: {data.open_to_international ? "YES" : "NO"}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 border-t pt-5 border-border/60">
              <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Preferred Cities / Locations</span>
              <div className="gap-2 flex flex-wrap">
                {locations.length > 0 ? (
                  locations.map((loc) => (
                    <span key={loc} className="text-text py-1 border-border gap-1.5 px-3 items-center bg-bg flex type-caption rounded-xl border">
                      <MapPin size={14} className="text-primary" aria-hidden="true" />
                      {loc}
                    </span>
                  ))
                ) : (
                  <span className="italic text-muted">No cities selected.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
