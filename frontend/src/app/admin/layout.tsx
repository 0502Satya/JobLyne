import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Building2, ShieldCheck, FileText, CheckCircle2, 
  AlertTriangle, X, Globe, Phone, Mail, User, Briefcase,
  ExternalLink, Check, Ban, Search, MapPin, Calendar, 
  Users, Eye, HelpCircle, LayoutDashboard, Settings, LogOut,
  ListTodo
} from "lucide-react";
import ClientSidebarNav from "./ClientSidebarNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("joblyne_session")?.value;
  const role = cookieStore.get("joblyne_role")?.value;
  const adminName = cookieStore.get("admin_name")?.value || "Administrator";
  const adminRole = cookieStore.get("admin_role")?.value || "super_admin";
  const adminPermsString = cookieStore.get("admin_perms")?.value || "[]";
  
  let adminPerms: string[] = [];
  try {
    adminPerms = JSON.parse(adminPermsString);
  } catch (e) {}
  if (session !== "true" || role !== "ADMIN") {
    return <>{children}</>;
  }

  return (
    <div className="text-slate-100 bg-slate-950 min-h-screen flex text-left transition-colors font-sans antialiased">
      {/* Locked Left Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900 flex flex-col fixed top-0 bottom-0 left-0 overflow-y-auto z-40">
        
        {/* Header branding */}
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="bg-primary rounded-xl text-white p-2 shadow-md shadow-primary/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block text-white">JobLyne</span>
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest block -mt-0.5">Control Center</span>
          </div>
        </div>

        {/* Dynamic client rendering for navigation menu */}
        <ClientSidebarNav adminRole={adminRole} />

        {/* Footer profile & Sign Out */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-primary items-center justify-center text-white font-bold flex shadow-md shrink-0 text-xs">
              {adminName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold truncate text-white">{adminName}</h4>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider truncate font-semibold">{adminRole.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace panels */}
      <main className="flex-1 overflow-x-hidden p-8 md:p-10 space-y-8 ml-64 bg-slate-950">
        {children}
      </main>
    </div>
  );
}
