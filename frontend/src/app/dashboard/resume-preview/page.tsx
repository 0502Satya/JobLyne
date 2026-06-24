/* eslint-disable local-rules/no-hardcoded-colors */
"use client";

import React, { useEffect, useState } from "react";
import { getCandidateProfileAction } from "@/features/auth/actions";
import { Profile } from "@/types/profile";
import Link from "next/link";
import { Button } from "@/shared/ui";
import {
  AlertCircle,
  ArrowLeft,
  Printer,
  MapPin,
  Mail,
  Smartphone,
  Globe,
  Link as LinkIcon,
  FileText,
  Briefcase,
  GraduationCap,
  Zap,
  Languages,
  FolderOpen,
  Crown
} from "lucide-react";

export default function ResumePreviewPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const data = await getCandidateProfileAction();
      if (!data.error) {
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!loading && profile) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("print") === "true") {
        // Short delay to ensure browser paints content before print dialog opens
        const timer = setTimeout(() => {
          window.print();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, profile]);

  if (loading) {
    return (
      <div className="justify-center items-center bg-bg flex min-h-screen">
        <div className="gap-4 flex items-center flex-col">
          <div className="border-primary h-12 w-12 rounded-full border-t-transparent border-4 animate-spin"></div>
          <p className="text-muted type-ui">Preparing Resume Preview...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="justify-center items-center bg-bg flex p-4 min-h-screen">
        <div className="w-full rounded-3xl bg-surface border-border text-center shadow-xl max-w-md p-8 space-y-4 border flex flex-col items-center">
          <AlertCircle size={40} className="text-error" aria-hidden="true" />
          <h2 className="text-text type-h2">Profile Not Found</h2>
          <p className="text-muted type-ui">We couldn&apos;t load your profile. Please make sure you are logged in.</p>
          <Button
            as={Link}
            href="/dashboard/profile"
          >
            Back to profile
          </Button>
        </div>
      </div>
    );
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "NA";

  return (
    <div className="bg-bg text-text p-4 min-h-screen sm:p-8 md:p-12 selection:text-white selection:bg-primary">
      {/* Print styles overrides */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-shadow-none {
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .print-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      `}</style>

      {/* Screen Toolbar Controls */}
      <div className="mx-auto mb-8 gap-4 rounded-2xl no-print bg-white/80 items-center backdrop-blur-md flex-wrap shadow-sm max-w-4xl flex justify-between p-4 border-border/60 border">
        <div className="flex gap-3 items-center text-left">
          <Button
            as={Link}
            href="/dashboard/profile"
            variant="outline"
            className="h-11 w-11 p-0 flex items-center justify-center text-muted"
            title="Back to profile Editor"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Button>
          <div>
            <h1 className="tracking-tight text-text leading-none type-ui mb-1">Resume Preview</h1>
            <p className="text-muted text-xs uppercase tracking-wider">A4 Standard Print Layout</p>
          </div>
        </div>

        <Button
          onClick={() => window.print()}
          variant="primary"
          className="gap-2"
        >
          <Printer size={14} aria-hidden="true" />
          Print / Save PDF
        </Button>
      </div>

      {/* Main Resume Container (A4 Proportional Grid) */}
      <article className="mx-auto min-h-[297mm] rounded-[32px] bg-surface flex-col max-w-4xl print-shadow-none shadow-xl border-border/50 flex justify-between p-8 border sm:p-16">
        
        {/* Top Header Block */}
        <header className="mb-8 pb-8 border-b-2 items-center border-border gap-6 flex justify-between flex-col md:items-start md:flex-row">
          <div className="items-center text-center flex gap-6 flex-col md:items-start md:flex-row md:text-left">
            {/* Minimalist Print avatar */}
            <div className="justify-center type-h2 italic h-20 rounded-2xl to-primary-dark items-center bg-gradient-to-br from-primary text-white flex w-20 shadow-inner">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.full_name}
                  className="w-full rounded-2xl h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="type-h1 leading-none text-text mb-2">
                {profile.full_name || "Candidate Name"}
              </h2>
              <p className="tracking-wide type-ui text-primary">
                {profile.headline || "Professional Headline"}
              </p>
              {profile.location && (
                <p className="justify-center text-muted gap-1 items-center flex type-caption mt-1.5 md:justify-start">
                  <MapPin size={14} aria-hidden="true" />
                  {profile.location} {profile.nationality ? `• ${profile.nationality}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="type-caption shrink-0 gap-2.5 grid text-muted grid-cols-1 sm:grid-cols-2 md:grid-cols-1 md:text-right">
            {profile.email && (
              <p className="gap-2 flex items-center md:justify-end">
                <span>{profile.email}</span>
                <Mail size={14} className="text-muted" aria-hidden="true" />
              </p>
            )}
            {profile.phone && (
              <p className="gap-2 flex items-center md:justify-end">
                <span>{profile.phone}</span>
                <Smartphone size={14} className="text-muted" aria-hidden="true" />
              </p>
            )}
            {profile.social_links?.linkedin && (
              <p className="gap-2 flex items-center md:justify-end">
                <span>{profile.social_links.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
                <Globe size={14} className="text-muted" aria-hidden="true" />
              </p>
            )}
            {profile.social_links?.portfolio && (
              <p className="gap-2 flex items-center md:justify-end">
                <span>{profile.social_links.portfolio.replace(/^https?:\/\/(www\.)?/, "")}</span>
                <LinkIcon size={14} className="text-muted" aria-hidden="true" />
              </p>
            )}
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="space-y-8 flex-1">
          {/* Summary Section */}
          {profile.bio && (
            <section className="print-break-inside-avoid">
              <h3 className="border-b type-badge mb-3 text-muted gap-1.5 pb-1 items-center border-border flex">
                <FileText className="text-primary" size={16} aria-hidden="true" />
                Professional Summary
              </h3>
              <p className="text-muted leading-relaxed whitespace-pre-line type-caption">
                {profile.bio}
              </p>
            </section>
          )}

          {/* Work Experience Section */}
          {profile.experience && profile.experience.length > 0 && (
            <section>
              <h3 className="border-b type-badge gap-1.5 text-muted pb-1 items-center mb-4 border-border flex">
                <Briefcase className="text-primary" size={16} aria-hidden="true" />
                Work History
              </h3>
              <div className="space-y-6">
                {profile.experience.map((exp, i) => (
                  <div key={exp.id || i} className="print-break-inside-avoid gap-1 flex-col flex justify-between md:flex-row">
                    <div>
                      <h4 className="tracking-tight text-text type-ui leading-tight">
                        {exp.title || "Job Title"}
                      </h4>
                      <p className="text-muted type-caption mt-0.5">
                        {exp.company || "Company Name"} {exp.employment_type ? `• ${exp.employment_type}` : ""}
                      </p>
                      {exp.description && (
                        <p className="text-muted text-xs mt-2 leading-relaxed whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-left md:text-right">
                      <span className="py-1 uppercase text-xs inline-block bg-bg px-2.5 border-border rounded-lg tracking-wider text-muted border">
                        {exp.start_date || "Start"} — {exp.current ? "Present" : exp.end_date || "End"}
                      </span>
                      {exp.location && (
                        <p className="text-muted text-xs mt-1">
                          {exp.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education Section */}
          {profile.education && profile.education.length > 0 && (
            <section>
              <h3 className="border-b type-badge gap-1.5 text-muted pb-1 items-center mb-4 border-border flex">
                <span className="mr-1 inline-flex items-center text-primary"><GraduationCap size={16} aria-hidden="true" /></span>
                Education
              </h3>
              <div className="space-y-4">
                {profile.education.map((edu, i) => (
                  <div key={edu.id || i} className="print-break-inside-avoid gap-4 items-start flex justify-between">
                    <div>
                      <h4 className="tracking-tight text-text type-ui leading-tight">
                        {edu.degree || "Degree"} {edu.field ? `in ${edu.field}` : ""}
                      </h4>
                      <p className="text-muted type-caption mt-0.5">
                        {edu.school || "School / University"}
                      </p>
                      {edu.grade && (
                        <p className="mt-1 text-muted text-xs">
                          Grade / GPA: {edu.grade}
                        </p>
                      )}
                    </div>
                    <span className="py-1 uppercase text-xs inline-block whitespace-nowrap bg-bg px-2.5 border-border rounded-lg tracking-wider text-muted border">
                      {edu.start_year || "Start"} — {edu.end_year || "End"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills & Languages Row */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <section className="print-break-inside-avoid">
                <h3 className="border-b type-badge mb-3 text-muted gap-1.5 pb-1 items-center border-border flex">
                  <Zap className="text-primary" size={16} aria-hidden="true" />
                  Skills and expertise
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="py-1 bg-primary-light/50 border-primary/20 rounded-lg px-2.5 text-primary-dark type-caption border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <section className="print-break-inside-avoid">
                <h3 className="border-b type-badge mb-3 text-muted gap-1.5 pb-1 items-center border-border flex">
                  <Languages className="text-primary" size={16} aria-hidden="true" />
                  Languages
                </h3>
                <div className="gap-2 flex flex-wrap">
                  {profile.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="py-1 gap-1 items-center pl-2.5 bg-bg border-border text-text pr-2 rounded-lg flex type-caption border"
                    >
                      {lang.name}
                      <span className="text-xs px-1.5 text-primary uppercase bg-primary/5 py-0.5 rounded">
                        {lang.proficiency}
                      </span>
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Projects Section */}
          {profile.projects && profile.projects.length > 0 && (
            <section>
              <h3 className="border-b type-badge gap-1.5 text-muted pb-1 items-center mb-4 border-border flex">
                <FolderOpen className="text-primary" size={16} aria-hidden="true" />
                Key Projects
              </h3>
              <div className="space-y-5">
                {profile.projects.map((proj, i) => (
                  <div key={proj.id || i} className="print-break-inside-avoid space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="tracking-tight text-text type-ui leading-tight">
                        {proj.title || "Project Title"}
                      </h4>
                      {proj.duration && (
                        <span className="text-muted text-xs">{proj.duration}</span>
                      )}
                    </div>
                    {proj.role && (
                      <p className="type-caption text-primary-dark">Role: {proj.role}</p>
                    )}
                    {proj.description && (
                      <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
                        {proj.description}
                      </p>
                    )}
                    {proj.tech_stack && (
                      <div className="gap-1 flex flex-wrap mt-1.5">
                        {(Array.isArray(proj.tech_stack)
                          ? proj.tech_stack
                          : typeof proj.tech_stack === "string"
                          ? proj.tech_stack.split(",").map((t) => t.trim())
                          : []
                        ).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 text-xs bg-bg border-border py-0.5 text-muted rounded border"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications Section */}
          {profile.certifications && profile.certifications.length > 0 && (
            <section>
              <h3 className="border-b type-badge gap-1.5 text-muted pb-1 items-center mb-4 border-border flex">
                <Crown className="text-primary" size={16} aria-hidden="true" />
                Certifications
              </h3>
              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                {profile.certifications.map((cert, i) => (
                  <div key={cert.id || i} className="justify-center border print-break-inside-avoid rounded-2xl bg-bg/40 p-3.5 border-border flex flex-col">
                    <h4 className="leading-snug text-text type-badge">{cert.name || "Certification Name"}</h4>
                    <p className="text-muted text-xs mt-0.5">{cert.issuing_organization}</p>
                    {cert.issue_date && (
                      <p className="mt-1 text-xs text-muted">
                        Issued: {cert.issue_date} {cert.expiry_date ? `• Expires: ${cert.expiry_date}` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer Page / CV Info */}
        <footer className="border-t text-muted uppercase mt-8 pt-6 items-center text-xs border-border tracking-widest flex justify-between">
          <span>Generated via JobLyne</span>
          <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
        </footer>
      </article>
    </div>
  );
}
