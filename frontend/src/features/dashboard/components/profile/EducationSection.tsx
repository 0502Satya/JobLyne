"use client";

import React, { useState } from "react";
import { Education } from "@/types/profile";
import { Button, Input, FormField } from "@/shared/ui";
import { GraduationCap, Plus, ScrollText, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";

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
      "bg-company-accent",
      "bg-experience",
      "bg-primary",
      "bg-accent",
      "bg-success",
      "bg-primary",
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
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border" id="education">
      {/* Card Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <GraduationCap size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">Education</h3>
            <p className="text-xs text-muted mt-0.5">Add your degrees and study fields</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addEntry}
            className="text-primary hover:text-primary-dark border-primary/10 bg-primary/5 hover:bg-primary/10 gap-1"
          >
            <Plus size={14} className="type-ui" aria-hidden="true" />
            Add
          </Button>
        </div>
      </div>

      {/* Card Body */}
      <div className="bg-card p-5 space-y-6 sm:p-6">
        <div className="space-y-6">
          {education.length === 0 ? (
            <div className="border-dashed bg-bg/50 border-border text-center py-10 rounded-xl border">
              <ScrollText size={24} className="text-muted/60 block mb-2" aria-hidden="true" />
              <span className="text-text mb-0.5 block type-ui">No education entries yet</span>
              <span className="block mb-4 type-caption text-muted">Adding qualifications helps recruiters verify your credentials.</span>
              <Button
                type="button"
                variant="ghost"
                onClick={addEntry}
                className="text-primary hover:underline"
              >
                Add first degree card
              </Button>
            </div>
          ) : (
            <div className="space-y-8 border-l-2 relative border-border/60 ml-4 py-2 pl-6 sm:pl-8">
              {education.map((edu, idx) => {
                const filteredSuggestions = FAMOUS_UNIVERSITIES.filter((uni) =>
                  uni.toLowerCase().includes((edu.school || "").toLowerCase())
                );

                const isEditing = editingId === edu.id;
                const schoolColor = getSchoolColor(edu.school || "");
                const initials = getInitials(edu.school || "");

                return (
                  <div key={edu.id} className="min-w-0 relative group">
                    {/* Timeline Dot/Badge */}
                    <div className={`-left-[44px] absolute top-1.5 rounded-full h-8 w-8 sm:h-10 sm:-left-[52px] sm:w-10 ${schoolColor} justify-center shrink-0 border-card type-badge items-center text-white select-none shadow-xs border-4 flex`}>
                      {initials}
                    </div>

                    {isEditing ? (
                      /* Editing Form Mode */
                      <div className="border-border bg-bg/40 p-5 shadow-inner space-y-4 rounded-xl border">
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                          <div className="relative">
                            <Input
                              label="School / university"
                              value={edu.school || ""}
                              onChange={(e) => {
                                updateEntry(edu.id, "school", e.target.value);
                                setShowSuggestions((prev) => ({ ...prev, [edu.id as string]: true }));
                              }}
                              onFocus={() => setShowSuggestions((prev) => ({ ...prev, [edu.id as string]: true }))}
                              onBlur={() => setTimeout(() => setShowSuggestions((prev) => ({ ...prev, [edu.id as string]: false })), 200)}
                              placeholder="e.g. Stanford University"
                            />
                            {showSuggestions[edu.id as string] && filteredSuggestions.length > 0 && edu.school && (
                              <div className="w-full overflow-y-auto z-10 border-border shadow-md absolute max-h-48 rounded-lg bg-card mt-1 border">
                                {filteredSuggestions.map((uni) => (
                                  <button
                                    key={uni}
                                    type="button"
                                    onClick={() => {
                                      updateEntry(edu.id, "school", uni);
                                      setShowSuggestions((prev) => ({ ...prev, [edu.id as string]: false }));
                                    }}
                                    className="w-full text-text type-caption transition-colors cursor-pointer py-2 px-4 text-left hover:bg-bg"
                                  >
                                    {uni}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <Input
                            label="Degree"
                            value={edu.degree || ""}
                            onChange={(e) => updateEntry(edu.id, "degree", e.target.value)}
                            placeholder="e.g. Bachelor of Science"
                          />
                        </div>

                        <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                          <div className="md:col-span-2">
                            <Input
                              label="Field of study"
                              value={edu.field || ""}
                              onChange={(e) => updateEntry(edu.id, "field", e.target.value)}
                              placeholder="e.g. Computer Science"
                            />
                          </div>
                          <Input
                            label="Start year"
                            type="number"
                            value={edu.start_year || ""}
                            onChange={(e) => updateEntry(edu.id, "start_year", e.target.value)}
                            placeholder="2018"
                          />
                          <Input
                            label="End year (or expected)"
                            type="number"
                            value={edu.end_year || ""}
                            onChange={(e) => updateEntry(edu.id, "end_year", e.target.value)}
                            placeholder="2022"
                          />
                        </div>

                        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                          <Input
                            label="Grade / GPA / percentage"
                            value={edu.grade || ""}
                            onChange={(e) => updateEntry(edu.id, "grade", e.target.value)}
                            placeholder="e.g. 3.8/4.0 or 85%"
                          />
                          <div className="md:col-span-2">
                            <Input
                              label="Courses and activities"
                              value={edu.certifications || ""}
                              onChange={(e) => updateEntry(edu.id, "certifications", e.target.value)}
                              placeholder="e.g. Algorithms, Data Structures, Varsity Football"
                            />
                          </div>
                        </div>

                        <FormField label="Degree description">
                          <textarea
                            value={edu.description || ""}
                            onChange={(e) => updateEntry(edu.id, "description", e.target.value)}
                            rows={3}
                            placeholder="Summarize your academic focus, thesis, or major milestones..."
                            className="w-full text-text outline-none transition-all rounded-md py-3 border bg-input-bg border-input-border focus:ring-2 focus:border-primary focus:ring-primary placeholder:text-muted disabled:opacity-50 disabled:cursor-not-allowed resize-none leading-relaxed px-4"
                          />
                        </FormField>

                        <div className="pt-2 flex justify-end gap-2.5">
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => removeEntry(edu.id)}
                          >
                            Delete Entry
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => setEditingId(null)}
                          >
                            Done Editing
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Read-only Timeline Presentation Mode */
                      <div className="pl-2 relative">
                        {/* Hover Action Overlay */}
                        <div className="gap-1.5 z-10 absolute opacity-100 items-center transition-opacity flex right-0 top-0 lg:opacity-0 lg:group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={idx === 0}
                            onClick={() => moveEntry(idx, "up")}
                            className="h-10 w-10 p-0 rounded-lg"
                            title="Move up"
                            aria-label="Move up"
                          >
                             <ArrowUp size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={idx === education.length - 1}
                            onClick={() => moveEntry(idx, "down")}
                            className="h-10 w-10 p-0 rounded-lg"
                            title="Move down"
                            aria-label="Move down"
                          >
                             <ArrowDown size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(edu.id || null)}
                            className="h-10 w-10 p-0 rounded-lg"
                            title="Edit education"
                            aria-label="Edit education"
                          >
                             <Pencil size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeEntry(edu.id)}
                            className="h-10 w-10 p-0 rounded-lg text-error hover:text-error/90 hover:bg-error-bg"
                            title="Delete education"
                            aria-label="Delete education"
                          >
                             <Trash2 size={16} aria-hidden="true" />
                          </Button>
                        </div>

                        <div className="min-w-0 pr-24 space-y-1.5">
                          <h4 className="text-text break-words leading-snug tracking-tight type-card-title">
                            {edu.school || "Untitled Institution"}
                          </h4>
                          <p className="break-words type-ui text-text/80">
                            {edu.degree || "No Degree"} {edu.field ? `in ${edu.field}` : ""}
                          </p>
                          <p className="break-words text-xs uppercase leading-relaxed tracking-wider text-muted">
                            {formatEducationMeta(edu)}
                          </p>

                          {/* Certifications / Courses */}
                          {edu.certifications && (
                            <p className="leading-relaxed type-caption text-muted">
                              <span className="text-text/90">Courses:</span> {edu.certifications}
                            </p>
                          )}

                          {/* Description */}
                          {edu.description && (
                            <p className="border-l border-border italic pl-2 leading-relaxed text-muted mt-1 type-caption">
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
          <div className="items-start bg-primary/5 border-primary/10 gap-3 flex p-4 rounded-xl border">
            <GraduationCap size={18} className="text-primary mt-0.5" aria-hidden="true" />
            <div className="text-text/85 text-xs leading-normal">
              <span className="block text-primary mb-0.5">Freshers & student tips</span>
              Highlight key academic projects, hackathon achievements, and major course topics to capture entry-level recruiter attention.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

