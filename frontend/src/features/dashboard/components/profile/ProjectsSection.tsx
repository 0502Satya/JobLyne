"use client";

import React, { useState } from "react";
import { Project } from "@/types/profile";

interface ProjectsSectionProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export default function ProjectsSection({ projects = [], onChange }: ProjectsSectionProps) {
  const [techInput, setTechInput] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const addProject = () => {
    const newId = Date.now().toString();
    const newProject: Project = {
      id: newId,
      title: "",
      description: "",
      tech_stack: [],
      project_url: "",
      github_url: "",
      team_size: 1,
      role: "",
      duration: "",
    };
    const updated = [...projects, newProject];
    onChange(updated);
    setEditingId(newId);
  };

  const removeProject = (id?: string | number) => {
    if (!id) return;
    const updated = projects.filter((p) => p.id !== id);
    onChange(updated);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const updateProject = (id: string | number | undefined, field: keyof Project, value: any) => {
    if (!id) return;
    const updated = projects.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    onChange(updated);
  };

  const handleAddTech = (projId: string | number | undefined, val: string) => {
    if (!projId || !val.trim()) return;
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;

    let currentTechs: string[] = [];
    if (Array.isArray(proj.tech_stack)) {
      currentTechs = proj.tech_stack;
    } else if (typeof proj.tech_stack === "string") {
      currentTechs = (proj.tech_stack as string).split(",").map((t) => t.trim()).filter(Boolean);
    }

    if (!currentTechs.includes(val.trim())) {
      const updatedTechs = [...currentTechs, val.trim()];
      updateProject(projId, "tech_stack", updatedTechs);
    }
    setTechInput((prev) => ({ ...prev, [projId]: "" }));
  };

  const handleRemoveTech = (projId: string | number | undefined, techName: string) => {
    if (!projId) return;
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;

    let currentTechs: string[] = [];
    if (Array.isArray(proj.tech_stack)) {
      currentTechs = proj.tech_stack;
    }

    const updatedTechs = currentTechs.filter((t) => t !== techName);
    updateProject(projId, "tech_stack", updatedTechs);
  };

  const isComplete = projects.length > 0;

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-355 overflow-hidden" id="projects">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">folder_open</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Key Projects</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Showcase your practical project builds</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addProject}
            type="button"
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
          {projects.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl bg-bg/50">
              <span className="material-symbols-outlined text-3xl text-muted/60 mb-2 block">folder</span>
              <span className="text-sm font-bold text-text block mb-0.5">No projects added yet</span>
              <span className="text-xs text-muted block mb-4 font-semibold">Adding key projects boosts profile discovery index.</span>
              <button
                type="button"
                onClick={addProject}
                className="text-primary text-xs font-bold hover:underline cursor-pointer min-h-[44px] px-4"
              >
                Add first project card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projects.map((proj) => {
                const techs = Array.isArray(proj.tech_stack)
                  ? proj.tech_stack
                  : typeof proj.tech_stack === "string"
                  ? (proj.tech_stack as string).split(",").map((t) => t.trim()).filter(Boolean)
                  : [];

                const isEditing = editingId === proj.id;

                return (
                  <div
                    key={proj.id}
                    className="relative bg-bg/25 hover:bg-bg/40 border border-border rounded-2xl p-5 transition-all group"
                  >
                    {isEditing ? (
                      /* EDIT MODE FORM */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Project Title</label>
                            <input
                              type="text"
                              value={proj.title || ""}
                              onChange={(e) => updateProject(proj.id, "title", e.target.value)}
                              placeholder="e.g. E-Commerce Platform"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Your Role</label>
                            <input
                              type="text"
                              value={proj.role || ""}
                              onChange={(e) => updateProject(proj.id, "role", e.target.value)}
                              placeholder="e.g. Lead Architect"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Duration</label>
                            <input
                              type="text"
                              value={proj.duration || ""}
                              onChange={(e) => updateProject(proj.id, "duration", e.target.value)}
                              placeholder="e.g. 3 Months"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Project URL</label>
                            <input
                              type="text"
                              value={proj.project_url || ""}
                              onChange={(e) => updateProject(proj.id, "project_url", e.target.value)}
                              placeholder="https://myproject.com"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">GitHub Repo URL</label>
                            <input
                              type="text"
                              value={proj.github_url || ""}
                              onChange={(e) => updateProject(proj.id, "github_url", e.target.value)}
                              placeholder="https://github.com/myrepo"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-muted">Project Description</label>
                          <textarea
                            value={proj.description || ""}
                            onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                            rows={3}
                            placeholder="Describe the problem solved, tech stack highlights, and achievements..."
                            className="w-full bg-card border border-border rounded-xl py-2 px-3.5 text-sm font-medium text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none leading-relaxed resize-none placeholder:text-muted/65"
                          />
                        </div>

                        {/* Tech Stack tags */}
                        <div>
                          <label className="block text-xs font-semibold text-muted mb-2">Tech Stack Used</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {techs.map((tech) => (
                              <span
                                key={tech}
                                className="flex items-center gap-1 bg-card border border-border text-text pl-2.5 pr-1 py-1 rounded-lg text-xs font-medium"
                              >
                                <span>{tech}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTech(proj.id, tech)}
                                  className="hover:text-red-500 ml-1 text-muted flex items-center justify-center cursor-pointer min-h-[32px] min-w-[32px]"
                                >
                                  <span className="material-symbols-outlined text-xs">close</span>
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={techInput[proj.id as string] || ""}
                            onChange={(e) => setTechInput((prev) => ({ ...prev, [proj.id as string]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTech(proj.id, techInput[proj.id as string]);
                              }
                            }}
                            placeholder="Type a technology (e.g. Next.js) and press Enter..."
                            className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                          />
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => removeProject(proj.id)}
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
                      /* READONLY VIEW MODE */
                      <div>
                        {/* Hover Action Overlay */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                          <button
                            type="button"
                            onClick={() => setEditingId(proj.id || null)}
                            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-primary cursor-pointer shadow-xs hover:shadow-sm"
                            title="Edit Project"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProject(proj.id)}
                            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-red-500 hover:bg-red-500/10 cursor-pointer shadow-xs hover:shadow-sm"
                            title="Delete Project"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>

                        <div className="space-y-2.5 pr-20">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-text tracking-tight font-display">{proj.title || "Untitled Project"}</h4>
                            {proj.role && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wide">
                                {proj.role}
                              </span>
                            )}
                          </div>

                          {proj.duration && (
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                              Duration: {proj.duration}
                            </p>
                          )}

                          {proj.description && (
                            <p className="text-xs text-text/85 font-medium leading-relaxed whitespace-pre-line">
                              {proj.description}
                            </p>
                          )}

                          {/* Tech stack tags */}
                          {techs.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {techs.map((t) => (
                                <span key={t} className="px-2 py-0.5 bg-card text-muted text-[10px] font-bold rounded border border-border/80">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Project Links */}
                          {(proj.project_url || proj.github_url) && (
                            <div className="flex flex-wrap gap-2.5 pt-2">
                              {proj.project_url && (
                                <a
                                  href={proj.project_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">link</span>
                                  Live Demo
                                </a>
                              )}
                              {proj.github_url && (
                                <a
                                  href={proj.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-text/80 hover:underline cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">code</span>
                                  GitHub Repository
                                </a>
                              )}
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
      </div>
    </section>
  );
}
