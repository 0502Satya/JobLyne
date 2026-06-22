"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { logoutAction } from "../actions";
import { User, Settings, LogOut } from "lucide-react";

/**
 * A premium user menu dropdown with Profile and Logout options.
 * Appears when the user clicks on their avatar circle.
 */
export default function UserMenu({ 
    initials, 
    profileImage 
}: { 
    initials: string;
    profileImage?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar Button (click to toggle dropdown) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="ring-surface justify-center cursor-pointer shadow-md ring-2 items-center overflow-hidden transition-all text-white type-ui rounded-full shadow-primary/20 bg-primary flex size-10 hover:scale-105 active:scale-95"
            >
                {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    initials
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="slide-in-from-top-2 fade-in border-border z-[100] rounded-2xl absolute overflow-hidden duration-200 mt-3 animate-in shadow-2xl w-56 right-0 bg-surface border">
                    <div className="border-border/40 border-b py-3 px-5">
                        <p className="uppercase tracking-wider type-caption text-muted">Account</p>
                    </div>

                    {/* Edit Profile */}
                    <Link
                        href="/dashboard/profile"
                        onClick={() => setIsOpen(false)}
                        className="text-text group py-4 items-center transition-all type-ui gap-3 flex px-5 hover:bg-primary/5 hover:text-primary"
                    >
                        <User size={18} className="text-muted transition-colors group-hover:text-primary" aria-hidden="true" />
                        Edit Profile
                    </Link>

                    {/* Settings */}
                    <Link
                        href="/dashboard/settings"
                        onClick={() => setIsOpen(false)}
                        className="text-text group py-4 items-center transition-all type-ui gap-3 flex px-5 hover:bg-primary/5 hover:text-primary"
                    >
                        <Settings size={18} className="text-muted transition-colors group-hover:text-primary" aria-hidden="true" />
                        Settings
                    </Link>

                    {/* Divider */}
                    <div className="bg-border/40 mx-4 h-px"></div>

                    {/* Logout */}
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="w-full group type-label py-4 items-center transition-all gap-3 flex text-left px-5 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                            <LogOut size={18} className="transition-transform group-hover:rotate-12" aria-hidden="true" />
                            Logout
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
