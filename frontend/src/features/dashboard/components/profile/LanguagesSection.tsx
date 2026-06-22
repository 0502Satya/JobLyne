"use client";

import React, { useState } from "react";
import { Language } from "@/types/profile";
import { Button, Input, Select } from "@/shared/ui";
import { Languages, Check, Pencil, X, Plus } from "lucide-react";

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
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border" id="languages">
      {/* Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <Languages size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">Languages Known</h3>
            <p className="text-xs text-muted mt-0.5">Languages you can communicate in</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
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

      {/* Body */}
      <div className="bg-card p-5 space-y-6 sm:p-6">
        {isEditing ? (
          /* EDIT MODE */
          <div className="space-y-5">
            <div className="gap-2 flex min-h-[40px] flex-wrap">
              {data.length === 0 ? (
                <p className="italic my-2 text-xs text-muted">No languages added yet.</p>
              ) : (
                data.map((lang, idx) => (
                  <span
                    key={idx}
                    className="text-text py-1 gap-1.5 border-border items-center pr-1 bg-bg pl-3 rounded-lg flex type-caption border"
                  >
                    <span>{lang.name}</span>
                    <span className="text-primary px-1.5 text-xs uppercase tracking-wide py-0.5 rounded bg-primary/10">
                      {lang.proficiency}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLanguage(idx)}
                      className="hover:text-red-500 min-w-8 h-8 p-0 flex items-center justify-center text-muted"
                      title="Remove Language"
                      aria-label={`Remove ${lang.name}`}
                    >
                      <X size={12} aria-hidden="true" />
                    </Button>
                  </span>
                ))
              )}
            </div>

            <div className="border-border/40 border-t pt-3 gap-3 flex flex-col sm:flex-row items-end">
              <div className="flex-1 w-full">
                <Input
                  type="text"
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  placeholder="Add Language (e.g. Spanish)"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={langProficiency}
                  onChange={(e) => setLangProficiency(e.target.value)}
                  options={[
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Advanced", label: "Advanced" },
                    { value: "Expert", label: "Expert" },
                  ]}
                />
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddLanguage}
                className="gap-2 min-h-[40px] w-full sm:w-auto"
              >
                <Plus size={16} aria-hidden="true" />
                Add Language
              </Button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div>
            {data.length === 0 ? (
              <div className="border-dashed bg-bg/50 border-border text-center py-6 rounded-xl border">
                <Languages size={24} className="mb-1.5 text-muted/60 block mx-auto" aria-hidden="true" />
                <span className="text-text mb-0.5 block type-caption">No languages added yet</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-primary mt-1.5 hover:underline"
                >
                  Add languages now
                </Button>
              </div>
            ) : (
              <div className="flex gap-2.5 flex-wrap">
                {data.map((lang, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 border-border items-center gap-2 bg-bg transition-all shadow-xs flex py-2 rounded-xl border hover:bg-bg/85"
                  >
                    <Languages size={14} className="text-primary" aria-hidden="true" />
                    <span className="text-text type-caption">{lang.name}</span>
                    <span className="px-2 text-primary border text-xs uppercase border-primary/10 rounded-full py-0.5 tracking-wider bg-primary/10">
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

