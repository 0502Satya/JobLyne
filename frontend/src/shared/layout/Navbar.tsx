"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Container, ThemeToggle } from "@/shared/ui";
import { Search, Menu, X, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import NotificationCenter from "@/features/dashboard/components/NotificationCenter";
import UserMenu from "@/features/auth/components/UserMenu";
import { getCandidateProfileAction } from "@/features/auth/actions";

interface NavbarProps {
    isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [navSearchQuery, setNavSearchQuery] = useState("");
    const [recruiterUrl, setRecruiterUrl] = useState("/recruiter");
    const [companyUrl, setCompanyUrl] = useState("/company");
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
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

    useEffect(() => {
        if (!isLoggedIn) return;
        async function fetchProfile() {
            try {
                const profileData = await getCandidateProfileAction();
                if (profileData && !profileData.error) {
                    setProfile(profileData);
                }
            } catch (err) {
                console.error("Failed to load candidate profile in Navbar:", err);
            }
        }
        fetchProfile();
    }, [isLoggedIn]);

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
        : "AL";
    const profileImage = profile?.profile_image;

    const handleNavSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const q = navSearchQuery.trim();
            if (q) {
                router.push(`/jobs?query=${encodeURIComponent(q)}`);
            } else {
                router.push("/jobs");
            }
        },
        [navSearchQuery, router]
    );

    const navLinks = [
        { name: "Job", href: "/jobs" },
        { name: "Recruiter", href: `${recruiterUrl}/auth/signin` },
        { name: "Company", href: `${companyUrl}/auth/signin` },
    ];

    return (
        <header className="w-full border-b border-border bg-surface/80 backdrop-blur-md sticky transition-colors z-50 overflow-visible top-0">
            <Container size="xl" className="h-[var(--height-header)] items-center flex justify-between relative">
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
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="transition-colors type-label hover:text-primary font-semibold"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Centre: Search bar — absolutely centred so it doesn't shift left/right content */}
                {isLoggedIn && (
                    <form
                        onSubmit={handleNavSearch}
                        role="search"
                        className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 w-[420px] xl:w-[500px]"
                    >
                        <label htmlFor="navbar-search" className="sr-only">Search Jobs, Skills, and Companies</label>
                        <input
                            id="navbar-search"
                            type="text"
                            value={navSearchQuery}
                            onChange={(e) => setNavSearchQuery(e.target.value)}
                            placeholder="Search Jobs, Skills, and Companies"
                            className="w-full h-10 pl-4 pr-11 text-sm rounded-xl border border-border/60 bg-bg focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
                        />
                        <button
                            type="submit"
                            aria-label="Search"
                            className="absolute right-0 top-0 h-10 w-11 flex items-center justify-center rounded-r-xl bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
                        >
                            <Search size={16} aria-hidden="true" />
                        </button>
                    </form>
                )}

                {/* Right side: Actions */}
                <div className="gap-2 flex items-center sm:gap-3">


                    <ThemeToggle />

                    {!isLoggedIn && (
                        /* Search button */
                        <button aria-label="Search" className="justify-center min-h-[44px] hidden items-center p-2 transition-colors min-w-[44px] text-muted sm:flex hover:text-primary">
                            <Search size={20} aria-hidden="true" />
                        </button>
                    )}

                    {isLoggedIn ? (
                        /* Logged in desktop/mobile actions */
                        <div className="flex items-center gap-4">
                            <NotificationCenter />
                            <UserMenu initials={initials} profileImage={profileImage} />
                        </div>
                    ) : (
                        /* Logged out actions */
                        <>
                            {/* Compact Mobile Auth Actions (always visible on mobile) */}
                            <div className="flex sm:hidden items-center ml-1">
                                <MobileCompactAuthActions isLoggedIn={isLoggedIn} />
                            </div>

                            {/* Desktop Auth Actions */}
                            <div className="border-l border-border hidden items-center gap-2 pl-4 ml-2 sm:flex">
                                <AuthActions isLoggedIn={isLoggedIn} isMobile={false} />
                                <div className="hidden h-6 mx-2 w-px bg-border lg:block"></div>
                                <EmployerDropdown recruiterUrl={recruiterUrl} companyUrl={companyUrl} />
                            </div>
                        </>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="sm:hidden w-11 justify-center items-center transition-colors h-11 flex text-muted hover:text-primary cursor-pointer select-none"
                        aria-label="Toggle menu"
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
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                onClick={() => setIsMenuOpen(false)}
                                href={link.href}
                                className="text-text border-b border-border/50 type-card-title py-3"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t flex-col gap-3 border-border flex pt-4 dark:border-border">
                        <AuthActions isLoggedIn={isLoggedIn} isMobile={true} />
                        {!isLoggedIn && (
                            <div className="mt-2 grid-cols-2 grid gap-3">
                                <Link
                                    onClick={() => setIsMenuOpen(false)}
                                    href={`${recruiterUrl}/auth/signin`}
                                    className="gap-1 p-3 items-center bg-bg text-center flex rounded-xl flex-col dark:bg-card"
                                >
                                    <span className="text-primary type-badge font-bold">Recruiter</span>
                                </Link>
                                <Link
                                    onClick={() => setIsMenuOpen(false)}
                                    href={`${companyUrl}/auth/signin`}
                                    className="gap-1 p-3 items-center bg-bg text-center flex rounded-xl flex-col dark:bg-card"
                                >
                                    <span className="text-primary type-badge font-bold">Company</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}


/**
 * Compact action button for guest mobile layout context.
 */
function MobileCompactAuthActions({ isLoggedIn }: { isLoggedIn: boolean }) {
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
            Get started
        </Button>
    );
}

/**
 * Split Login/Register or Dashboard button.
 */
function AuthActions({ isLoggedIn, isMobile }: { isLoggedIn: boolean; isMobile?: boolean }) {
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
                        className={`text-muted hover:text-error ${isMobile ? 'w-full py-3 bg-surface-2 rounded-xl' : ''}`}
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
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const itemRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);

    React.useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
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

    const handleMenuKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        const items = itemRefs.current.filter((el): el is HTMLAnchorElement => el !== null);
        const currentIndex = items.indexOf(document.activeElement as HTMLAnchorElement);

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex]?.focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            items[prevIndex]?.focus();
        } else if (e.key === "Home") {
            e.preventDefault();
            items[0]?.focus();
        } else if (e.key === "End") {
            e.preventDefault();
            items[items.length - 1]?.focus();
        }
    };

    return (
        <div className="p-2 relative" ref={dropdownRef}>
            <button
                id="employer-menu-button"
                ref={triggerRef}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls="employer-menu"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsOpen(true);
                        setTimeout(() => {
                            itemRefs.current[0]?.focus();
                        }, 50);
                    }
                }}
                className="text-text gap-1 items-center type-ui py-2 transition-colors flex hover:text-primary cursor-pointer select-none font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
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
                onKeyDown={handleMenuKeyDown}
                className={`z-dropdown absolute duration-200 pt-2 transition-all w-56 top-full right-0 ${isOpen ? 'translate-y-0 opacity-100' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            >
                <div className="border-border rounded-2xl overflow-hidden p-2 shadow-2xl bg-surface border">
                    <Link
                        ref={(el) => { itemRefs.current[0] = el; }}
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        href={`${recruiterUrl}/auth/signin`}
                        className="group p-3 gap-0.5 transition-colors flex rounded-xl flex-col hover:bg-bg dark:hover:bg-card focus-visible:bg-bg dark:focus-visible:bg-card outline-none"
                    >
                        <span className="type-ui transition-colors group-hover:text-primary group-focus-visible:text-primary font-bold">Recruiter portal</span>
                        <span className="text-muted text-xs">Find and vet top talent quickly.</span>
                    </Link>
                    <Link
                        ref={(el) => { itemRefs.current[1] = el; }}
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        href={`${companyUrl}/auth/signin`}
                        className="border-t group p-3 gap-0.5 border-border transition-colors flex rounded-xl flex-col hover:bg-bg dark:hover:bg-card focus-visible:bg-bg dark:focus-visible:bg-card dark:border-border/50 outline-none"
                    >
                        <span className="type-ui transition-colors group-hover:text-primary group-focus-visible:text-primary font-bold">Company login</span>
                        <span className="text-muted text-xs">Manage your organization's hiring.</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
