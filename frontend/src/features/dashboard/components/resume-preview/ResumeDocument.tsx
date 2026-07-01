import React from "react";
import { Profile } from "@/types/profile";
import {
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

interface ResumeDocumentProps {
  profile: Profile;
}

export default function ResumeDocument({ profile }: ResumeDocumentProps) {
  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "NA";

  return (
    <article className="mx-auto min-h-[297mm] rounded-[32px] bg-surface flex-col max-w-4xl print-shadow-none shadow-xl border-border/50 flex justify-between p-8 border sm:p-16 text-left">
      {/* Top Header Block */}
      <header className="mb-8 pb-8 border-b-2 items-center border-border gap-6 flex justify-between flex-col md:items-start md:flex-row">
        <div className="items-center text-center flex gap-6 flex-col md:items-start md:flex-row md:text-left">
          {/* Minimalist Print avatar */}
          <div className="justify-center type-h2 italic h-20 rounded-2xl to-primary-dark items-center bg-gradient-to-br from-primary text-white flex w-20 shadow-inner font-bold text-2xl">
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
            <h2 className="type-h1 leading-none text-text mb-2 font-bold text-3xl">
              {profile.full_name || "Candidate Name"}
            </h2>
            <p className="tracking-wide type-ui text-primary font-semibold">
              {profile.headline || "Professional Headline"}
            </p>
            {profile.location && (
              <p className="justify-center text-muted gap-1 items-center flex type-caption mt-1.5 md:justify-start text-xs">
                <MapPin size={14} aria-hidden="true" />
                {profile.location} {profile.nationality ? `• ${profile.nationality}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Contact Details Grid */}
        <div className="type-caption shrink-0 gap-2.5 grid text-muted grid-cols-1 sm:grid-cols-2 md:grid-cols-1 md:text-right text-xs">
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
            <h3 className="border-b type-badge mb-3 text-muted gap-1.5 pb-1 items-center border-border flex uppercase font-semibold text-xs tracking-wider">
              <FileText className="text-primary" size={16} aria-hidden="true" />
              Professional Summary
            </h3>
            <p className="text-muted leading-relaxed whitespace-pre-line type-caption text-sm">
              {profile.bio}
            </p>
          </section>
        )}

        {/* Work Experience Section */}
        {profile.experience && profile.experience.length > 0 && (
          <section>
            <h3 className="border-b type-badge gap-1.5 text-muted pb-1 items-center mb-4 border-border flex uppercase font-semibold text-xs tracking-wider">
              <Briefcase className="text-primary" size={16} aria-hidden="true" />
              Work History
            </h3>
            <div className="space-y-6">
              {profile.experience.map((exp, i) => (
                <div key={exp.id || i} className="print-break-inside-avoid gap-1 flex-col flex justify-between md:flex-row">
                  <div>
                    <h4 className="tracking-tight text-text type-ui leading-tight font-semibold">
                      {exp.title || "Job Title"}
                    </h4>
                    <p className="text-muted mt-0.5 text-sm">
                      {exp.company || "Company Name"} {exp.employment_type ? `• ${exp.employment_type}` : ""}
                    </p>
                    {exp.description && (
                      <p className="text-muted text-xs mt-2 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-left md:text-right">
                    <span className="py-1 uppercase text-xs inline-block bg-bg px-2.5 border-border rounded-lg tracking-wider text-muted border font-semibold">
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
            <h3 className="border-b type-badge gap-1.5 text-muted pb-1 items-center mb-4 border-border flex uppercase font-semibold text-xs tracking-wider">
              <span className="mr-1 inline-flex items-center text-primary"><GraduationCap size={16} aria-hidden="true" /></span>
              Education
            </h3>
            <div className="space-y-4">
              {profile.education.map((edu, i) => (
                <div key={edu.id || i} className="print-break-inside-avoid gap-4 items-start flex justify-between">
                  <div>
                    <h4 className="tracking-tight text-text type-ui leading-tight font-semibold">
                      {edu.degree || "Degree"} {edu.field ? `in ${edu.field}` : ""}
                    </h4>
                    <p className="text-muted mt-0.5 text-sm">
                      {edu.school || "School / University"}
                    </p>
                    {edu.grade && (
                      <p className="mt-1 text-muted text-xs font-semibold">
                        Grade / GPA: {edu.grade}
                      </p>
                    )}
                  </div>
                  <span className="py-1 uppercase text-xs inline-block whitespace-nowrap bg-bg px-2.5 border-border rounded-lg tracking-wider text-muted border font-semibold">
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
              <h3 className="border-b type-badge mb-3 text-muted gap-1.5 pb-1 items-center border-border flex uppercase font-semibold text-xs tracking-wider">
                <Zap className="text-primary" size={16} aria-hidden="true" />
                Skills and expertise
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="py-1 bg-primary-light/50 border-primary/20 rounded-lg px-2.5 text-primary-dark border text-xs font-semibold"
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
              <h3 className="border-b type-badge mb-3 text-muted gap-1.5 pb-1 items-center border-border flex uppercase font-semibold text-xs tracking-wider">
                <Languages className="text-primary" size={16} aria-hidden="true" />
                Languages
              </h3>
              <div className="gap-2 flex flex-wrap">
                {profile.languages.map((lang, i) => (
                  <span
                    key={i}
                    className="py-1 gap-1 items-center pl-2.5 bg-bg border-border text-text pr-2 rounded-lg flex border text-xs font-semibold"
                  >
                    {lang.name}
                    <span className="text-[10px] px-1.5 text-primary uppercase bg-primary/5 py-0.5 rounded font-bold">
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
            <h3 className="border-b type-badge gap-1.5 text-muted pb-1 items-center mb-4 border-border flex uppercase font-semibold text-xs tracking-wider">
              <FolderOpen className="text-primary" size={16} aria-hidden="true" />
              Key Projects
            </h3>
            <div className="space-y-5">
              {profile.projects.map((proj, i) => (
                <div key={proj.id || i} className="print-break-inside-avoid space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="tracking-tight text-text type-ui leading-tight font-semibold">
                      {proj.title || "Project Title"}
                    </h4>
                    {proj.duration && (
                      <span className="text-muted text-xs">{proj.duration}</span>
                    )}
                  </div>
                  {proj.role && (
                    <p className="text-xs text-primary-dark font-semibold">Role: {proj.role}</p>
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
                          className="px-2 text-[10px] bg-bg border-border py-0.5 text-muted rounded border font-semibold"
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
            <h3 className="border-b type-badge gap-1.5 text-muted pb-1 items-center mb-4 border-border flex uppercase font-semibold text-xs tracking-wider">
              <Crown className="text-primary" size={16} aria-hidden="true" />
              Certifications
            </h3>
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              {profile.certifications.map((cert, i) => (
                <div key={cert.id || i} className="justify-center border print-break-inside-avoid rounded-2xl bg-bg/40 p-3.5 border-border flex flex-col">
                  <h4 className="leading-snug text-text font-semibold text-sm">{cert.name || "Certification Name"}</h4>
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
      <footer className="border-t text-muted uppercase mt-8 pt-6 items-center text-[10px] border-border tracking-widest flex justify-between font-semibold">
        <span>Generated via JobLyne</span>
        <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
      </footer>
    </article>
  );
}
