"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ApplicantsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const jobFilter = searchParams.get("jobFilter") || "ALL";
    router.replace(`/?section=applicants&jobFilter=${encodeURIComponent(jobFilter)}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center text-muted text-left">
      <div className="flex flex-col items-center gap-3">
        <div className="border-t-primary size-10 border-primary/20 rounded-full border-4 animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-wider">Redirecting to dashboard pipeline...</p>
      </div>
    </div>
  );
}

export default function CompanyApplicantsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center text-muted text-left">
        <p className="text-xs font-bold uppercase tracking-wider">Loading...</p>
      </div>
    }>
      <ApplicantsRedirectContent />
    </Suspense>
  );
}
