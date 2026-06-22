"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { recruiterSignupAction } from "@/features/auth/actions";
import OTPVerification from "@/features/auth/components/OTPVerification";
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  BadgeCheck,
  Brain,
  Zap,
  Headphones,
  HelpCircle
} from "lucide-react";

/**
 * High-fidelity Recruiter Registration.
 * Focuses on LinkedIn verification and trust badges.
 */
export default function RecruiterSignupPage() {
  const [state, formAction, isPending] = useActionState(recruiterSignupAction, null);

  if (state?.requiresVerification) {
    return (
      <div className="justify-center items-center bg-bg p-6 transition-colors text-text flex min-h-screen dark:bg-surface">
        <OTPVerification email={state.email} />
      </div>
    );
  }

  return (
    <div className="bg-bg transition-colors text-text min-h-screen dark:bg-surface">
      <div className="w-full relative overflow-x-hidden h-auto flex group/design-root min-h-screen flex-col">
        <div className="layout-container h-full grow flex flex-col">
          
          {/* Header */}
          <header className="border-b border-solid px-6 py-4 whitespace-nowrap items-center border-border bg-surface sticky z-50 transition-colors flex top-0 justify-between dark:bg-card dark:border-border md:px-20">
            <Link href="/" className="text-primary group gap-4 items-center flex">
              <div className="size-8">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                  <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="type-h3 text-text leading-tight">JobLyne</h2>
            </Link>
            <div className="gap-4 flex items-center">
              <span className="text-muted hidden text-sm md:block">Need help? Contact support</span>
              <Link href="/recruiter/auth/signin" className="justify-center h-10 cursor-pointer bg-primary items-center transition-all rounded-lg text-white type-ui shadow-primary/20 min-w-[84px] flex shadow-lg px-4 hover:opacity-90 active:scale-[0.98]">
                Sign In
              </Link>
            </div>
          </header>

          <main className="py-12 flex-1 items-center transition-all overflow-x-hidden flex px-4 flex-col">
            <div className="w-full max-w-6xl gap-8 grid grid-cols-1 lg:gap-12 lg:grid-cols-5">
              
              {/* Left Side: Form */}
              <div className="lg:col-span-3 fade-in slide-in-from-left-4 gap-8 animate-in duration-500 flex flex-col">
                <div className="gap-2 flex flex-col">
                  <h1 className="type-h1 text-text leading-tight">Register as a Recruiter</h1>
                  <p className="text-muted text-base">Find and hire the top 1% of talent across the globe.</p>
                </div>

                <div className="space-y-8 bg-surface border-border shadow-sm p-8 rounded-xl border dark:bg-card dark:border-border">
                  {/* LinkedIn Section */}
                  <section>
                    <h3 className="uppercase items-center mb-4 gap-2 type-ui tracking-wider text-text flex">
                      <ShieldCheck className="text-primary" size={16} aria-hidden="true" />
                      One-Click Verification
                    </h3>
                    <button className="w-full justify-center rounded-xl px-6 gap-4 py-4 group items-center transition-all text-white flex shadow-lg shadow-blue-500/20 bg-[#0A66C2] hover:bg-[#0954a1] active:scale-[0.98]">
                      <svg className="size-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <div className="flex items-start translate-y-[1px] flex-col">
                        <span className="text-white text-sm">Verify with LinkedIn</span>
                        <span className="opacity-80 italic text-white/90 text-xs -mt-1">Get your Recruiter Trust Badge instantly</span>
                      </div>
                      <ArrowRight className="ml-auto transition-transform group-hover:translate-x-1" size={20} aria-hidden="true" />
                    </button>
                    <p className="text-xs text-muted italic mt-3 text-center">Highly recommended for faster profile approval and better candidate response rates.</p>
                  </section>

                  <div className="gap-4 relative items-center flex py-2">
                    <div className="bg-border flex-1 h-px dark:border-border"></div>
                    <span className="text-muted text-xs uppercase whitespace-nowrap tracking-widest">Or register manually</span>
                    <div className="bg-border flex-1 h-px dark:border-border"></div>
                  </div>

                  {state?.error && (
                    <div className="bg-red-50 border-red-200 items-center rounded-lg gap-3 flex p-4 text-red-600 border dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                      <AlertCircle size={20} aria-hidden="true" />
                      <p className="type-ui">{state.error}</p>
                    </div>
                  )}

                  <form action={formAction} className="space-y-6">
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                      <div className="gap-2 flex flex-col">
                        <label className="text-text type-ui">Full Name</label>
                        <input name="full_name" className="w-full outline-none h-12 transition-all rounded-lg py-3 border-border text-text px-4 dark:border-border dark:bg-card focus:border-primary focus:ring-primary" placeholder="John Doe" type="text" required />
                      </div>
                      <div className="gap-2 flex flex-col">
                        <label className="text-text type-ui">Work Email</label>
                        <input name="email" className="w-full outline-none h-12 transition-all rounded-lg py-3 border-border text-text px-4 dark:border-border dark:bg-card focus:border-primary focus:ring-primary" placeholder="john@company.com" type="email" required />
                      </div>
                      <div className="gap-2 flex flex-col">
                        <label className="text-text type-ui">Company Name</label>
                        <input name="companyName" className="w-full outline-none h-12 transition-all rounded-lg py-3 border-border text-text px-4 dark:border-border dark:bg-card focus:border-primary focus:ring-primary" placeholder="e.g. Acme Corp" type="text" required />
                      </div>
                      <div className="gap-2 flex flex-col">
                        <label className="text-text type-ui">Designation</label>
                        <input name="designation" className="w-full outline-none h-12 transition-all rounded-lg py-3 border-border text-text px-4 dark:border-border dark:bg-card focus:border-primary focus:ring-primary" placeholder="Technical Recruiter" type="text" required />
                      </div>
                      <div className="gap-2 flex flex-col">
                        <label className="text-text type-ui">Password</label>
                        <input name="password" title="At least one letter and one number" className="w-full outline-none h-12 transition-all rounded-lg py-3 border-border text-text px-4 dark:border-border dark:bg-card focus:border-primary focus:ring-primary" placeholder="••••••••" type="password" required />
                      </div>
                      <div className="gap-2 flex flex-col">
                        <label className="text-text type-ui">Confirm Password</label>
                        <input name="password_confirm" className="w-full outline-none h-12 transition-all rounded-lg py-3 border-border text-text px-4 dark:border-border dark:bg-card focus:border-primary focus:ring-primary" placeholder="••••••••" type="password" required />
                      </div>
                    </div>
                    <div className="items-center bg-bg rounded-lg gap-3 flex p-4 dark:bg-card">
                      <input type="checkbox" name="terms" className="text-primary h-5 w-5 cursor-pointer rounded focus:ring-primary" required />
                      <p className="text-muted text-xs">
                        I agree to the <Link href="#" className="text-primary hover:underline">Recruiter Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                      </p>
                    </div>
                    <button disabled={isPending} className="w-full px-8 bg-card py-4 transition-all text-white shadow-lg rounded-xl dark:text-text dark:bg-bg hover:opacity-90 disabled:opacity-50 active:scale-[0.98]" type="submit">
                      {isPending ? "Creating Account..." : "Create Recruiter Account"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Side: Perks Sidebar */}
              <div className="lg:col-span-2 fade-in animate-in duration-500 flex gap-6 slide-in-from-right-4 flex-col">
                <div className="bg-card gap-8 rounded-2xl relative overflow-hidden text-white shadow-xl flex p-8 shadow-slate-900/10 flex-col">
                  <div className="space-y-4">
                    <span className="py-1 text-primary text-xs px-3 uppercase rounded-full tracking-wider bg-primary/20">Recruiter Benefits</span>
                    <h3 className="type-h2">Elevate your hiring game</h3>
                    <p className="italic text-sm text-muted">Join the most intelligent recruitment platform for elite IT and tech professionals.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="gap-4 flex">
                      <div className="justify-center border-white/10 bg-white/5 shrink-0 items-center flex size-10 rounded-xl border">
                        <BadgeCheck className="text-primary" size={20} aria-hidden="true" />
                      </div>
                      <div className="gap-1 flex flex-col">
                        <p className="type-ui">Verified Trust Badge</p>
                        <p className="text-muted text-xs">Increase candidate response rates by up to 40% with a verified recruiter identity.</p>
                      </div>
                    </div>
                    <div className="gap-4 flex">
                      <div className="justify-center border-white/10 bg-white/5 shrink-0 items-center flex size-10 rounded-xl border">
                        <Brain className="text-primary" size={20} aria-hidden="true" />
                      </div>
                      <div className="gap-1 flex flex-col">
                        <p className="type-ui">Access to 1% Talent</p>
                        <p className="text-muted text-xs">Unlock a pre-vetted pool of top-tier candidates who only engage with verified recruiters.</p>
                      </div>
                    </div>
                    <div className="gap-4 flex">
                      <div className="justify-center border-white/10 bg-white/5 shrink-0 items-center flex size-10 rounded-xl border">
                        <Zap className="text-primary" size={20} aria-hidden="true" />
                      </div>
                      <div className="gap-1 flex flex-col">
                        <p className="type-ui">AI Recruitment Tools</p>
                        <p className="text-muted text-xs">Leverage advanced automation for scheduling, screening, and feedback management.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-white/10 bg-white/5 flex-col gap-3 p-4 flex mt-4 rounded-xl border">
                    <p className="text-xs text-muted uppercase tracking-widest">Platform Stats</p>
                    <div className="gap-4 grid-cols-2 grid">
                      <div>
                        <p className="type-card-title">12k+</p>
                        <p className="italic text-muted text-xs">Vetted Candidates</p>
                      </div>
                      <div>
                        <p className="type-card-title">500+</p>
                        <p className="italic text-muted text-xs">Fast-Growth Startups</p>
                      </div>
                    </div>
                  </div>

                  <div className="opacity-[0.03] -bottom-12 absolute -right-12">
                    <Headphones size={24} aria-hidden="true" />
                  </div>
                </div>

                <div className="gap-4 rounded-2xl bg-surface border-border shadow-sm flex-col p-6 flex border dark:bg-card dark:border-border">
                  <div className="flex gap-3 items-center">
                    <div className="justify-center items-center rounded-full flex size-10 bg-primary/10">
                      <HelpCircle className="text-primary" size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="type-ui">Registration Help</h4>
                      <p className="text-muted text-xs">Response time: &lt; 2 hours</p>
                    </div>
                  </div>
                  <p className="leading-relaxed text-muted italic text-xs">
                    Facing issues with LinkedIn verification? Our support team is ready to help you complete your manual onboarding.
                  </p>
                  <button className="w-full text-primary border-primary/20 rounded-lg transition-colors cursor-pointer py-2 type-caption border hover:bg-primary/5">Contact Support</button>
                </div>
              </div>

            </div>
          </main>

          <footer className="border-t text-xs px-6 mt-auto gap-4 items-center border-border py-8 flex transition-colors text-muted justify-between flex-col md:px-20 md:flex-row dark:border-border">
            <div className="flex gap-8">
              <Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link>
              <Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link>
              <Link className="hover:text-primary transition-colors" href="#">Cookie Policy</Link>
            </div>
            <p>© 2026 JobLyne Inc. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
