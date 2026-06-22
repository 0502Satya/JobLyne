"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { companySignupAction } from "@/features/auth/actions";
import OTPVerification from "@/features/auth/components/OTPVerification";
import { 
  Users, 
  Zap, 
  Shield, 
  Building2, 
  AlertCircle, 
  Mail, 
  Lock, 
  ArrowRight 
} from "lucide-react";

export default function CompanySignupPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    role: "admin",
    email: "",
    password: "",
    password_confirm: ""
  });
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value as string);
    });

    startTransition(async () => {
      const res = await companySignupAction(null, formDataObj);
      if (res?.error) {
        setError(res.error);
      } else if (res?.requiresVerification) {
        setUserEmail(res.email);
        setRequiresVerification(true);
      } else if (res?.success) {
        router.push("/");
      }
    });
  };

  if (requiresVerification) {
    return (
      <div className="justify-center items-center bg-bg p-6 transition-colors text-text flex min-h-screen dark:bg-surface">
        <OTPVerification email={userEmail} />
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
              <span className="text-muted hidden text-sm md:block">Already have an account?</span>
              <Link href="/auth/signin" className="justify-center h-10 cursor-pointer bg-primary items-center transition-all rounded-lg text-white type-ui shadow-primary/20 min-w-[84px] flex shadow-lg px-4 hover:opacity-90 active:scale-[0.98]">
                Sign In
              </Link>
            </div>
          </header>

          <main className="flex-1 items-center transition-all overflow-x-hidden flex py-10 px-4 flex-col lg:justify-center">
            <div className="w-full max-w-6xl gap-8 grid grid-cols-1 lg:gap-12 lg:grid-cols-2">
              
              {/* Left Column (Info) */}
              <div className="order-2 self-center flex gap-6 flex-col lg:order-1">
                <div className="gap-2 flex flex-col">
                  <h1 className="type-display text-text leading-tight">
                    Register your company
                  </h1>
                  <p className="text-muted text-lg">
                    Join the network of professional organizations using JobLyne to find top talent effortlessly.
                  </p>
                </div>
                
                <div className="rounded-2xl relative space-y-6 overflow-hidden mt-6 bg-surface border-border shadow-xl p-8 border dark:bg-card dark:border-border">
                  <div className="relative z-10">
                    <h4 className="mb-4 text-text type-card-title">Why JobLyne?</h4>
                    <ul className="space-y-4">
                      <li className="gap-4 flex items-start">
                        <div className="justify-center text-primary size-8 shrink-0 items-center rounded-full flex bg-primary/10">
                          <Users size={14} aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-text type-ui">Access Top Talent</p>
                          <p className="text-muted mt-1 text-sm">10k+ pre-vetted skill-matched candidates ready to interview.</p>
                        </div>
                      </li>
                      <li className="gap-4 flex items-start">
                        <div className="justify-center text-primary size-8 shrink-0 items-center rounded-full flex bg-primary/10">
                          <Zap size={14} aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-text type-ui">Faster Hiring</p>
                          <p className="text-muted mt-1 text-sm">Automate interview scheduling and candidate management.</p>
                        </div>
                      </li>
                      <li className="gap-4 flex items-start">
                        <div className="justify-center text-primary size-8 shrink-0 items-center rounded-full flex bg-primary/10">
                          <Shield size={14} aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-text type-ui">100% Tax Compliant</p>
                          <p className="text-muted mt-1 text-sm">Built-in employment compliance and payroll integrations.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="-bottom-8 opacity-[0.03] -right-8 absolute dark:opacity-[0.05]">
                    <Building2 className="text-text" size={48} aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Right Column (Form) */}
              <div className="order-1 lg:order-2">
                <div className="fade-in rounded-2xl bg-surface border-border animate-in shadow-xl zoom-in-95 duration-500 p-8 border dark:bg-card dark:border-border sm:p-10">
                  <form onSubmit={submitRegistration} className="space-y-6">
                    
                    {error && (
                      <div className="border border-red-200 text-sm items-start text-red-700 rounded-lg gap-3 flex p-4 bg-red-50 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400">
                        <AlertCircle className="shrink-0 text-red-500 mt-0.5" size={20} aria-hidden="true" />
                        <span className="flex-1">{error}</span>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="gap-2 flex flex-col">
                        <label className="text-text type-ui">Organization Name *</label>
                        <div className="relative">
                          <Building2 className="left-4 text-muted absolute top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                          <input 
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            className="w-full placeholder:text-muted outline-none pl-12 transition-all bg-bg py-3 border-border text-text pr-4 rounded-xl border dark:border-border dark:bg-card focus:ring-2 focus:border-transparent focus:ring-primary" 
                            placeholder="e.g. Acme Corporation" 
                            type="text" 
                            required
                          />
                        </div>
                      </div>

                      <div className="gap-2 flex flex-col">
                        <label className="text-text type-ui">Work Email *</label>
                        <div className="relative">
                          <Mail className="left-4 text-muted absolute top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                          <input 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            className="w-full placeholder:text-muted outline-none pl-12 transition-all bg-bg py-3 border-border text-text pr-4 rounded-xl border dark:border-border dark:bg-card focus:ring-2 focus:border-transparent focus:ring-primary" 
                            placeholder="you@company.com" 
                            type="email" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <div className="gap-2 flex flex-col">
                          <label className="text-text type-ui">Password *</label>
                          <div className="relative">
                            <Lock className="left-4 text-muted absolute top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                            <input 
                              name="password" 
                              value={formData.password} 
                              onChange={handleInputChange} 
                              className="w-full placeholder:text-muted outline-none pl-12 transition-all bg-bg py-3 border-border text-text pr-4 rounded-xl border dark:border-border dark:bg-card focus:ring-2 focus:border-transparent focus:ring-primary" 
                              placeholder="••••••••" 
                              type="password" 
                              minLength={8} 
                              required 
                            />
                          </div>
                        </div>
                        <div className="gap-2 flex flex-col">
                          <label className="text-text type-ui">Confirm Password *</label>
                          <div className="relative">
                            <Lock className="left-4 text-muted absolute top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                            <input 
                              name="password_confirm" 
                              value={formData.password_confirm} 
                              onChange={handleInputChange} 
                              className="w-full placeholder:text-muted outline-none pl-12 transition-all bg-bg py-3 border-border text-text pr-4 rounded-xl border dark:border-border dark:bg-card focus:ring-2 focus:border-transparent focus:ring-primary" 
                              placeholder="••••••••" 
                              type="password" 
                              minLength={8} 
                              required 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={isPending}
                        className="w-full justify-center type-card-title py-3.5 transition-all items-center text-white gap-2 bg-primary flex rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none disabled:hover:transform-none"
                      >
                        {isPending ? (
                          <span className="gap-2 flex items-center">
                            <svg className="h-5 animate-spin text-current w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Creating account...
                          </span>
                        ) : (
                          <>
                            <span>Register Company</span>
                            <ArrowRight size={18} aria-hidden="true" />
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="pt-2 text-center text-muted type-caption">
                      By registering, you agree to our <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                    </p>
                  </form>
                </div>
              </div>

            </div>
          </main>
          
          {/* Footer */}
          <footer className="border-t justify-center text-xs text-muted px-6 gap-4 mt-auto items-center border-border bg-surface py-8 transition-colors flex flex-col dark:bg-card dark:border-border md:flex-row">
            <p>© 2024 JobLyne Inc. All rights reserved.</p>
          </footer>

        </div>
      </div>
    </div>
  );
}
