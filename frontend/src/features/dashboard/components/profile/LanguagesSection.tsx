"use client";

import React, { useState } from "react";
import { Language } from "@/types/profile";

interface LanguagesSectionProps {
  data: Language[];
  onChange: (languages: Language[]) => void;
}

export default function LanguagesSection({ data = [], onChange }: LanguagesSectionProps) {
  const [langInput, setLangInput] = useState("");
  const [langProficiency, setLangProficiency] = useState("Intermediate");
  const [isEditing, setIsEditing] = useState(false);

  const handleAddLanguage = () => {
    const lang = langInput.trim();
    if (lang) {
      if (!data.some((l) => l.name.toLowerCase() === lang.toLowerCase())) {
        const updated = [...data, { name: lang, proficiency: langProficiency }];
        onChange(updated);
      }
      setLangInput("");
    }
  };

  const handleRemoveLanguage = (idx: number) => {
    const updated = data.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="languages">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">language</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Languages Known</h3>
            <p className="text-xs text-muted mt-0.5">Languages you can communicate in</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary hover:text-primary-dark text-xs font-bold flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 min-h-[40px]"
          >
            <span className="material-symbols-outlined text-sm font-bold">
              {isEditing ? "check" : "edit"}
            </span>
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 bg-card space-y-6">
        {isEditing ? (
          /* EDIT MODE */
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {data.length === 0 ? (
                <p className="text-xs text-muted italic my-2">No languages added yet.</p>
              ) : (
                data.map((lang, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 bg-bg border border-border text-text pl-3 pr-1 py-1 rounded-lg text-xs font-semibold"
                  >
                    <span>{lang.name}</span>
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wide">
                      {lang.proficiency}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(idx)}
                      className="hover:text-red-500 text-muted shrink-0 flex items-center justify-center cursor-pointer min-h-[32px] min-w-[32px]"
                      title="Remove Language"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border/40">
              <input
                type="text"
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                placeholder="Add Language (e.g. Spanish)"
                className="flex-1 px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
              />
              <select
                value={langProficiency}
                onChange={(e) => setLangProficiency(e.target.value)}
                className="px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddLanguage}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 flex items-center justify-center gap-1 min-h-[44px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Language
              </button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div>
            {data.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-xl bg-bg/50">
                <span className="material-symbols-outlined text-2xl text-muted/60 mb-1.5 block">language</span>
                <span className="text-xs font-semibold text-text block mb-0.5">No languages added yet</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-primary text-xs font-bold hover:underline cursor-pointer min-h-[32px] px-3 mt-1.5"
                >
                  Add languages now
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {data.map((lang, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3.5 py-2 bg-bg border border-border rounded-xl shadow-xs transition-all hover:bg-bg/85"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">language</span>
                    <span className="text-xs font-bold text-text">{lang.name}</span>
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/10 uppercase tracking-wider">
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
