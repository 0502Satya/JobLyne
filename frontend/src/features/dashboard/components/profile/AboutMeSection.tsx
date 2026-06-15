"use client";

import React, { useState } from "react";

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

  const isComplete = !!data.bio;

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="about">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">description</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">About / Professional Summary</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Introduce yourself to recruiters</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsEditing(!isEditing);
              if (isEditing) setIsPreview(false); // Reset preview toggle when done editing
            }}
            className="text-primary hover:text-primary-dark text-xs font-bold flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 min-h-[40px]"
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
          /* EDIT MODE */
          <div className="space-y-6">
            <div className="flex justify-end">
              {/* Toggle Mode */}
              <div className="flex bg-bg rounded-xl p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[36px] flex items-center justify-center ${
                    !isPreview ? "bg-card text-text shadow-xs" : "text-muted hover:text-text"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[36px] flex items-center justify-center ${
                    isPreview ? "bg-card text-text shadow-xs" : "text-muted hover:text-text"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {!isPreview ? (
                <div className="space-y-3">
                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-bg p-2 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => handleToolbarClick("bold")}
                      className="w-8 h-8 rounded hover:bg-border/60 flex items-center justify-center text-text font-bold cursor-pointer"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToolbarClick("italic")}
                      className="w-8 h-8 rounded hover:bg-border/60 flex items-center justify-center text-text italic cursor-pointer"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToolbarClick("list")}
                      className="w-8 h-8 rounded hover:bg-border/60 flex items-center justify-center text-text cursor-pointer"
                      title="Bullet List"
                    >
                      <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToolbarClick("link")}
                      className="w-8 h-8 rounded hover:bg-border/60 flex items-center justify-center text-text cursor-pointer"
                      title="Link"
                    >
                      <span className="material-symbols-outlined text-base">link</span>
                    </button>
                  </div>

                  {/* Input Area */}
                  <div className="relative">
                    <textarea
                      value={data.bio || ""}
                      onChange={(e) => onChange("bio", e.target.value.slice(0, characterLimit))}
                      rows={6}
                      placeholder="I am a passionate software engineer specialized in..."
                      className="w-full bg-bg/50 border border-border rounded-xl py-3 px-4 text-sm font-medium text-text placeholder:text-muted/65 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all leading-relaxed resize-none"
                    />
                    <span className={`absolute bottom-3 right-4 text-xs font-semibold ${
                      bioLength >= characterLimit ? "text-red-500" : "text-muted"
                    }`}>
                      {bioLength} / {characterLimit} Chars
                    </span>
                  </div>

                  {/* AI Generator Suggestions Drawer */}
                  <div className="bg-bg/40 border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary font-bold">star</span>
                        AI summary suggestions
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {aiSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySuggestion(s)}
                          className="p-3.5 text-left bg-card hover:bg-bg border border-border rounded-lg transition-all text-xs font-medium text-text/80 leading-normal shadow-xs flex flex-col justify-between cursor-pointer min-h-[100px]"
                        >
                          <span className="line-clamp-3 mb-2">{s}</span>
                          <span className="text-xs font-semibold text-primary flex items-center gap-0.5">
                            Apply <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Preview Area */
                <div className="bg-bg/50 border border-border rounded-xl p-4 min-h-[150px] leading-relaxed text-text text-sm font-medium whitespace-pre-line">
                  {data.bio || <span className="text-muted italic">No summary written yet. Click edit to write one.</span>}
                </div>
              )}

              {/* Tone Recommendation tips */}
              <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <span className="material-symbols-outlined text-primary font-bold mt-0.5">tips_and_updates</span>
                <div className="text-xs text-text/85 leading-normal">
                  <span className="font-bold block mb-0.5 text-primary">Tone recommendation</span>
                  Keep it active and outcome-oriented. Highlight your top 3 stack expertise and major production-scale projects.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="space-y-4">
            <div className="text-text/90 text-sm leading-relaxed whitespace-pre-line font-medium">
              {data.bio || (
                <div className="text-center py-6 border border-dashed border-border rounded-xl bg-bg/50">
                  <span className="material-symbols-outlined text-2xl text-muted/60 mb-1.5 block">description</span>
                  <span className="text-xs font-semibold text-text block mb-0.5">No summary added yet</span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-primary text-xs font-bold hover:underline cursor-pointer min-h-[32px] px-3 mt-1.5"
                  >
                    Add summary now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
