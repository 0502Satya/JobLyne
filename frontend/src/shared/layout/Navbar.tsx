"use client";

import React from "react";
import Link from "next/link";
import { Button, Container, ThemeToggle } from "@/shared/ui";
import { Search, Menu, X, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [recruiterUrl, setRecruiterUrl] = React.useState("/recruiter");
    const [companyUrl, setCompanyUrl] = React.useState("/company");

    React.useEffect(() => {
        // Resolve URLs dynamically in browser to avoid environment variable baking issues
        const getUrl = (subdomain: "recruiter" | "company") => {
            const envVar = subdomain === "recruiter" 
                ? process.env.NEXT_PUBLIC_RECRUITER_URL 
                : process.env.NEXT_PUBLIC_COMPANY_URL;
            if (envVar) return envVar;

            const host = window.location.host;
            const protocol = window.location.protocol;
            const cleanHost = host.replace(/^(recruiter\.|company\.)/, "");
            if (cleanHost.includes("localhost") || cleanHost.includes("127.0.0.1")) {
                return `${protocol}//${subdomain}.${cleanHost}`;
            }
            return `https://${subdomain}.${cleanHost}`;
        };

        setRecruiterUrl(getUrl("recruiter"));
        setCompanyUrl(getUrl("company"));
    }, []);

    return (
        <header className="w-full border-b border-border bg-surface/80 backdrop-blur-md sticky transition-colors z-50 overflow-visible top-0">
            <Container size="xl" className="h-16 sm:h-20 items-center flex justify-between">
                {/* Left side: Logo and main links */}
                <div className="gap-4 flex items-center sm:gap-8">
                    <Link href="/" className="shrink-0 group items-center gap-2 flex">
                        <div className="bg-primary rounded-lg text-white p-1.5">
                            <svg
                                className="h-5 w-5 sm:h-6 sm:w-6"
                                fill="none"
                                viewBox="0 0 48 48"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                                    fill="currentColor"
                                    className="text-primary-light"
                                />
                            </svg>
                        </div>
                        <span className="text-text type-card-title tracking-tighter font-bold">JobLyne</span>
                    </Link>
                    <nav className="gap-6 hidden items-center md:flex">
                        <Link href="/jobs" className="transition-colors type-label hover:text-primary font-semibold">Jobs</Link>
                        <Link href="/courses" className="transition-colors type-label hover:text-primary font-semibold">Courses</Link>
                        <Link href={`${recruiterUrl}/auth/signin`} className="transition-colors type-label hover:text-primary font-semibold">Recruiters</Link>
                        <Link href={`${companyUrl}/auth/signin`} className="transition-colors type-label hover:text-primary font-semibold">Institutes</Link>
                    </nav>
                </div>

                {/* Right side: Actions */}
                <div className="gap-2 flex items-center sm:gap-3">
                    <ThemeToggle />
                    
                    {/* Search button */}
                    <button className="justify-center min-h-[44px] hidden items-center p-2 transition-colors min-w-[44px] text-muted sm:flex hover:text-primary">
                        <Search size={20} aria-hidden="true" />
                    </button>

                    {/* Compact Mobile Auth Actions (always visible on mobile) */}
                    <div className="flex sm:hidden items-center ml-1">
                        <MobileCompactAuthActions />
                    </div>

                    {/* Desktop Auth Actions */}
                    <div className="border-l border-border hidden items-center gap-2 pl-4 ml-2 sm:flex">
                        <AuthActions isMobile={false} />
                        <div className="hidden h-6 mx-2 w-px bg-border lg:block"></div>
                        <EmployerDropdown recruiterUrl={recruiterUrl} companyUrl={companyUrl} />
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="sm:hidden w-11 justify-center items-center transition-colors h-11 flex text-muted hover:text-primary cursor-pointer select-none"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? (
                            <X size={24} aria-hidden="true" />
                        ) : (
                            <Menu size={24} aria-hidden="true" />
                        )}
                    </button>
                </div>
            </Container>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="sm:hidden w-full border-b border-border slide-in-from-top-4 absolute left-0 animate-in z-50 shadow-xl duration-300 py-6 flex gap-6 top-full px-4 bg-surface flex-col">
                    <nav className="gap-4 flex flex-col">
                        <Link onClick={() => setIsMenuOpen(false)} href="/jobs" className="text-text border-b border-border/50 type-card-title py-3">Jobs</Link>
                        <Link onClick={() => setIsMenuOpen(false)} href="/courses" className="text-text border-b border-border/50 type-card-title py-3">Courses</Link>
                        <Link onClick={() => setIsMenuOpen(false)} href={`${recruiterUrl}/auth/signin`} className="text-text border-b border-border/50 type-card-title py-3">Recruiters</Link>
                        <Link onClick={() => setIsMenuOpen(false)} href={`${companyUrl}/auth/signin`} className="text-text py-3 type-card-title">Institutes</Link>
                    </nav>

                    <div className="border-t flex-col gap-3 border-border flex pt-4 dark:border-border">
                        <AuthActions isMobile={true} />
                        <div className="mt-2 grid-cols-2 grid gap-3">
                           <Link 
                                href={`${recruiterUrl}/auth/signin`}
                                className="gap-1 p-3 items-center bg-bg text-center flex rounded-xl flex-col dark:bg-card"
                            >
                                <span className="text-primary type-badge font-bold">Recruiter</span>
                            </Link>
                            <Link 
                                href={`${companyUrl}/auth/signin`}
                                className="gap-1 p-3 items-center bg-bg text-center flex rounded-xl flex-col dark:bg-card"
                            >
                                <span className="text-primary type-badge font-bold">Company</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

/**
 * Compact action button for guest mobile layout context.
 */
function MobileCompactAuthActions() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    React.useEffect(() => {
        const hasSession = document.cookie.includes('joblyne_session=true');
        setIsLoggedIn(hasSession);
    }, []);

    if (isLoggedIn) {
        return (
            <Button 
                as={Link}
                href="/dashboard" 
                variant="primary"
                size="sm"
                aria-label="Dashboard"
            >
                Dashboard
            </Button>
        );
    }

    return (
        <Button 
            as={Link}
            href="/auth/signup" 
            variant="primary"
            size="sm"
        >
            Get Started
        </Button>
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
            <div className={`flex items-center ${isMobile ? 'w-full gap-3 flex-col' : 'gap-4'}`}>
                <Button 
                    as={Link} 
                    href="/dashboard" 
                    variant="primary" 
                    className={`${isMobile ? 'w-full py-4' : ''}`}
                >
                    <LayoutDashboard size={18} aria-hidden="true" />
                    Dashboard
                </Button>
                <form 
                  className={isMobile ? 'w-full' : ''}
                  action={async () => {
                    const { logoutAction } = await import("@/features/auth/actions");
                    await logoutAction();
                }}>
                    <Button 
                        type="submit" 
                        variant="ghost" 
                        className={`text-muted hover:text-red-500 ${isMobile ? 'w-full py-3 bg-surface-2 rounded-xl' : ''}`}
                    >
                        <LogOut size={18} aria-hidden="true" />
                        Logout
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className={`flex items-center ${isMobile ? 'w-full gap-3 flex-col' : 'gap-2'}`}>
            <Button 
                as={Link} 
                href="/auth/signin" 
                variant="outline" 
                className={`${isMobile ? 'w-full py-4' : ''}`}
            >
                Login
            </Button>
            <Button 
                as={Link} 
                href="/auth/signup" 
                variant="primary" 
                className={`shadow-md shadow-primary/10 ${isMobile ? 'w-full py-4' : ''}`}
            >
                Register
            </Button>
        </div>
    );
}

