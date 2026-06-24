"use client";
import Link from "next/link";
import SignupForm from "@/features/auth/components/SignupForm";
import SocialLogin from "@/features/auth/components/SocialLogin";
import { Network } from "lucide-react";

/**
 * Candidate Sign up Page.
 * Featured on the main domain. Includes role selection.
 */
export default function SignupPage() {

  return (
    <div className="justify-center items-center bg-bg p-6 transition-colors flex min-h-screen flex-col">
      <div className="w-full space-y-8 border-border rounded-2xl shadow-xl max-w-md p-8 bg-surface border">
        
        {/* Branding & Welcome */}
        <div className="text-center space-y-2">
          <Link href="/" className="text-primary group type-h3 inline-flex items-center gap-2">
            <Network className="transition-transform group-hover:rotate-12 text-primary" size={30} aria-hidden="true" />
            <span>JobLyne</span>
          </Link>
          <h1 className="text-text type-h2">Create an account</h1>
          <p className="text-sm text-muted">Join the network of top talent and top companies.</p>
        </div>

        {/* Social Logins */}
        <SocialLogin />

        <div className="flex relative items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 type-badge text-muted">or continue with email</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Details Form directly */}
        <SignupForm role="Candidate" />

        {/* Footer Link */}
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
