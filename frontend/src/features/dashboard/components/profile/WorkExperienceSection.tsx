"use client";

import React, { useState } from "react";
import { WorkExperience as Experience } from "@/types/profile";

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
      "bg-orange-500",
      "bg-emerald-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-rose-500",
      "bg-cyan-500",
      "bg-amber-500"
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
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="experience">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">work</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Work History</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Document your career achievements</p>
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
        {experience.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl bg-bg/50">
            <span className="material-symbols-outlined text-3xl text-muted/60 mb-2 block">work_history</span>
            <span className="text-sm font-bold text-text block mb-0.5">No experience details added yet</span>
            <span className="text-xs text-muted block mb-4 font-semibold">Adding work history increases shortlisting chance by 4x.</span>
            <button
              type="button"
              onClick={addEntry}
              className="text-primary text-xs font-bold hover:underline cursor-pointer min-h-[44px] px-4"
            >
              Add first experience card
            </button>
          </div>
        ) : (
          <div className="relative border-l-2 border-border/60 ml-4 pl-6 sm:pl-8 space-y-8 py-2">
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
                <div key={exp.id} className="relative group min-w-0">
                  {/* Timeline Dot/Badge */}
                  <div className={`absolute -left-[43px] sm:-left-[51px] top-1.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full ${companyColor} border-4 border-card shadow-xs flex items-center justify-center text-white text-[10px] sm:text-xs font-extrabold shrink-0 select-none`}>
                    {initials}
                  </div>

                  {isEditing ? (
                    /* Editing Form Mode */
                    <div className="bg-bg/40 border border-border rounded-xl p-5 space-y-4 shadow-inner">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted mb-1">Job Title</label>
                          <input
                            type="text"
                            value={exp.title || ""}
                            onChange={(e) => updateEntry(exp.id, "title", e.target.value)}
                            placeholder="e.g. Lead Frontend Developer"
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted mb-1">Company Name</label>
                          <input
                            type="text"
                            value={exp.company || ""}
                            onChange={(e) => updateEntry(exp.id, "company", e.target.value)}
                            placeholder="e.g. Google"
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted mb-1">Employment Type</label>
                          <select
                            value={exp.employment_type || "Full-time"}
                            onChange={(e) => updateEntry(exp.id, "employment_type", e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text cursor-pointer"
                          >
                            {employmentTypes.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-muted mb-1">Location</label>
                          <input
                            type="text"
                            value={exp.location || ""}
                            onChange={(e) => updateEntry(exp.id, "location", e.target.value)}
                            placeholder="San Francisco, CA"
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-muted mb-1">Start Date</label>
                          <input
                            type="date"
                            value={exp.start_date || ""}
                            onChange={(e) => updateEntry(exp.id, "start_date", e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-muted mb-1">End Date</label>
                          <input
                            type="date"
                            value={exp.end_date || ""}
                            disabled={exp.current}
                            onChange={(e) => updateEntry(exp.id, "end_date", e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text disabled:opacity-50 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-text">I currently work here</p>
                          <p className="text-[10px] text-muted font-semibold mt-0.5">This will automatically mark end date as present</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateEntry(exp.id, "current", !exp.current);
                            if (!exp.current) {
                              updateEntry(exp.id, "end_date", "");
                            }
                          }}
                          className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 min-h-[44px] cursor-pointer ${
                            exp.current ? "bg-primary" : "bg-border"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 bg-card rounded-full shadow-xs transition-transform ${
                              exp.current ? "right-0.5" : "left-0.5"
                            }`}
                          ></span>
                        </button>
                      </div>

                      {/* Description & AI suggestor */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-muted">Responsibilities & Achievements</label>
                          <button
                            type="button"
                            onClick={() => handleGenerateAchievements(exp.id, exp.title || "")}
                            className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline cursor-pointer min-h-[40px] px-2"
                          >
                            <span className="material-symbols-outlined text-sm font-bold">star</span>
                            Generate with AI
                          </button>
                        </div>
                        <textarea
                          value={exp.description || ""}
                          onChange={(e) => updateEntry(exp.id, "description", e.target.value)}
                          rows={4}
                          placeholder="Detail your responsibilities and achievements..."
                          className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm font-medium text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none leading-relaxed resize-none placeholder:text-muted/65"
                        />
                      </div>

                      {/* Technologies tags used */}
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-2">Technologies Used</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {techs.map((tech) => (
                            <span
                              key={tech}
                              className="flex items-center gap-1 bg-card border border-border text-text pl-2.5 pr-1 py-1 rounded-lg text-xs font-medium"
                            >
                              <span>{tech}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTech(exp.id, tech)}
                                className="hover:text-red-500 ml-1 text-muted flex items-center justify-center cursor-pointer min-h-[32px] min-w-[32px]"
                              >
                                <span className="material-symbols-outlined text-xs">close</span>
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
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
                          className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                        />
                      </div>

                      <div className="flex justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => removeEntry(exp.id)}
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
                          disabled={idx === experience.length - 1}
                          onClick={() => moveEntry(idx, "down")}
                          className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-primary disabled:opacity-30 cursor-pointer shadow-xs hover:shadow-sm"
                          title="Move Down"
                        >
                          <span className="material-symbols-outlined text-base">arrow_downward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(exp.id || null)}
                          className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-primary cursor-pointer shadow-xs hover:shadow-sm"
                          title="Edit Experience"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEntry(exp.id)}
                          className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-red-500 hover:bg-red-500/10 cursor-pointer shadow-xs hover:shadow-sm"
                          title="Delete Experience"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 min-w-0 pr-24">
                        <h4 className="text-base font-bold text-text tracking-tight leading-snug break-words font-display">
                          {exp.title || "Untitled Role"}
                        </h4>
                        <p className="text-sm font-semibold text-text/80 break-words">
                          {exp.company || "Untitled Company"}
                        </p>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider leading-relaxed break-words">
                          {formatExperienceMeta(exp)}
                        </p>

                        {/* Description Points */}
                        {exp.description && (
                          <ul className="list-disc pl-5 mt-2.5 space-y-1.5 text-xs text-text/85 leading-relaxed font-medium">
                            {exp.description.split("\n").map((line, lIdx) => {
                              const cleanLine = line.replace(/^[•\-\*\s]+/, "").trim();
                              return cleanLine ? <li key={lIdx}>{cleanLine}</li> : null;
                            })}
                          </ul>
                        )}

                        {/* Tech Badges */}
                        {techs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-3.5">
                            {techs.map((tech) => (
                              <span key={tech} className="px-2 py-0.5 bg-bg text-muted text-[10px] font-bold rounded border border-border/80">
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
