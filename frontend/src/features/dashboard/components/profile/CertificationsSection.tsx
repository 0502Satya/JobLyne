"use client";

import React, { useState } from "react";
import { Certification } from "@/types/profile";
import { Button, Input } from "@/shared/ui";
import { Crown, Plus, ExternalLink, Pencil, Trash2 } from "lucide-react";

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
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border" id="certifications">
      {/* Card Header */}
      <div className="w-full border-b items-center border-border/60 flex p-5 text-left justify-between">
        <div className="flex items-center gap-3.5">
          <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
            <Crown size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-text type-card-title leading-tight">Certifications & Courses</h3>
            <p className="text-xs text-muted mt-0.5">Prove your specialized knowledge</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addCertification}
            className="text-primary hover:text-primary-dark border-primary/10 bg-primary/5 hover:bg-primary/10 gap-2"
          >
            <Plus size={16} aria-hidden="true" />
            Add
          </Button>
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-card p-5 space-y-6 sm:p-6">
        <div className="space-y-6">
          {certifications.length === 0 ? (
            <div className="border-dashed bg-bg/50 border-border text-center py-10 rounded-xl border">
              <Crown size={32} className="text-muted/60 block mx-auto mb-2" aria-hidden="true" />
              <span className="text-text mb-0.5 block type-ui">No certifications added yet</span>
              <span className="block mb-4 type-caption text-muted">Prove your domain credentials by adding coursework certifications.</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCertification}
                className="text-primary mt-1.5 hover:underline"
              >
                Add first certificate card
              </Button>
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-1">
              {certifications.map((cert) => {
                const isEditing = editingId === cert.id;

                return (
                  <div
                    key={cert.id}
                    className="group relative border-border/80 transition-all bg-bg/40 p-5 rounded-xl border"
                  >
                    {isEditing ? (
                      /* Editing Form Mode */
                      <div className="space-y-4 text-left">
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                          <Input
                            label="Certification Name"
                            type="text"
                            value={cert.name || ""}
                            onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                            placeholder="e.g. AWS Certified Solutions Architect"
                          />
                          <Input
                            label="Issuing Organization"
                            type="text"
                            value={cert.issuing_organization || ""}
                            onChange={(e) => updateCertification(cert.id, "issuing_organization", e.target.value)}
                            placeholder="e.g. Amazon Web Services (AWS)"
                          />
                        </div>

                        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                          <Input
                            label="Issue Date"
                            type="date"
                            value={cert.issue_date || ""}
                            onChange={(e) => updateCertification(cert.id, "issue_date", e.target.value)}
                          />
                          <Input
                            label="Expiration Date"
                            type="date"
                            value={cert.expiry_date || ""}
                            onChange={(e) => updateCertification(cert.id, "expiry_date", e.target.value)}
                          />
                          <Input
                            label="Credential ID"
                            type="text"
                            value={cert.credential_id || ""}
                            onChange={(e) => updateCertification(cert.id, "credential_id", e.target.value)}
                            placeholder="e.g. AWS-ASA-1234"
                          />
                          <Input
                            label="Credential URL"
                            type="text"
                            value={cert.credential_url || ""}
                            onChange={(e) => updateCertification(cert.id, "credential_url", e.target.value)}
                            placeholder="https://cred.ly/aws-cert"
                          />
                        </div>

                        <div className="pt-2 flex justify-end gap-2.5">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeCertification(cert.id)}
                            className="text-red-500 hover:text-red-650 hover:bg-red-500/10 border-border"
                          >
                            Delete
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
                      /* Read-only Mode */
                      <div className="gap-4 flex items-start text-left">
                        {/* Cert icon circle */}
                        <div className="justify-center text-primary shrink-0 h-12 w-12 items-center bg-primary/5 border-primary/10 flex rounded-xl border">
                          <Crown size={24} aria-hidden="true" />
                        </div>

                        {/* Text fields */}
                        <div className="min-w-0 flex-1 space-y-1 pr-20">
                          <h4 className="text-text break-words tracking-tight type-card-title">
                            {cert.name || "Untitled Certificate"}
                          </h4>
                          <p className="break-words type-ui text-text/80">
                            {cert.issuing_organization || "Unknown Issuing Organization"}
                          </p>
                          {(cert.issue_date || cert.expiry_date) && (
                            <p className="type-caption text-muted">
                              {cert.issue_date ? `Issued ${formatDateLabel(cert.issue_date)}` : ""}
                              {cert.expiry_date ? ` • Expires ${formatDateLabel(cert.expiry_date)}` : " • No Expiration"}
                            </p>
                          )}
                          {cert.credential_id && (
                            <p className="type-caption text-muted">
                              <span className="text-text/70">Credential ID:</span> {cert.credential_id}
                            </p>
                          )}
                          {cert.credential_url && (
                            <Button
                              as="a"
                              href={cert.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:underline gap-1 mt-1 px-0 min-h-0 h-auto"
                            >
                              View Credential
                              <ExternalLink size={14} aria-hidden="true" />
                            </Button>
                          )}
                        </div>

                        {/* Action buttons (Absolute top-right inside block) */}
                        <div className="right-3 gap-1.5 absolute opacity-100 items-center transition-opacity flex top-3 lg:opacity-0 lg:group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(cert.id || null)}
                            className="h-10 w-10 p-0 min-w-0 flex items-center justify-center text-muted border-border hover:text-primary"
                            title="Edit Certificate"
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeCertification(cert.id)}
                            className="h-10 w-10 p-0 min-w-0 flex items-center justify-center text-red-500 border-border hover:bg-red-500/10"
                            title="Delete Certificate"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </Button>
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

