"use client";

import React from "react";
import PortalAuthLayout from "@/features/auth/components/PortalAuthLayout";
import SigninForm from "@/features/auth/components/SigninForm";

/**
 * High-fidelity Specialized Sign In for Recruiters.
 */
export default function RecruiterSigninPage() {
  return (
    <PortalAuthLayout
      title="Portal Sign In"
      subtitle="Access your recruiter workspace"
      registerUrl="/recruiter/auth/signup"
    >
      <button 
        type="button"
        className="w-full cursor-pointer justify-center rounded-xl px-6 gap-4 py-4 group items-center transition-all text-white flex shadow-lg bg-linkedin hover:bg-linkedin-hover shadow-linkedin/20 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-linkedin focus-visible:ring-offset-2"
      >
        <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
        <span>Sign in with LinkedIn</span>
      </button>

      <div className="flex relative py-2 items-center">
        <div className="border-border flex-grow border-t dark:border-border"></div>
        <span className="flex-shrink text-muted italic mx-4 type-badge">or manually</span>
        <div className="border-border flex-grow border-t dark:border-border"></div>
      </div>

      <SigninForm role="Recruiter" />
    </PortalAuthLayout>
  );
}
