"use client";

import React, { useState } from "react";
import { Education } from "@/types/profile";

interface EducationSectionProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const FAMOUS_UNIVERSITIES = [
  "Harvard University",
  "Stanford University",
  "Massachusetts Institute of Technology (MIT)",
  "University of Oxford",
  "University of Cambridge",
  "University of Toronto",
  "University of British Columbia",
  "McGill University",
  "Indian Institute of Technology (IIT)",
  "Delhi University",
  "University of Waterloo",
];

export default function EducationSection({ data = [], onChange }: EducationSectionProps) {
  const [education, setEducation] = useState<Education[]>(data);
  const [showSuggestions, setShowSuggestions] = useState<{ [key: string]: boolean }>({});
  const [editingId, setEditingId] = useState<string | number | null>(null);

  React.useEffect(() => {
    setEducation(data);
  }, [data]);

  const addEntry = () => {
    const newId = Date.now().toString();
    const newEntry: Education = {
      id: newId,
      school: "",
      degree: "",
      field: "",
      start_year: "",
      end_year: "",
      grade: "",
      description: "",
      certifications: "",
    };
    const updated = [...education, newEntry];
    setEducation(updated);
    onChange(updated);
    setEditingId(newId);
  };

  const removeEntry = (id?: string | number) => {
    if (!id) return;
    const updated = education.filter((e) => e.id !== id);
    setEducation(updated);
    onChange(updated);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const updateEntry = (id: string | number | undefined, field: keyof Education, value: any) => {
    if (!id) return;
    const updated = education.map((e) => (e.id === id ? { ...e, [field]: value } : e));
    setEducation(updated);
    onChange(updated);
  };

  const moveEntry = (index: number, direction: "up" | "down") => {
    const updated = [...education];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < updated.length) {
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      setEducation(updated);
      onChange(updated);
    }
  };

  const getSchoolColor = (schoolName: string) => {
    const colors = [
      "bg-primary",
      "bg-teal-600",
      "bg-sky-600",
      "bg-indigo-600",
      "bg-purple-600",
      "bg-emerald-600",
      "bg-blue-600",
    ];
    if (!schoolName) return colors[0];
    let hash = 0;
    for (let i = 0; i < schoolName.length; i++) {
      hash = schoolName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
      : "ED";
  };

  const formatEducationMeta = (edu: Education) => {
    const start = edu.start_year || "";
    const end = edu.end_year || "";
    const grade = edu.grade ? `GPA: ${edu.grade}` : "";
    return [
      start && end ? `${start} — ${end}` : start || end || "",
      grade
    ].filter(Boolean).join(" • ");
  };

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="education">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">school</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Education</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Add your degrees and study fields</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addEntry}
            className="text-primary hover:text-primary-dark text-xs font-bold flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 mr-1 min-h-[40px] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            Add
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 bg-card space-y-6">
        <div className="space-y-6">
          {education.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl bg-bg/50">
              <span className="material-symbols-outlined text-3xl text-muted/60 mb-2 block">history_edu</span>
              <span className="text-sm font-bold text-text block mb-0.5">No education entries yet</span>
              <span className="text-xs text-muted block mb-4 font-semibold">Adding qualifications helps recruiters verify your credentials.</span>
              <button
                type="button"
                onClick={addEntry}
                className="text-primary text-xs font-bold hover:underline cursor-pointer min-h-[44px] px-4"
              >
                Add first degree card
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-border/60 ml-4 pl-6 sm:pl-8 space-y-8 py-2">
              {education.map((edu, idx) => {
                const filteredSuggestions = FAMOUS_UNIVERSITIES.filter((uni) =>
                  uni.toLowerCase().includes((edu.school || "").toLowerCase())
                );

                const isEditing = editingId === edu.id;
                const schoolColor = getSchoolColor(edu.school || "");
                const initials = getInitials(edu.school || "");

                return (
                  <div key={edu.id} className="relative group min-w-0">
                    {/* Timeline Dot/Badge */}
                    <div className={`absolute -left-[43px] sm:-left-[51px] top-1.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full ${schoolColor} border-4 border-card shadow-xs flex items-center justify-center text-white text-[10px] sm:text-xs font-extrabold shrink-0 select-none`}>
                      {initials}
                    </div>

                    {isEditing ? (
                      /* Editing Form Mode */
                      <div className="bg-bg/40 border border-border rounded-xl p-5 space-y-4 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                            <label className="block text-xs font-semibold text-muted mb-1">School / University</label>
                            <input
                              type="text"
                              value={edu.school || ""}
                              onChange={(e) => {
                                updateEntry(edu.id, "school", e.target.value);
                                setShowSuggestions((prev) => ({ ...prev, [edu.id as string]: true }));
                              }}
                              onFocus={() => setShowSuggestions((prev) => ({ ...prev, [edu.id as string]: true }))}
                              onBlur={() => setTimeout(() => setShowSuggestions((prev) => ({ ...prev, [edu.id as string]: false })), 200)}
                              placeholder="e.g. Stanford University"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                            {showSuggestions[edu.id as string] && filteredSuggestions.length > 0 && edu.school && (
                              <div className="absolute z-10 w-full bg-card border border-border rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto">
                                {filteredSuggestions.map((uni) => (
                                  <button
                                    key={uni}
                                    type="button"
                                    onClick={() => {
                                      updateEntry(edu.id, "school", uni);
                                      setShowSuggestions((prev) => ({ ...prev, [edu.id as string]: false }));
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-medium text-text hover:bg-bg transition-colors cursor-pointer"
                                  >
                                    {uni}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Degree</label>
                            <input
                              type="text"
                              value={edu.degree || ""}
                              onChange={(e) => updateEntry(edu.id, "degree", e.target.value)}
                              placeholder="e.g. Bachelor of Science"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-muted mb-1">Field of Study</label>
                            <input
                              type="text"
                              value={edu.field || ""}
                              onChange={(e) => updateEntry(edu.id, "field", e.target.value)}
                              placeholder="e.g. Computer Science"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Start Year</label>
                            <input
                              type="number"
                              value={edu.start_year || ""}
                              onChange={(e) => updateEntry(edu.id, "start_year", e.target.value)}
                              placeholder="2018"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">End Year (or Expected)</label>
                            <input
                              type="number"
                              value={edu.end_year || ""}
                              onChange={(e) => updateEntry(edu.id, "end_year", e.target.value)}
                              placeholder="2022"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Grade / GPA / Percentage</label>
                            <input
                              type="text"
                              value={edu.grade || ""}
                              onChange={(e) => updateEntry(edu.id, "grade", e.target.value)}
                              placeholder="e.g. 3.8/4.0 or 85%"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-muted mb-1">Courses & Activities</label>
                            <input
                              type="text"
                              value={edu.certifications || ""}
                              onChange={(e) => updateEntry(edu.id, "certifications", e.target.value)}
                              placeholder="e.g. Algorithms, Data Structures, Varsity Football"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-muted">Degree Description</label>
                          <textarea
                            value={edu.description || ""}
                            onChange={(e) => updateEntry(edu.id, "description", e.target.value)}
                            rows={3}
                            placeholder="Summarize your academic focus, thesis, or major milestones..."
                            className="w-full bg-card border border-border rounded-xl py-2 px-3.5 text-sm font-medium text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none leading-relaxed resize-none placeholder:text-muted/65"
                          />
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => removeEntry(edu.id)}
                            className="px-4 py-2 bg-card text-red-500 hover:bg-red-500/10 text-xs font-bold rounded-lg border border-border transition-all min-h-[44px] cursor-pointer"
                          >
                            Delete Entry
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all min-h-[44px] cursor-pointer shadow-xs"
                          >
                            Done Editing
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Read-only Timeline Presentation Mode */
                      <div className="relative pl-2">
                        {/* Hover Action Overlay */}
                        <div className="absolute right-0 top-0 flex items-center gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveEntry(idx, "up")}
                            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-primary disabled:opacity-30 cursor-pointer shadow-xs hover:shadow-sm"
                            title="Move Up"
                          >
                            <span className="material-symbols-outlined text-base">arrow_upward</span>
                          </button>
                          <button
                            type="button"
                            disabled={idx === education.length - 1}
                            onClick={() => moveEntry(idx, "down")}
                            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-primary disabled:opacity-30 cursor-pointer shadow-xs hover:shadow-sm"
                            title="Move Down"
                          >
                            <span className="material-symbols-outlined text-base">arrow_downward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(edu.id || null)}
                            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-primary cursor-pointer shadow-xs hover:shadow-sm"
                            title="Edit Education"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEntry(edu.id)}
                            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-red-500 hover:bg-red-500/10 cursor-pointer shadow-xs hover:shadow-sm"
                            title="Delete Education"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>

                        <div className="space-y-1.5 min-w-0 pr-24">
                          <h4 className="text-base font-bold text-text tracking-tight leading-snug break-words font-display">
                            {edu.school || "Untitled Institution"}
                          </h4>
                          <p className="text-sm font-semibold text-text/80 break-words">
                            {edu.degree || "No Degree"} {edu.field ? `in ${edu.field}` : ""}
                          </p>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider leading-relaxed break-words">
                            {formatEducationMeta(edu)}
                          </p>

                          {/* Certifications / Courses */}
                          {edu.certifications && (
                            <p className="text-xs text-muted font-medium leading-relaxed">
                              <span className="font-bold text-text/90">Courses:</span> {edu.certifications}
                            </p>
                          )}

                          {/* Description */}
                          {edu.description && (
                            <p className="text-xs text-muted leading-relaxed font-medium mt-1 pl-2 border-l border-border italic">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Fresh Graduate Tip */}
          <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <span className="material-symbols-outlined text-primary font-bold mt-0.5">school</span>
            <div className="text-xs text-text/85 leading-normal">
              <span className="font-bold block mb-0.5 text-primary">Freshers & student tips</span>
              Highlight key academic projects, hackathon achievements, and major course topics to capture entry-level recruiter attention.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
