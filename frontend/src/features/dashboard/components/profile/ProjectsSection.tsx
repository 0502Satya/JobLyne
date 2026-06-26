"use client";

import React, { useState } from "react";
import { Project } from "@/types/profile";
import { Button, Input, FormField, ConfirmDialog } from "@/shared/ui";
import { FolderOpen, Plus, Folder, X, Pencil, Trash2, Link as LinkIcon, Code2 } from "lucide-react";

interface ProjectsSectionProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export default function ProjectsSection({ projects = [], onChange }: ProjectsSectionProps) {
  const [techInput, setTechInput] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

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
    } else if (typeof proj.tech_stack === "string") {
      currentTechs = (proj.tech_stack as string).split(",").map((t) => t.trim()).filter(Boolean);
    }

    const updatedTechs = currentTechs.filter((t) => t !== techName);
    updateProject(projId, "tech_stack", updatedTechs);
  };

  return (
    <section className="border-border rounded-2xl duration-355 overflow-hidden transition-all shadow-sm bg-card border" id="projects">
      {/* Card Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <FolderOpen size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">Key Projects</h3>
            <p className="text-xs text-muted mt-0.5">Showcase your practical project builds</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addProject}
            className="text-primary hover:text-primary-dark border-primary/10 bg-primary/5 hover:bg-primary/10 gap-2"
          >
            <Plus size={16} aria-hidden="true" />
            Add
          </Button>
        </div>
      </div>

      {/* Card Body */}
      <div className="bg-card p-5 space-y-6 sm:p-6">
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="border-dashed bg-bg/50 border-border text-center py-10 rounded-xl border">
              <Folder size={32} className="text-muted/60 block mx-auto mb-2" aria-hidden="true" />
              <span className="text-text mb-0.5 block type-ui">No projects added yet</span>
              <span className="block mb-4 type-caption text-muted">Adding key projects boosts profile discovery index.</span>
              <Button
                type="button"
                variant="ghost"
                onClick={addProject}
                className="text-primary hover:underline"
              >
                Add first project card
              </Button>
            </div>
          ) : (
            <div className="gap-6 grid grid-cols-1">
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
                    className="border-border group bg-bg/25 rounded-2xl relative transition-all p-5 border hover:bg-bg/40"
                  >
                    {isEditing ? (
                      /* EDIT MODE FORM */
                      <div className="space-y-4">
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                          <Input
                            label="Project title"
                            value={proj.title || ""}
                            onChange={(e) => updateProject(proj.id, "title", e.target.value)}
                            placeholder="e.g. E-Commerce Platform"
                          />
                          <Input
                            label="Your role"
                            value={proj.role || ""}
                            onChange={(e) => updateProject(proj.id, "role", e.target.value)}
                            placeholder="e.g. Lead Architect"
                          />
                        </div>

                        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                          <Input
                            label="Duration"
                            value={proj.duration || ""}
                            onChange={(e) => updateProject(proj.id, "duration", e.target.value)}
                            placeholder="e.g. 3 Months"
                          />
                          <Input
                            label="Project URL"
                            value={proj.project_url || ""}
                            onChange={(e) => updateProject(proj.id, "project_url", e.target.value)}
                            placeholder="https://myproject.com"
                          />
                          <Input
                            label="GitHub repo URL"
                            value={proj.github_url || ""}
                            onChange={(e) => updateProject(proj.id, "github_url", e.target.value)}
                            placeholder="https://github.com/myrepo"
                          />
                        </div>

                        <FormField label="Project description">
                          <textarea
                            value={proj.description || ""}
                            onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                            rows={3}
                            placeholder="Describe the problem solved, tech stack highlights, and achievements..."
                            className="w-full text-text outline-none transition-all rounded-md py-3 border bg-input-bg border-input-border focus:ring-2 focus:border-primary focus:ring-primary placeholder:text-muted disabled:opacity-50 disabled:cursor-not-allowed resize-none leading-relaxed px-4"
                          />
                        </FormField>

                        {/* Tech Stack tags */}
                        <div>
                          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Tech Stack Used</label>
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
                                  onClick={() => handleRemoveTech(proj.id, tech)}
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
                            value={techInput[proj.id as string] || ""}
                            onChange={(e) => setTechInput((prev) => ({ ...prev, [proj.id as string]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddTech(proj.id, techInput[proj.id as string]);
                              }
                            }}
                            placeholder="Type a technology (e.g. Next.js) and press Enter..."
                          />
                        </div>

                        <div className="pt-2 flex justify-end gap-2.5">
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => setDeletingId(proj.id || null)}
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
                      /* READONLY VIEW MODE */
                      <div>
                        {/* Hover Action Overlay */}
                        <div className="right-3 gap-1.5 z-10 absolute opacity-100 items-center transition-opacity flex top-3 lg:opacity-0 lg:group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(proj.id || null)}
                            className="h-10 w-10 p-0 rounded-lg flex items-center justify-center text-muted border-border hover:text-primary"
                            title="Edit project"
                            aria-label="Edit project"
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingId(proj.id || null)}
                            className="h-10 w-10 p-0 rounded-lg flex items-center justify-center text-error border-border hover:bg-error-bg"
                            title="Delete project"
                            aria-label="Delete project"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </Button>
                        </div>

                        <div className="space-y-2.5 pr-20">
                          <div className="gap-2 flex flex-wrap items-center">
                            <h4 className="text-text tracking-tight type-card-title">{proj.title || "Untitled Project"}</h4>
                            {proj.role && (
                              <span className="px-2 text-primary text-xs uppercase tracking-wide py-0.5 rounded bg-primary/10">
                                {proj.role}
                              </span>
                            )}
                          </div>

                          {proj.duration && (
                            <p className="text-xs uppercase tracking-wider text-muted">
                              Duration: {proj.duration}
                            </p>
                          )}

                          {proj.description && (
                            <p className="leading-relaxed whitespace-pre-line text-text/85 type-caption">
                              {proj.description}
                            </p>
                          )}

                          {/* Tech stack tags */}
                          {techs.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {techs.map((t) => (
                                <span key={t} className="px-2 text-xs border-border/80 py-0.5 bg-card rounded text-muted border">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Project Links */}
                          {(proj.project_url || proj.github_url) && (
                            <div className="pt-2 flex gap-2.5 flex-wrap">
                              {proj.project_url && (
                                <Button
                                  as="a"
                                  variant="ghost"
                                  size="sm"
                                  href={proj.project_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary-dark gap-1"
                                >
                                  <LinkIcon size={14} aria-hidden="true" />
                                  Live Demo
                                </Button>
                              )}
                              {proj.github_url && (
                                <Button
                                  as="a"
                                  variant="ghost"
                                  size="sm"
                                  href={proj.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-text hover:bg-surface-3 gap-1"
                                >
                                  <Code2 size={14} aria-hidden="true" />
                                  GitHub Repository
                                </Button>
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
      
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            removeProject(deletingId);
          }
        }}
        title="Delete Project"
        description={
          deletingId
            ? `This will permanently remove '${projects.find((p) => p.id === deletingId)?.title || "Untitled Project"}' from your profile.`
            : "This will permanently remove this project entry from your profile."
        }
        confirmLabel="Delete Project"
        variant="danger"
      />
    </section>
  );
}

