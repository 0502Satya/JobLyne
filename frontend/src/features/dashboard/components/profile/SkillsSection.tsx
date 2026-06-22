"use client";

import React, { useState } from "react";
import { Button, Input } from "@/shared/ui";
import { Zap, Check, Pencil, ChevronLeft, ChevronRight, X, Plus, ThumbsUp } from "lucide-react";

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
            next[s] = "Not Set";
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

  return (
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border" id="skills">
      {/* Card Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <Zap size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">Skills & Expertise</h3>
            <p className="text-xs text-muted mt-0.5">Showcase your technical & soft skills</p>
          </div>
        </div>

        <div className="flex gap-3 items-center select-none">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary hover:text-primary-dark border-primary/10 bg-primary/5 hover:bg-primary/10 gap-1"
          >
            {isEditing ? <Check size={14} aria-hidden="true" /> : <Pencil size={14} aria-hidden="true" />}
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Card Body */}
      <div className="bg-card p-5 space-y-6 sm:p-6">
        {isEditing ? (
          /* EDITING MODE */
          <div className="space-y-6">
            {/* Search & Add */}
            <Input
              type="text"
              icon="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search & add skills (e.g. Next.js, Product Design)..."
            />

            {/* Selected Skills Chips with settings */}
            <div>
              <h4 className="mb-2.5 uppercase tracking-wider type-caption text-muted">Your Skills</h4>
              {skills.length === 0 ? (
                <p className="italic text-xs text-muted">No skills added yet. Add some to build recruiter discoverability.</p>
              ) : (
                <div className="gap-2 flex flex-wrap">
                  {skills.map((skill, idx) => {
                    const currentLevel = proficiencies[skill] || "Intermediate";
                    return (
                      <div
                        key={skill}
                        className="text-text group border-border items-center bg-bg flex-wrap pl-3 pr-1.5 py-1.5 rounded-lg shadow-xs gap-2 flex type-caption border"
                      >
                        <span>{skill}</span>
                        
                        {/* Proficiency drop */}
                        <select
                          value={currentLevel}
                          onChange={(e) => changeProficiency(skill, e.target.value)}
                          className="outline-none text-primary px-1.5 text-xs uppercase py-0.5 bg-input-bg border-input-border cursor-pointer rounded border focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="Not Set">Not Set</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                        
                        {/* Sorting & Deleting */}
                        <div className="gap-1 ml-1 opacity-100 items-center flex transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={idx === 0}
                            onClick={() => moveSkill(idx, "left")}
                            className="h-8 w-8 p-0 min-w-8"
                            title="Move Left"
                            aria-label="Move Left"
                          >
                             <ChevronLeft size={14} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={idx === skills.length - 1}
                            onClick={() => moveSkill(idx, "right")}
                            className="h-8 w-8 p-0 min-w-8"
                            title="Move Right"
                            aria-label="Move Right"
                          >
                             <ChevronRight size={14} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill)}
                            className="h-8 w-8 p-0 min-w-8 hover:text-red-500"
                            title="Remove Skill"
                            aria-label={`Remove ${skill}`}
                          >
                             <X size={14} aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trending Recommendations */}
            <div className="border-t border-border/60 pt-4">
              <h4 className="mb-2.5 uppercase tracking-wider type-caption text-muted">Trending in your industry</h4>
              <div className="gap-2 flex flex-wrap">
                {TRENDING_RECOMMENDATIONS.filter((s) => !skills.includes(s)).map((skill) => (
                  <Button
                    key={skill}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSkill(skill)}
                    className="gap-1.5 min-h-[40px]"
                  >
                    <Plus size={12} aria-hidden="true" />
                    {skill}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW MODE - PROGRESS BARS & ENDORSEMENTS */
          <div className="space-y-6">
            {skills.length === 0 ? (
              <div className="border-dashed bg-bg/50 border-border text-center py-10 rounded-xl border">
                <Zap size={24} className="text-muted/60 block mb-2" aria-hidden="true" />
                <span className="text-text mb-0.5 block type-ui">No skills added yet</span>
                <span className="block mb-4 type-caption text-muted">Add your core technical and professional skills.</span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                  className="text-primary hover:underline"
                >
                  Add skills now
                </Button>
              </div>
            ) : (
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                {skills.map((skill) => {
                  const currentLevel = proficiencies[skill] || "Intermediate";
                  const endorsements = getEndorsements(skill);
                  
                  let progressWidth = "0%";
                  let progressColor = "bg-border";
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
                    <div key={skill} className="border-border bg-bg transition-all p-4 rounded-xl border hover:shadow-xs hover:bg-bg/85">
                      <div className="flex mb-1 items-center justify-between">
                        <span className="text-text break-words type-ui">{skill}</span>
                        <span className="px-2 text-primary border text-xs uppercase border-primary/10 rounded-full py-0.5 tracking-wider bg-primary/10">
                          {currentLevel}
                        </span>
                      </div>
                      <div className="text-xs gap-1 items-center flex mb-2 text-muted">
                        <ThumbsUp size={12} className="text-primary/80" aria-hidden="true" />
                        {endorsements} endorsements
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-border/80 overflow-hidden rounded-full">
                        <div
                          className={`h-full ${progressColor} transition-all ease-out duration-500`}
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

