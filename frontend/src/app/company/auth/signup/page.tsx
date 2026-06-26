"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { companySignupAction } from "@/features/auth/actions";
import OTPVerification from "@/features/auth/components/OTPVerification";
import { Button, Input } from "@/shared/ui";
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
              <Button as={Link} href="/auth/signin" variant="primary" size="sm" className="rounded-lg shadow-lg">
                Sign In
              </Button>
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
                      <div className="border border-error/20 text-sm items-start text-error rounded-lg gap-3 flex p-4 bg-error-bg dark:border-error/20">
                        <AlertCircle className="shrink-0 text-error mt-0.5" size={20} aria-hidden="true" />
                        <span className="flex-1">{error}</span>
                      </div>
                    )}

                    <div className="space-y-6">
                      <Input
                        id="companyName"
                        name="companyName"
                        label="Organization Name *"
                        leftSlot={<Building2 size={18} aria-hidden="true" />}
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Corporation"
                        required
                        className="dark:border-border dark:bg-card rounded-xl"
                      />

                      <Input
                        id="email"
                        name="email"
                        label="Work Email *"
                        leftSlot={<Mail size={18} aria-hidden="true" />}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@company.com"
                        type="email"
                        required
                        className="dark:border-border dark:bg-card rounded-xl"
                      />

                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 animate-none">
                        <Input
                          id="password"
                          name="password"
                          label="Password *"
                          leftSlot={<Lock size={18} aria-hidden="true" />}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          type="password"
                          minLength={8}
                          required
                          className="dark:border-border dark:bg-card rounded-xl"
                        />

                        <Input
                          id="password_confirm"
                          name="password_confirm"
                          label="Confirm Password *"
                          leftSlot={<Lock size={18} aria-hidden="true" />}
                          value={formData.password_confirm}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          type="password"
                          minLength={8}
                          required
                          className="dark:border-border dark:bg-card rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        type="submit"
                        isLoading={isPending}
                        variant="primary"
                        size="lg"
                        className="w-full rounded-xl"
                        rightIcon={<ArrowRight size={18} aria-hidden="true" />}
                      >
                        Register Company
                      </Button>
                    </div>
                    
                    <p className="pt-2 text-center text-muted type-caption">
                      By registering, you agree to our <Link href="#" className="text-primary hover:underline">Terms of service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
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
