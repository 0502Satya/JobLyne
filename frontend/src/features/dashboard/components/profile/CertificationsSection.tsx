"use client";

import React, { useState } from "react";
import { Certification } from "@/types/profile";

interface CertificationsSectionProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export default function CertificationsSection({ certifications = [], onChange }: CertificationsSectionProps) {
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const addCertification = () => {
    const newId = Date.now().toString();
    const newCert: Certification = {
      id: newId,
      name: "",
      issuing_organization: "",
      issue_date: "",
      expiry_date: "",
      credential_id: "",
      credential_url: "",
    };
    onChange([...certifications, newCert]);
    setEditingId(newId);
  };

  const removeCertification = (id?: string | number) => {
    if (!id) return;
    const updated = certifications.filter((c) => c.id !== id);
    onChange(updated);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const updateCertification = (id: string | number | undefined, field: keyof Certification, value: any) => {
    if (!id) return;
    const updated = certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    onChange(updated);
  };

  const formatDateLabel = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm transition-all duration-350 overflow-hidden" id="certifications">
      {/* Card Header */}
      <div className="w-full flex items-center justify-between p-5 text-left border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">workspace_premium</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text leading-tight font-display">Certifications & Courses</h3>
            <p className="text-xs text-muted mt-0.5 font-display">Prove your specialized knowledge</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addCertification}
            className="text-primary hover:text-primary-dark text-xs font-bold flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 mr-1 min-h-[40px] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            Add
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 bg-card space-y-6">
        <div className="space-y-6">
          {certifications.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl bg-bg/50">
              <span className="material-symbols-outlined text-3xl text-muted/60 mb-2 block">workspace_premium</span>
              <span className="text-sm font-bold text-text block mb-0.5">No certifications added yet</span>
              <span className="text-xs text-muted block mb-4 font-semibold">Prove your domain credentials by adding coursework certifications.</span>
              <button
                type="button"
                onClick={addCertification}
                className="text-primary text-xs font-bold hover:underline cursor-pointer min-h-[44px] px-4"
              >
                Add first certificate card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {certifications.map((cert) => {
                const isEditing = editingId === cert.id;

                return (
                  <div
                    key={cert.id}
                    className="relative bg-bg/40 border border-border/80 rounded-xl p-5 transition-all group"
                  >
                    {isEditing ? (
                      /* Editing Form Mode */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Certification Name</label>
                            <input
                              type="text"
                              value={cert.name || ""}
                              onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                              placeholder="e.g. AWS Certified Solutions Architect"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Issuing Organization</label>
                            <input
                              type="text"
                              value={cert.issuing_organization || ""}
                              onChange={(e) => updateCertification(cert.id, "issuing_organization", e.target.value)}
                              placeholder="e.g. Amazon Web Services (AWS)"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Issue Date</label>
                            <input
                              type="date"
                              value={cert.issue_date || ""}
                              onChange={(e) => updateCertification(cert.id, "issue_date", e.target.value)}
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Expiration Date</label>
                            <input
                              type="date"
                              value={cert.expiry_date || ""}
                              onChange={(e) => updateCertification(cert.id, "expiry_date", e.target.value)}
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Credential ID</label>
                            <input
                              type="text"
                              value={cert.credential_id || ""}
                              onChange={(e) => updateCertification(cert.id, "credential_id", e.target.value)}
                              placeholder="e.g. AWS-ASA-1234"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted mb-1">Credential URL</label>
                            <input
                              type="text"
                              value={cert.credential_url || ""}
                              onChange={(e) => updateCertification(cert.id, "credential_url", e.target.value)}
                              placeholder="https://cred.ly/aws-cert"
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-text placeholder:text-muted/65"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => removeCertification(cert.id)}
                            className="px-4 py-2 bg-card text-red-500 hover:bg-red-500/10 text-xs font-bold rounded-lg border border-border transition-all min-h-[44px] cursor-pointer"
                          >
                            Delete
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
                      /* Read-only Mode */
                      <div className="flex items-start gap-4">
                        {/* Cert icon circle */}
                        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                          <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                        </div>

                        {/* Text fields */}
                        <div className="flex-1 min-w-0 pr-20 space-y-1">
                          <h4 className="text-base font-bold text-text tracking-tight break-words font-display">
                            {cert.name || "Untitled Certificate"}
                          </h4>
                          <p className="text-sm font-semibold text-text/80 break-words">
                            {cert.issuing_organization || "Unknown Issuing Organization"}
                          </p>
                          {(cert.issue_date || cert.expiry_date) && (
                            <p className="text-xs text-muted font-medium">
                              {cert.issue_date ? `Issued ${formatDateLabel(cert.issue_date)}` : ""}
                              {cert.expiry_date ? ` • Expires ${formatDateLabel(cert.expiry_date)}` : " • No Expiration"}
                            </p>
                          )}
                          {cert.credential_id && (
                            <p className="text-xs text-muted font-medium">
                              <span className="font-semibold text-text/70">Credential ID:</span> {cert.credential_id}
                            </p>
                          )}
                          {cert.credential_url && (
                            <a
                              href={cert.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-1 cursor-pointer min-h-[32px]"
                            >
                              View Credential
                              <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </a>
                          )}
                        </div>

                        {/* Action buttons (Absolute top-right inside block) */}
                        <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setEditingId(cert.id || null)}
                            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-primary cursor-pointer shadow-xs hover:shadow-sm"
                            title="Edit Certificate"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCertification(cert.id)}
                            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-red-500 hover:bg-red-500/10 cursor-pointer shadow-xs hover:shadow-sm"
                            title="Delete Certificate"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
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

