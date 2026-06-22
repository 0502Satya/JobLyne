"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/recruiter/dashboard");
  }, [router]);

  return (
    <div className="justify-center items-center bg-bg flex min-h-screen">
      <div className="gap-4 animate-pulse items-center flex flex-col">
        <div className="size-12 bg-primary/20 rounded-full border-primary/30 border"></div>
        <p className="italic type-label">Redirecting to recruiter portal...</p>
      </div>
    </div>
  );
}
