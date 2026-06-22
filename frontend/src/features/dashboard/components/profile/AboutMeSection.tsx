"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui";
import { FileText, Check, Pencil, List, Link, Star, ArrowRight, Lightbulb } from "lucide-react";

interface AboutMeSectionProps {
  data: {
    bio?: string;
  };
  onChange: (field: "bio", value: string) => void;
}

export default function AboutMeSection({ data, onChange }: AboutMeSectionProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const characterLimit = 1000;
  const bioLength = data.bio?.length || 0;

  // Pre-configured AI Career summary suggestions
  const aiSuggestions = [
    "Experienced software engineer specialized in building robust and scalable cloud-native web applications with React, TypeScript, and Node.js. Passionate about automated testing and system design.",
    "Detail-oriented UX/UI Designer with 5+ years of experience designing mobile first products and digital interfaces. Skilled in wireframing, interactive prototyping, and user-centric design methodologies.",
    "Driven and proactive Computer Science graduate seeking an entry level position to leverage technical skills in Python, algorithms, and SQL database management.",
  ];

  const handleToolbarClick = (syntax: string) => {
    const text = data.bio || "";
    let inserted = "";
    if (syntax === "bold") inserted = `**text**`;
    else if (syntax === "italic") inserted = `*text*`;
    else if (syntax === "list") inserted = `\n- Item 1\n- Item 2`;
    else if (syntax === "link") inserted = `[link title](https://url.com)`;

    onChange("bio", text + inserted);
  };

  const handleApplySuggestion = (suggestion: string) => {
    onChange("bio", suggestion);
  };

  return (
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border" id="about">
      {/* Card Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <FileText size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">About / Professional Summary</h3>
            <p className="text-xs text-muted mt-0.5">Introduce yourself to recruiters</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsEditing(!isEditing);
              if (isEditing) setIsPreview(false); // Reset preview toggle when done editing
            }}
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
      <div className="bg-card p-5 space-y-6 sm:p-6">
        {isEditing ? (
          /* EDIT MODE */
          <div className="space-y-6">
            <div className="flex justify-end">
              {/* Toggle Mode */}
              <div className="border-border bg-bg p-1 flex rounded-xl border">
                <Button
                  type="button"
                  variant={!isPreview ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsPreview(false)}
                  className="min-h-[36px]"
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant={isPreview ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsPreview(true)}
                  className="min-h-[36px]"
                >
                  Preview
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {!isPreview ? (
                <div className="space-y-3">
                  {/* Formatting Toolbar */}
                  <div className="gap-1.5 border-border items-center p-2 bg-bg flex-wrap rounded-lg flex border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolbarClick("bold")}
                      className="h-8 w-8 p-0 min-w-8 font-bold text-text hover:bg-border/60"
                      title="Bold"
                      aria-label="Bold text"
                    >
                      B
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolbarClick("italic")}
                      className="h-8 w-8 p-0 min-w-8 italic text-text hover:bg-border/60"
                      title="Italic"
                      aria-label="Italic text"
                    >
                      I
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolbarClick("list")}
                      className="h-8 w-8 p-0 min-w-8 text-text hover:bg-border/60"
                      title="Bullet List"
                      aria-label="Bullet list"
                    >
                      <List size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolbarClick("link")}
                      className="h-8 w-8 p-0 min-w-8 text-text hover:bg-border/60"
                      title="Link"
                      aria-label="Insert link"
                    >
                      <Link size={16} aria-hidden="true" />
                    </Button>
                  </div>

                  {/* Input Area */}
                  <div className="relative">
                    <textarea
                      value={data.bio || ""}
                      onChange={(e) => onChange("bio", e.target.value.slice(0, characterLimit))}
                      rows={6}
                      placeholder="I am a passionate software engineer specialized in..."
                      className="w-full text-text outline-none transition-all rounded-md py-3 border bg-input-bg border-input-border focus:ring-2 focus:border-primary focus:ring-primary placeholder:text-muted resize-none leading-relaxed px-4"
                    />
                    <span className={`bottom-3 absolute right-4 type-caption ${
                      bioLength >= characterLimit ? "text-red-500" : "text-muted"
                    }`}>
                      {bioLength} / {characterLimit} Chars
                    </span>
                  </div>

                  {/* AI Generator Suggestions Drawer */}
                  <div className="border-border space-y-3 bg-bg/40 p-4 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <span className="gap-1.5 items-center flex type-caption text-muted">
                        <Star size={14} className="text-primary fill-primary" aria-hidden="true" />
                        AI summary suggestions
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {aiSuggestions.map((s, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant="outline"
                          onClick={() => handleApplySuggestion(s)}
                          className="text-text/80 h-auto min-h-[100px] p-3.5 leading-normal transition-all rounded-lg flex-col items-stretch text-left hover:bg-bg bg-card text-xs font-normal shadow-xs border hover:border-primary/40"
                        >
                          <span className="mb-2 line-clamp-3">{s}</span>
                          <span className="text-primary items-center gap-1 flex type-caption font-semibold mt-auto">
                            Apply <ArrowRight size={12} aria-hidden="true" />
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Preview Area */
                <div className="text-text bg-bg/50 border-border min-h-[150px] leading-relaxed type-ui whitespace-pre-line p-4 rounded-xl border">
                  {data.bio || <span className="italic text-muted">No summary written yet. Click edit to write one.</span>}
                </div>
              )}

              {/* Tone Recommendation tips */}
              <div className="items-start bg-primary/5 border-primary/10 gap-3 flex p-4 rounded-xl border">
                <Lightbulb size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-text/85 text-xs leading-normal">
                  <span className="block text-primary mb-0.5">Tone recommendation</span>
                  Keep it active and outcome-oriented. Highlight your top 3 stack expertise and major production-scale projects.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="space-y-4">
            <div className="leading-relaxed type-ui text-text/90 whitespace-pre-line">
              {data.bio || (
                <div className="border-dashed bg-bg/50 border-border text-center py-6 rounded-xl border">
                  <FileText size={24} className="mb-1.5 text-muted/60 block mx-auto" aria-hidden="true" />
                  <span className="text-text mb-0.5 block type-caption">No summary added yet</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-primary mt-1.5 hover:underline"
                  >
                    Add summary now
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

