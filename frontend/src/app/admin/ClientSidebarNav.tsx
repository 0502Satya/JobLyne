"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, ShieldCheck, FileText, CheckCircle2, 
  AlertTriangle, Users, Briefcase, LayoutDashboard, 
  LogOut, ClipboardList, ShieldAlert
} from "lucide-react";
import { adminLogoutAction } from "@/features/admin/actions";
import { toast } from "react-hot-toast";

interface ClientSidebarNavProps {
  adminRole: string;
}

export default function ClientSidebarNav({ adminRole }: ClientSidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await adminLogoutAction();
      if (res.success) {
        toast.success("Logged out successfully.");
        router.push("/admin/login");
      }
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/verification", label: "Verification Queue", icon: ShieldCheck },
    { href: "/admin/companies", label: "Companies", icon: Building2 },
    { href: "/admin/candidates", label: "Candidates", icon: Users },
    { href: "/admin/jobs", label: "Job Openings", icon: Briefcase },
    { href: "/admin/reports", label: "Support Tickets", icon: ShieldAlert },
    { href: "/admin/logs", label: "Audit Logs", icon: ClipboardList },
  ];

  // Super Admins only see Teammates
  if (adminRole === "super_admin") {
    navItems.push({ href: "/admin/admins", label: "Admin Teammates", icon: Users });
  }

  return (
    <nav className="flex-1 p-4 space-y-1 flex flex-col justify-between">
      <div className="space-y-1">
        {navItems.map(item => {
          const ItemIcon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <ItemIcon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>
      
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 cursor-pointer transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </nav>
  );
}
