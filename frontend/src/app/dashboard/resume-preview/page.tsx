"use client";

import React, { useEffect, useState } from "react";
import { getCandidateProfileAction } from "@/features/auth/actions";
import { Profile } from "@/types/profile";
import Link from "next/link";

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm">Preparing Resume Preview...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          <h2 className="text-xl font-black text-slate-800">Profile Not Found</h2>
          <p className="text-sm text-slate-500 font-bold">We couldn&apos;t load your profile. Please make sure you are logged in.</p>
          <Link
            href="/dashboard/profile"
            className="inline-block px-6 py-2.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md min-h-[44px]"
          >
            Back to Profile
          </Link>
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
    <div className="min-h-screen bg-slate-100/60 p-4 sm:p-8 md:p-12 font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
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
      <div className="no-print max-w-4xl mx-auto mb-8 bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-all border border-slate-100 flex items-center justify-center min-h-[44px] min-w-[44px]"
            title="Back to Profile Editor"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">Resume Preview</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">A4 Standard Print Layout</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-6 py-2.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span className="material-symbols-outlined text-sm font-black">print</span>
          Print / Save PDF
        </button>
      </div>

      {/* Main Resume Container (A4 Proportional Grid) */}
      <article className="print-shadow-none max-w-4xl mx-auto bg-white border border-slate-200/50 p-8 sm:p-16 rounded-[32px] shadow-xl shadow-slate-200/40 min-h-[297mm] flex flex-col justify-between">
        
        {/* Top Header Block */}
        <header className="border-b-2 border-slate-100 pb-8 mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            {/* Minimalist Print avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black italic shadow-inner">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 leading-none">
                {profile.full_name || "Candidate Name"}
              </h2>
              <p className="text-sm font-bold text-indigo-600 tracking-wide">
                {profile.headline || "Professional Headline"}
              </p>
              {profile.location && (
                <p className="text-xs text-slate-400 font-bold mt-1.5 flex items-center justify-center md:justify-start gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {profile.location} {profile.nationality ? `• ${profile.nationality}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2.5 text-xs text-slate-500 font-bold shrink-0 md:text-right">
            {profile.email && (
              <p className="flex items-center md:justify-end gap-2">
                <span>{profile.email}</span>
                <span className="material-symbols-outlined text-sm text-slate-400">mail</span>
              </p>
            )}
            {profile.phone && (
              <p className="flex items-center md:justify-end gap-2">
                <span>{profile.phone}</span>
                <span className="material-symbols-outlined text-sm text-slate-400">phone_iphone</span>
              </p>
            )}
            {profile.social_links?.linkedin && (
              <p className="flex items-center md:justify-end gap-2">
                <span>{profile.social_links.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
                <span className="material-symbols-outlined text-sm text-slate-400">public</span>
              </p>
            )}
            {profile.social_links?.portfolio && (
              <p className="flex items-center md:justify-end gap-2">
                <span>{profile.social_links.portfolio.replace(/^https?:\/\/(www\.)?/, "")}</span>
                <span className="material-symbols-outlined text-sm text-slate-400">link</span>
              </p>
            )}
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="flex-1 space-y-8">
          {/* Summary Section */}
          {profile.bio && (
            <section className="print-break-inside-avoid">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="material-symbols-outlined text-base text-indigo-600">description</span>
                Professional Summary
              </h3>
              <p className="text-xs text-slate-650 leading-relaxed font-medium whitespace-pre-line">
                {profile.bio}
              </p>
            </section>
          )}

          {/* Work Experience Section */}
          {profile.experience && profile.experience.length > 0 && (
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="material-symbols-outlined text-base text-indigo-600">work</span>
                Work History
              </h3>
              <div className="space-y-6">
                {profile.experience.map((exp, i) => (
                  <div key={exp.id || i} className="print-break-inside-avoid flex flex-col md:flex-row justify-between gap-1">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight">
                        {exp.title || "Job Title"}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">
                        {exp.company || "Company Name"} {exp.employment_type ? `• ${exp.employment_type}` : ""}
                      </p>
                      {exp.description && (
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-2 whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-wider rounded-lg inline-block">
                        {exp.start_date || "Start"} — {exp.current ? "Present" : exp.end_date || "End"}
                      </span>
                      {exp.location && (
                        <p className="text-[10px] text-slate-450 font-bold mt-1">
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
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="material-symbols-outlined text-base text-indigo-600">school</span>
                Education
              </h3>
              <div className="space-y-4">
                {profile.education.map((edu, i) => (
                  <div key={edu.id || i} className="print-break-inside-avoid flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight">
                        {edu.degree || "Degree"} {edu.field ? `in ${edu.field}` : ""}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">
                        {edu.school || "School / University"}
                      </p>
                      {edu.grade && (
                        <p className="text-[10px] text-slate-500 font-bold mt-1">
                          Grade / GPA: {edu.grade}
                        </p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-wider rounded-lg inline-block whitespace-nowrap">
                      {edu.start_year || "Start"} — {edu.end_year || "End"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills & Languages Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <section className="print-break-inside-avoid">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <span className="material-symbols-outlined text-base text-indigo-600">bolt</span>
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-indigo-50/50 border border-indigo-100/40 text-indigo-750 text-xs font-bold rounded-lg"
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
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <span className="material-symbols-outlined text-base text-indigo-600">language</span>
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-slate-50 border border-slate-100 text-slate-700 pl-2.5 pr-2 py-1 rounded-lg text-xs font-bold"
                    >
                      {lang.name}
                      <span className="px-1.5 py-0.5 bg-primary/5 text-primary text-[8px] font-black uppercase rounded">
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
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="material-symbols-outlined text-base text-indigo-600">folder_open</span>
                Key Projects
              </h3>
              <div className="space-y-5">
                {profile.projects.map((proj, i) => (
                  <div key={proj.id || i} className="print-break-inside-avoid space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight">
                        {proj.title || "Project Title"}
                      </h4>
                      {proj.duration && (
                        <span className="text-[10px] text-slate-450 font-bold">{proj.duration}</span>
                      )}
                    </div>
                    {proj.role && (
                      <p className="text-xs text-indigo-650 font-bold">Role: {proj.role}</p>
                    )}
                    {proj.description && (
                      <p className="text-[11px] text-slate-650 font-medium leading-relaxed whitespace-pre-line">
                        {proj.description}
                      </p>
                    )}
                    {proj.tech_stack && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(Array.isArray(proj.tech_stack)
                          ? proj.tech_stack
                          : typeof proj.tech_stack === "string"
                          ? proj.tech_stack.split(",").map((t) => t.trim())
                          : []
                        ).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 text-[9px] font-black rounded"
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
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="material-symbols-outlined text-base text-indigo-600">workspace_premium</span>
                Certifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.certifications.map((cert, i) => (
                  <div key={cert.id || i} className="print-break-inside-avoid flex flex-col justify-center bg-slate-50/40 border border-slate-100 p-3.5 rounded-2xl">
                    <h4 className="text-xs font-black text-slate-800 leading-snug">{cert.name || "Certification Name"}</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{cert.issuing_organization}</p>
                    {cert.issue_date && (
                      <p className="text-[9px] text-slate-400 font-bold mt-1">
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
        <footer className="border-t border-slate-100 pt-6 mt-8 flex justify-between items-center text-[9px] font-black text-slate-450 uppercase tracking-widest">
          <span>Generated via JobLyne</span>
          <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
        </footer>
      </article>
    </div>
  );
}
