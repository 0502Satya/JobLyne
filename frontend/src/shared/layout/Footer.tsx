import Link from "next/link";
import { Container } from "@/shared/ui";
import { Globe, AtSign, Rss, Languages } from "lucide-react";

/**
 * The footer at the bottom of the page.
 * It has the platform details, social links, and lists of links for navigation.
 */
export default function Footer() {
    return (
        <footer className="border-t border-border transition-colors py-16 bg-surface">
            <Container size="xl">
                <div className="mb-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 xl:grid-cols-6">
                    {/* Logo and short description */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <div className="gap-2 flex mb-6 items-center">
                            <div className="bg-primary rounded-lg text-white p-1.5">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <span className="text-text tracking-tight type-h3">JobLyne</span>
                        </div>
                        <p className="type-label leading-relaxed transition-colors max-w-xs mb-6">
                            One stop solution for your career intelligence.
                        </p>
                        {/* Social media icons */}
                        <div className="gap-4 flex">
                            <a className="w-11 justify-center items-center bg-bg transition-all shadow-sm rounded-full h-11 flex text-muted hover:bg-primary hover:text-white" href="#" aria-label="Official website">
                                <Globe size={20} aria-hidden="true" />
                            </a>
                            <a className="w-11 justify-center items-center bg-bg transition-all shadow-sm rounded-full h-11 flex text-muted hover:bg-primary hover:text-white" href="#" aria-label="Email support">
                                <AtSign size={20} aria-hidden="true" />
                            </a>
                            <a className="w-11 justify-center items-center bg-bg transition-all shadow-sm rounded-full h-11 flex text-muted hover:bg-primary hover:text-white" href="#" aria-label="RSS feed">
                                <Rss size={20} aria-hidden="true" />
                            </a>
                        </div>
                    </div>

                    {/* Lists of important links grouped by topic */}
                    <div>
                        <h5 className="text-text uppercase tracking-widest mb-6 type-caption">Platform</h5>
                        <ul className="text-sm space-y-4 text-muted">
                            <li><Link className="hover:text-primary transition-colors" href="/jobs">Find jobs</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/courses">Courses</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Talent Search</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-text uppercase tracking-widest mb-6 type-caption">Company</h5>
                        <ul className="text-sm space-y-4 text-muted">
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">About Us</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Careers</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Blog</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-text uppercase tracking-widest mb-6 type-caption">Resources</h5>
                        <ul className="text-sm space-y-4 text-muted">
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Help Center</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Partners</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Institutes</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Developers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-text uppercase tracking-widest mb-6 type-caption">Legal</h5>
                        <ul className="text-sm space-y-4 text-muted">
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Privacy</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Terms</Link></li>
                            <li><Link className="hover:text-primary transition-colors opacity-50 cursor-not-allowed" href="#" aria-disabled="true">Security</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Simple copyright line at the very bottom */}
                <div className="pt-8 border-t border-border gap-4 items-center flex justify-between flex-col md:flex-row">
                    <p className="text-xs text-muted">© 2026 JobLyne AI Inc. All rights reserved.</p>
                    <div className="flex gap-6 items-center">
                        <button className="text-xs gap-1 items-center flex text-muted cursor-pointer">
                            <Languages size={14} aria-hidden="true" />
                            English (US)
                        </button>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
