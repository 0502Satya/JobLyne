"use client";

import React from "react";
import Link from "next/link";
import SigninForm from "@/features/auth/components/SigninForm";
import SocialLogin from "@/features/auth/components/SocialLogin";
import { Network } from "lucide-react";

/**
 * Candidate Sign In Page.
 * Featured on the main domain.
 */
export default function SigninPage() {
  return (
    <div className="justify-center items-center bg-bg p-6 transition-colors flex min-h-screen flex-col">
      <div className="w-full space-y-8 border-border rounded-2xl shadow-xl max-w-md p-8 bg-surface border">

        {/* Branding & Welcome */}
        <div className="text-center space-y-2">
          <Link href="/" className="text-primary group type-h3 inline-flex items-center gap-2">
            <Network className="transition-transform group-hover:rotate-12 text-primary" size={30} aria-hidden="true" />
            <span>JobLyne</span>
          </Link>
          <h1 className="text-text type-h2">Welcome back</h1>
          <p className="text-sm text-muted">Please enter your details to sign in.</p>
        </div>

        {/* Social Logins */}
        <SocialLogin />

        <div className="flex relative items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 type-badge text-muted">or continue with</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Sign In Form */}
        <SigninForm role="Candidate" />

        {/* Footer Link */}
        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary transition-colors hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
