"use client";
import Link from "next/link";
import SignupForm from "@/features/auth/components/SignupForm";
import SocialLogin from "@/features/auth/components/SocialLogin";

/**
 * Candidate Sign Up Page.
 * Featured on the main domain. Includes role selection.
 */
export default function SignupPage() {

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border p-8 space-y-8">
        
        {/* Branding & Welcome */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl group">
            <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">hub</span>
            <span>JobLyne</span>
          </Link>
          <h1 className="text-2xl font-black text-text tracking-tight">Create an account</h1>
          <p className="text-muted text-sm">Join the network of top talent and top companies.</p>
        </div>

        {/* Social Logins */}
        <SocialLogin />

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted text-[10px] font-black uppercase tracking-widest">or continue with email</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Details Form directly */}
        <SignupForm role="Candidate" />

        {/* Footer Link */}
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary font-bold hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
