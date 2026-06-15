"use client";

import React, { useState } from "react";

interface SkillsSectionProps {
  data: string[];
  onChange: (skills: string[]) => void;
}

const TRENDING_RECOMMENDATIONS = ["Next.js", "Docker", "Kubernetes", "Tailwind CSS", "Framer Motion", "System Design"];

export default function SkillsSection({ data = [], onChange }: SkillsSectionProps) {
  const [skills, setSkills] = useState<string[]>(data);
  const [inputValue, setInputValue] = useState("");
  const [proficiencies, setProficiencies] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    setSkills(data);
  }, [data]);

  // Seed default proficiencies if empty
  React.useEffect(() => {
    if (skills.length > 0) {
      setProficiencies((prev) => {
        const next = { ...prev };
        skills.forEach((s) => {
          if (!next[s]) {
            // Assign a stable default level based on character length
            const hash = s.length % 4;
            const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
            next[s] = levels[hash];
          }
        });
        return next;
      });
    }
  }, [skills]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      onChange(updated);
      setProficiencies((prev) => ({ ...prev, [trimmed]: "Intermediate" }));
    }
    setInputValue("");
  };

  const removeSkill = (skill: string) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const changeProficiency = (skill: string, level: string) => {
    setProficiencies((prev) => ({ ...prev, [skill]: level }));
  };

  const moveSkill = (index: number, direction: "left" | "right") => {
    const updated = [...skills];
    const target = direction === "left" ? index - 1 : index + 1;
    if (target >= 0 && target < updated.length) {
      const temp = updated[index];
      updated[index] = updated[target];
      updated[target] = temp;
      setSkills(updated);
      onChange(updated);
    }
  };

  const getEndorsements = (skillName: string) => {
    if (!skillName) return 0;
    let hash = 0;
    for (let i = 0; i < skillName.length; i++) {
      hash = skillName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 20) + 3; // between 3 and 22 endorsements
  };

  const isComplete = skills.length >= 3;

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="skills">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">bolt</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Skills & Expertise</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Showcase your technical & soft skills</p>
          </div>
        </div>

        <div className="flex items-center gap-3 select-none">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary hover:text-primary-dark text-xs font-bold flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 mr-1 min-h-[40px] flex items-center justify-center"
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
          /* EDITING MODE */
          <div className="space-y-6">
            {/* Search & Add */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-muted">search</span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search & add skills (e.g. Next.js, Product Design)..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
              />
            </div>

            {/* Selected Skills Chips with settings */}
            <div>
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2.5">Your Skills</h4>
              {skills.length === 0 ? (
                <p className="text-xs text-muted italic">No skills added yet. Add some to build recruiter discoverability.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => {
                    const currentLevel = proficiencies[skill] || "Intermediate";
                    return (
                      <div
                        key={skill}
                        className="group flex flex-wrap items-center bg-bg border border-border text-text pl-3 pr-1.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs gap-2"
                      >
                        <span>{skill}</span>
                        
                        {/* Proficiency drop */}
                        <select
                          value={currentLevel}
                          onChange={(e) => changeProficiency(skill, e.target.value)}
                          className="bg-card border border-border rounded text-[10px] font-bold uppercase text-primary px-1.5 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>

                        {/* Sorting & Deleting */}
                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ml-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSkill(idx, "left")}
                            className="text-muted hover:text-primary disabled:opacity-30 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="Move Left"
                          >
                            <span className="material-symbols-outlined text-xs">chevron_left</span>
                          </button>
                          <button
                            type="button"
                            disabled={idx === skills.length - 1}
                            onClick={() => moveSkill(idx, "right")}
                            className="text-muted hover:text-primary disabled:opacity-30 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="Move Right"
                          >
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-muted hover:text-red-500 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="Remove Skill"
                          >
                            <span className="material-symbols-outlined text-xs font-bold">close</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trending Recommendations */}
            <div className="pt-4 border-t border-border/60">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2.5">Trending in your industry</h4>
              <div className="flex flex-wrap gap-2">
                {TRENDING_RECOMMENDATIONS.filter((s) => !skills.includes(s)).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold text-text/80 hover:border-primary hover:text-primary hover:bg-bg transition-all cursor-pointer min-h-[44px]"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW MODE - PROGRESS BARS & ENDORSEMENTS */
          <div className="space-y-6">
            {skills.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl bg-bg/50">
                <span className="material-symbols-outlined text-3xl text-muted/60 mb-2 block">bolt</span>
                <span className="text-sm font-bold text-text block mb-0.5">No skills added yet</span>
                <span className="text-xs text-muted block mb-4 font-semibold">Add your core technical and professional skills.</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                  className="text-primary text-xs font-bold hover:underline cursor-pointer min-h-[44px] px-4"
                >
                  Add skills now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => {
                  const currentLevel = proficiencies[skill] || "Intermediate";
                  const endorsements = getEndorsements(skill);
                  
                  let progressWidth = "60%";
                  let progressColor = "bg-primary/75";
                  if (currentLevel === "Beginner") {
                    progressWidth = "30%";
                    progressColor = "bg-amber-500/80";
                  } else if (currentLevel === "Intermediate") {
                    progressWidth = "60%";
                    progressColor = "bg-primary/75";
                  } else if (currentLevel === "Advanced") {
                    progressWidth = "80%";
                    progressColor = "bg-primary/90";
                  } else if (currentLevel === "Expert") {
                    progressWidth = "100%";
                    progressColor = "bg-primary";
                  }

                  return (
                    <div key={skill} className="bg-bg border border-border rounded-xl p-4 transition-all hover:bg-bg/85 hover:shadow-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-text break-words font-display">{skill}</span>
                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/10 uppercase tracking-wider">
                          {currentLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted font-semibold mb-2">
                        <span className="material-symbols-outlined text-xs text-primary/80">thumb_up</span>
                        {endorsements} endorsements
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-border/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                          style={{ width: progressWidth }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
