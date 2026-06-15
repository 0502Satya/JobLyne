"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/shared/ui";
import ThemeToggle from "@/shared/ui/ThemeToggle";

const RECRUITER_URL = process.env.NEXT_PUBLIC_RECRUITER_URL || "http://recruiter.localhost:3000";
const COMPANY_URL = process.env.NEXT_PUBLIC_COMPANY_URL || "http://company.localhost:3000";

/**
 * The navigation bar at the top of the page.
 * It stays at the top when you scroll (sticky).
 * It has the logo, links, and buttons like 'Log in' and 'Get Started'.
 */
export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md transition-colors overflow-visible">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
                {/* Left side: Logo and main links */}
                <div className="flex items-center gap-4 sm:gap-8">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="p-1.5 bg-primary rounded-lg text-surface">
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                fill="none"
                                viewBox="0 0 48 48"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                        <span className="text-lg sm:text-xl font-black tracking-tighter text-text">JobLyne</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/dashboard" className="text-sm font-bold text-muted hover:text-primary transition-colors">Jobs</Link>
                        <Link href="/dashboard/jobs" className="text-sm font-bold text-muted hover:text-primary transition-colors">Courses</Link>
                        <Link href={`${RECRUITER_URL}/auth/signin`} className="text-sm font-bold text-muted hover:text-primary transition-colors">Recruiters</Link>
                        <Link href={`${COMPANY_URL}/auth/signin`} className="text-sm font-bold text-muted hover:text-primary transition-colors">Institutes</Link>
                    </nav>
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    
                    {/* Search button */}
                    <button className="hidden sm:flex items-center text-muted hover:text-primary p-2 transition-colors min-w-[44px] min-h-[44px] justify-center">
                        <span className="material-symbols-outlined">search</span>
                    </button>

                    {/* Desktop Auth Actions */}
                    <div className="hidden sm:flex items-center gap-2 border-l border-border pl-4 ml-2">
                        <AuthActions isMobile={false} />
                        <div className="h-6 w-px bg-border mx-2 hidden lg:block"></div>
                        <EmployerDropdown />
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="sm:hidden flex items-center justify-center w-11 h-11 text-muted hover:text-primary transition-colors"
                        aria-label="Toggle Menu"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="sm:hidden absolute top-full left-0 w-full bg-surface border-b border-border shadow-xl py-6 px-4 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300 z-50">
                    <nav className="flex flex-col gap-4">
                        <Link onClick={() => setIsMenuOpen(false)} href="/dashboard" className="text-base font-bold text-text py-3 border-b border-border/50">Jobs</Link>
                        <Link onClick={() => setIsMenuOpen(false)} href="/dashboard/jobs" className="text-base font-bold text-text py-3 border-b border-border/50">Courses</Link>
                        <Link onClick={() => setIsMenuOpen(false)} href={`${RECRUITER_URL}/auth/signin`} className="text-base font-bold text-text py-3 border-b border-border/50">Recruiters</Link>
                        <Link onClick={() => setIsMenuOpen(false)} href={`${COMPANY_URL}/auth/signin`} className="text-base font-bold text-text py-3">Institutes</Link>
                    </nav>

                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <AuthActions isMobile={true} />
                        <div className="grid grid-cols-2 gap-3 mt-2">
                           <Link 
                                href={`${RECRUITER_URL}/auth/signin`}
                                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center"
                            >
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Recruiter</span>
                            </Link>
                            <Link 
                                href={`${COMPANY_URL}/auth/signin`}
                                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center"
                            >
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Company</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

/**
 * Split Login/Register or Dashboard button.
 */
function AuthActions({ isMobile }: { isMobile?: boolean }) {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    React.useEffect(() => {
        const hasSession = document.cookie.includes('joblyne_session=true');
        setIsLoggedIn(hasSession);
    }, []);

    if (isLoggedIn) {
        return (
            <div className={`flex items-center ${isMobile ? 'flex-col gap-3 w-full' : 'gap-4'}`}>
                <Link href="/dashboard" className={`text-sm font-black px-5 py-2.5 bg-btn-primary text-surface hover:bg-btn-primary-hover rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${isMobile ? 'w-full py-4' : ''}`}>
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    Dashboard
                </Link>
                <form 
                  className={isMobile ? 'w-full' : ''}
                  action={async () => {
                    const { logoutAction } = await import("@/features/auth/actions");
                    await logoutAction();
                }}>
                    <button type="submit" className={`text-sm font-black text-muted hover:text-red-500 transition-colors flex items-center justify-center gap-2 min-h-[44px] ${isMobile ? 'w-full bg-bg rounded-xl py-3' : ''}`}>
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span>Logout</span>
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={`flex items-center ${isMobile ? 'flex-col gap-3 w-full' : 'gap-2'}`}>
            <Link 
                href="/auth/signin" 
                className={`text-sm font-black px-5 py-2.5 border-2 border-primary text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center justify-center ${isMobile ? 'w-full py-4' : ''}`}
            >
                Login
            </Link>
            <Link 
                href="/auth/signup" 
                className={`text-sm font-black px-5 py-2.5 bg-btn-primary text-surface hover:bg-btn-primary-hover rounded-xl shadow-md shadow-primary/20 transition-all border-2 border-transparent flex items-center justify-center ${isMobile ? 'w-full py-4' : ''}`}
            >
                Register
            </Link>
        </div>
    );
}

/**
 * Dropdown for recruiter and company portals. (Desktop only)
 */
function EmployerDropdown() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative group p-2">
            <button 
                onMouseEnter={() => setIsOpen(true)}
                className="flex items-center gap-1 text-sm font-black text-text hover:text-primary transition-colors py-2"
            >
                For employers
                <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            <div 
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className={`absolute right-0 top-full pt-2 w-56 transition-all duration-200 z-[100] ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            >
                <div className="bg-surface border border-border rounded-2xl shadow-2xl p-2 overflow-hidden">
                    <Link 
                        href={`${RECRUITER_URL}/auth/signin`}
                        className="flex flex-col gap-0.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                        <span className="text-sm font-black group-hover:text-primary transition-colors">Recruiter Portal</span>
                        <span className="text-[10px] text-slate-500 font-bold">Find and vet top talent quickly.</span>
                    </Link>
                    <Link 
                        href={`${COMPANY_URL}/auth/signin`}
                        className="flex flex-col gap-0.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group border-t border-slate-100 dark:border-slate-800/50"
                    >
                        <span className="text-sm font-black group-hover:text-primary transition-colors">Company Login</span>
                        <span className="text-[10px] text-slate-500 font-bold">Manage your organization's hiring.</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