/**
 * Dropdown for recruiter and company portals. (Desktop only)
 */
function EmployerDropdown({ recruiterUrl, companyUrl }: { recruiterUrl: string; companyUrl: string }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        }
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="p-2 relative" ref={dropdownRef}>
            <button 
                id="employer-menu-button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls="employer-menu"
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                className="text-text gap-1 items-center type-ui py-2 transition-colors flex hover:text-primary cursor-pointer select-none font-semibold"
            >
                For employers
                <ChevronDown
                    size={18}
                    className={`duration-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>

            <div 
                id="employer-menu"
                role="menu"
                aria-labelledby="employer-menu-button"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className={`z-[100] absolute duration-200 pt-2 transition-all w-56 top-full right-0 ${isOpen ? 'translate-y-0 opacity-100' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            >
                <div className="border-border rounded-2xl overflow-hidden p-2 shadow-2xl bg-surface border">
                    <Link 
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        href={`${recruiterUrl}/auth/signin`}
                        className="group p-3 gap-0.5 transition-colors flex rounded-xl flex-col hover:bg-bg dark:hover:bg-card"
                    >
                        <span className="type-ui transition-colors group-hover:text-primary font-bold">Recruiter Portal</span>
                        <span className="text-muted text-xs">Find and vet top talent quickly.</span>
                    </Link>
                    <Link 
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        href={`${companyUrl}/auth/signin`}
                        className="border-t group p-3 gap-0.5 border-border transition-colors flex rounded-xl flex-col hover:bg-bg dark:hover:bg-card dark:border-border/50"
                    >
                        <span className="type-ui transition-colors group-hover:text-primary font-bold">Company Login</span>
                        <span className="text-muted text-xs">Manage your organization's hiring.</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
