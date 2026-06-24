"use client";

import React, { useState } from "react";
import { WorkExperience as Experience } from "@/types/profile";
import { Button, Input, Select, FormField } from "@/shared/ui";
import { Briefcase, Plus, BriefcaseBusiness, Star, X, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";

interface WorkExperienceSectionProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

const employmentTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

export default function WorkExperienceSection({ data = [], onChange }: WorkExperienceSectionProps) {
  const [experience, setExperience] = useState<Experience[]>(data);
  const [techInput, setTechInput] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<string | number | null>(null);

  React.useEffect(() => {
    setExperience(data);
  }, [data]);

  const addEntry = () => {
    const newId = Date.now().toString();
    const newEntry: Experience = {
      id: newId,
      title: "",
      company: "",
      start_date: "",
      end_date: "",
      description: "",
      current: false,
      employment_type: "Full-time",
      location: "",
      technologies: [],
      achievements: "",
    };
    const updated = [...experience, newEntry];
    setExperience(updated);
    onChange(updated);
    setEditingId(newId);
  };

  const removeEntry = (id?: string | number) => {
    if (!id) return;
    const updated = experience.filter((e) => e.id !== id);
    setExperience(updated);
    onChange(updated);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const updateEntry = (id: string | number | undefined, field: keyof Experience, value: any) => {
    if (!id) return;
    const updated = experience.map((e) => (e.id === id ? { ...e, [field]: value } : e));
    setExperience(updated);
    onChange(updated);
  };

  // Reordering handlers
  const moveEntry = (index: number, direction: "up" | "down") => {
    const updated = [...experience];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < updated.length) {
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      setExperience(updated);
      onChange(updated);
    }
  };

  // Technologies Tag Handlers
  const handleAddTech = (expId: string | number | undefined, value: string) => {
    if (!expId || !value.trim()) return;
    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;

    let currentTechs: string[] = [];
    if (Array.isArray(exp.technologies)) {
      currentTechs = exp.technologies;
    } else if (typeof exp.technologies === "string") {
      currentTechs = exp.technologies.split(",").map((t) => t.trim()).filter(Boolean);
    }

    if (!currentTechs.includes(value.trim())) {
      const updatedTechs = [...currentTechs, value.trim()];
      updateEntry(expId, "technologies", updatedTechs);
    }
    setTechInput((prev) => ({ ...prev, [expId]: "" }));
  };

  const handleRemoveTech = (expId: string | number | undefined, techName: string) => {
    if (!expId) return;
    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;

    let currentTechs: string[] = [];
    if (Array.isArray(exp.technologies)) {
      currentTechs = exp.technologies;
    } else if (typeof exp.technologies === "string") {
      currentTechs = exp.technologies.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const updatedTechs = currentTechs.filter((t) => t !== techName);
    updateEntry(expId, "technologies", updatedTechs);
  };

  // AI Achievement Suggester
  const handleGenerateAchievements = (expId: string | number | undefined, title: string) => {
    if (!expId || !title) return;
    const suggestions: Record<string, string> = {
      engineer: "• Led the rebuild of the analytics dashboard, cutting render time 40%.\n• Built and shipped the company-wide React design system used by 6 squads.\n• Collaborated with product leads to deliver features targeting over 50,000 active users.",
      designer: "• Designed high-fidelity prototypes and unified product style system.\n• Owned the checkout funnel UI; A/B work lifted conversion 12%.\n• Conducted user research and usability testing with 20+ clients.",
      developer: "• Developed scalable web architectures and integrated responsive components.\n• Implemented Jest unit tests to boost test coverage metrics up to 88%.\n• Optimized Webpack and build bundles to reduce bundle payload sizes.",
    };

    let matched = suggestions.engineer;
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("design") || lowerTitle.includes("ux") || lowerTitle.includes("ui")) {
      matched = suggestions.designer;
    } else if (lowerTitle.includes("dev") || lowerTitle.includes("frontend") || lowerTitle.includes("backend")) {
      matched = suggestions.developer;
    }

    const exp = experience.find((e) => e.id === expId);
    if (exp) {
      updateEntry(expId, "description", (exp.description || "") + (exp.description ? "\n" : "") + matched);
    }
  };

  const getCompanyColor = (companyName: string) => {
    const colors = [
      "bg-primary",
      "bg-experience",
      "bg-success",
      "bg-primary",
      "bg-accent",
      "bg-error",
      "bg-company-accent",
      "bg-warning"
    ];
    if (!companyName) return colors[0];
    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
      hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
      : "CO";
  };

  const formatExperienceMeta = (exp: Experience) => {
    const start = exp.start_date ? new Date(exp.start_date).getFullYear() : "";
    const end = exp.current ? "Present" : exp.end_date ? new Date(exp.end_date).getFullYear() : "";
    
    let duration = "";
    if (exp.start_date) {
      const startDate = new Date(exp.start_date);
      const endDate = exp.current ? new Date() : exp.end_date ? new Date(exp.end_date) : new Date();
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.4375));
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      
      const yearStr = years > 0 ? `${years} yr${years > 1 ? "s" : ""}` : "";
      const monthStr = months > 0 ? `${months} mo${months > 1 ? "s" : ""}` : "";
      duration = [yearStr, monthStr].filter(Boolean).join(" ");
    }
    
    return [
      start && end ? `${start} — ${end}` : "",
      duration ? `${duration}` : "",
      exp.location,
      exp.employment_type
    ].filter(Boolean).join(" • ");
  };

  return (
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border" id="experience">
      {/* Card Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <Briefcase size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">Work History</h3>
            <p className="text-xs text-muted mt-0.5">Document your career achievements</p>
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
        {experience.length === 0 ? (
          <div className="border-dashed bg-bg/50 border-border text-center py-10 rounded-xl border">
            <BriefcaseBusiness size={24} className="text-muted/60 block mb-2" aria-hidden="true" />
            <span className="text-text mb-0.5 block type-ui">No experience details added yet</span>
            <span className="block mb-4 type-caption text-muted">Adding work history increases shortlisting chance by 4x.</span>
            <Button
              type="button"
              variant="ghost"
              onClick={addEntry}
              className="text-primary hover:underline"
            >
              Add first experience card
            </Button>
          </div>
        ) : (
          <div className="space-y-8 border-l-2 relative border-border/60 ml-4 py-2 pl-6 sm:pl-8">
            {experience.map((exp, idx) => {
              const techs = Array.isArray(exp.technologies)
                ? exp.technologies
                : typeof exp.technologies === "string"
                ? exp.technologies.split(",").map((t) => t.trim()).filter(Boolean)
                : [];

              const isEditing = editingId === exp.id;
              const companyColor = getCompanyColor(exp.company || "");
              const initials = getInitials(exp.company || "");

              return (
                <div key={exp.id} className="min-w-0 relative group">
                  {/* Timeline Dot/Badge */}
                  <div className={`-left-[44px] absolute top-1.5 rounded-full h-8 w-8 sm:h-10 sm:-left-[52px] sm:w-10 ${companyColor} justify-center shrink-0 border-card type-badge items-center text-white select-none shadow-xs border-4 flex`}>
                    {initials}
                  </div>

                  {isEditing ? (
                    /* Editing Form Mode */
                    <div className="border-border bg-bg/40 p-5 shadow-inner space-y-4 rounded-xl border">
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <Input
                          label="Job title"
                          value={exp.title || ""}
                          onChange={(e) => updateEntry(exp.id, "title", e.target.value)}
                          placeholder="e.g. Lead Frontend Developer"
                        />
                        <Input
                          label="Company name"
                          value={exp.company || ""}
                          onChange={(e) => updateEntry(exp.id, "company", e.target.value)}
                          placeholder="e.g. Google"
                        />
                      </div>

                      <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                        <FormField label="Employment type">
                          <Select
                            value={exp.employment_type || "Full-time"}
                            onChange={(e) => updateEntry(exp.id, "employment_type", e.target.value)}
                            options={employmentTypes.map((t) => ({ value: t, label: t }))}
                          />
                        </FormField>

                        <Input
                          label="Location"
                          value={exp.location || ""}
                          onChange={(e) => updateEntry(exp.id, "location", e.target.value)}
                          placeholder="San Francisco, CA"
                        />

                        <Input
                          label="Start date"
                          type="date"
                          value={exp.start_date || ""}
                          onChange={(e) => updateEntry(exp.id, "start_date", e.target.value)}
                          className="cursor-pointer"
                        />

                        <Input
                          label="End date"
                          type="date"
                          value={exp.end_date || ""}
                          disabled={exp.current}
                          onChange={(e) => updateEntry(exp.id, "end_date", e.target.value)}
                          className="cursor-pointer"
                        />
                      </div>

                      <div className="border border-border p-3 items-center bg-card flex rounded-xl justify-between">
                        <div>
                          <p className="text-text type-caption">I currently work here</p>
                          <p className="text-xs mt-0.5 text-muted">This will automatically mark end date as present</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={exp.current}
                          onClick={() => {
                            updateEntry(exp.id, "current", !exp.current);
                            if (!exp.current) {
                              updateEntry(exp.id, "end_date", "");
                            }
                          }}
                          className={`flex-shrink-0 relative min-h-[44px] w-12 h-6 rounded-full transition-colors cursor-pointer ${
                            exp.current ? "bg-primary" : "bg-border"
                          }`}
                        >
                          <span
                            className={`top-0.5 h-5 absolute transition-transform w-5 rounded-full shadow-xs bg-card ${
                              exp.current ? "right-0.5" : "left-0.5"
                            }`}
                          ></span>
                        </button>
                      </div>

                      {/* Description & AI suggestor */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Responsibilities and achievements</label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateAchievements(exp.id, exp.title || "")}
                            className="text-primary hover:text-primary-dark gap-0.5"
                          >
                            <Star size={14} className="type-ui" aria-hidden="true" />
                            Generate with AI
                          </Button>
                        </div>
                        <textarea
                          value={exp.description || ""}
                          onChange={(e) => updateEntry(exp.id, "description", e.target.value)}
                          rows={4}
                          placeholder="Detail your responsibilities and achievements..."
                          className="w-full text-text outline-none transition-all rounded-md py-3 border bg-input-bg border-input-border focus:ring-2 focus:border-primary focus:ring-primary placeholder:text-muted disabled:opacity-50 disabled:cursor-not-allowed resize-none leading-relaxed px-4"
                        />
                      </div>

                      {/* Technologies tags used */}
                      <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Technologies Used</label>
                        <div className="gap-2 flex mb-2 flex-wrap">
                          {techs.map((tech) => (
                            <span
                              key={tech}
                              className="text-text py-1 border-border gap-1 items-center pr-1 pl-2.5 rounded-lg bg-card flex type-caption border"
                            >
                              <span>{tech}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTech(exp.id, tech)}
                                className="hover:text-error min-w-8 h-8 p-0 flex items-center justify-center text-muted"
                                aria-label={`Remove ${tech}`}
                              >
                                 <X size={12} aria-hidden="true" />
                              </Button>
                            </span>
                          ))}
                        </div>
                        <Input
                          type="text"
                          value={techInput[exp.id as string] || ""}
                          onChange={(e) => setTechInput((prev) => ({ ...prev, [exp.id as string]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTech(exp.id, techInput[exp.id as string]);
                            }
                          }}
                          placeholder="Type a technology (e.g. React) and press Enter..."
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2.5">
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => removeEntry(exp.id)}
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
                          disabled={idx === experience.length - 1}
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
                          onClick={() => setEditingId(exp.id || null)}
                          className="h-10 w-10 p-0 rounded-lg"
                          title="Edit experience"
                          aria-label="Edit experience"
                        >
                           <Pencil size={16} aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeEntry(exp.id)}
                          className="h-10 w-10 p-0 rounded-lg text-error hover:text-error/90 hover:bg-error-bg"
                          title="Delete experience"
                          aria-label="Delete experience"
                        >
                           <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </div>

                      <div className="min-w-0 pr-24 space-y-1.5">
                        <h4 className="text-text break-words leading-snug tracking-tight type-card-title">
                          {exp.title || "Untitled Role"}
                        </h4>
                        <p className="break-words type-ui text-text/80">
                          {exp.company || "Untitled Company"}
                        </p>
                        <p className="break-words text-xs uppercase leading-relaxed tracking-wider text-muted">
                          {formatExperienceMeta(exp)}
                        </p>

                        {/* Description Points */}
                        {exp.description && (
                          <ul className="list-disc type-caption mt-2.5 space-y-1.5 leading-relaxed text-text/85 pl-5">
                            {exp.description.split("\n").map((line, lIdx) => {
                              const cleanLine = line.replace(/^[•\-\*\s]+/, "").trim();
                              return cleanLine ? <li key={lIdx}>{cleanLine}</li> : null;
                            })}
                          </ul>
                        )}

                        {/* Tech Badges */}
                        {techs.length > 0 && (
                          <div className="flex pt-3.5 flex-wrap gap-1.5">
                            {techs.map((tech) => (
                              <span key={tech} className="px-2 text-xs border-border/80 bg-bg py-0.5 rounded text-muted border">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

