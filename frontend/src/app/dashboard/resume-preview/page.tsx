import React from "react";
import { getProfile } from "@/services/profile.server";
import { redirect } from "next/navigation";
import ResumeDocument from "@/features/dashboard/components/resume-preview/ResumeDocument";
import ResumePrintController from "@/features/dashboard/components/resume-preview/ResumePrintController";

interface PageProps {
  searchParams: Promise<{ print?: string }>;
}

export default async function ResumePreviewPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const shouldPrint = resolvedParams.print === "true";
  let profile = null;

  try {
    profile = await getProfile();
  } catch (error) {
    redirect("/dashboard/profile");
  }

  return (
    <div className="bg-bg text-text p-4 min-h-screen sm:p-8 md:p-12 selection:text-white selection:bg-primary">
      {/* Print styles overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            /*
             * INTENTIONAL EXCEPTION: CSS custom properties (--color-surface, --color-text)
             * are not guaranteed to resolve in @media print contexts in Safari and some
             * Chromium builds. These absolute values (#ffffff, #000000) are required for
             * reliable cross-browser print output and are correct per the CSS spec.
             * See: https://caniuse.com/css-variables (print support caveat)
             */
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
      `}} />

      {/* Screen Toolbar Controller (Client Component) */}
      <ResumePrintController shouldPrint={shouldPrint} />

      {/* Static Server Rendered Document */}
      <ResumeDocument profile={profile} />
    </div>
  );
}
