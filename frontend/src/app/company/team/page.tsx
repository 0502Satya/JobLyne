"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { 
  getTeamMembersAction, 
  deleteTeamMemberAction, 
  getTeamInvitesAction, 
  inviteTeamMemberAction 
} from "@/features/company/actions";

interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  team_role: "ADMIN" | "HIRING_MANAGER" | "INTERVIEWER" | "VIEWER";
  is_active: boolean;
}

interface TeamInvite {
  id: string;
  invited_email: string;
  role: "ADMIN" | "HIRING_MANAGER" | "INTERVIEWER" | "VIEWER";
  status: string;
  invited_at: string;
}

export default function CompanyTeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "HIRING_MANAGER" | "INTERVIEWER" | "VIEWER">("VIEWER");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  const loadTeamData = async () => {
    try {
      const [membersRes, invitesRes] = await Promise.all([
        getTeamMembersAction(),
        getTeamInvitesAction()
      ]);

      if (membersRes.error) {
        setError(membersRes.error);
      } else {
        setMembers(membersRes || []);
      }

      if (!invitesRes.error) {
        setInvites(invitesRes || []);
      }
    } catch (err) {
      setError("Failed to sync team settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, []);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailTrimmed = inviteEmail.trim().toLowerCase();
    if (!emailTrimmed) return;

    // Client-side quick check for public domains
    const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com'];
    const domain = emailTrimmed.split('@')[-1];
    if (publicDomains.includes(domain)) {
      setError("Invitations are restricted to corporate email domains. Please use a work email address.");
      return;
    }

    startTransition(async () => {
      const res = await inviteTeamMemberAction(emailTrimmed, inviteRole);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Invitation successfully sent to ${emailTrimmed}.`);
        setInviteEmail("");
        setInviteRole("VIEWER");
        setShowInviteModal(false);
        // Reload invites
        const freshInvites = await getTeamInvitesAction();
        if (!freshInvites.error) {
          setInvites(freshInvites || []);
        }
      }
    });
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name || "this user"} from your company team?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await deleteTeamMemberAction(memberId);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Team member successfully dissociated.");
        await loadTeamData();
      }
    } catch (err) {
      setError("Failed to delete member.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const term = searchQuery.toLowerCase();
    const fullName = `${m.first_name || ""} ${m.last_name || ""}`.toLowerCase();
    return m.email.toLowerCase().includes(term) || fullName.includes(term);
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "HIRING_MANAGER":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "INTERVIEWER":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text gap-4">
        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-muted font-bold text-sm tracking-widest uppercase">Loading Teammates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans transition-colors pb-20">
      
      {/* Sticky Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 md:px-12 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/company" className="flex items-center gap-2 text-primary font-black hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="text-2xl tracking-tight">JobLyne</span>
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hidden md:inline-block">Company Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/company" className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] min-h-[44px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Dashboard
          </Link>
          <button 
            onClick={() => logoutAction()} 
            className="text-xs font-black text-muted hover:text-red-500 transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-red-500/5 active:scale-[0.98] min-h-[44px]"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-7xl mx-auto w-full flex-1 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text">Team Collaboration</h1>
            <p className="text-muted text-sm font-semibold">Invite hiring managers, configure sub-roles, and review system logs.</p>
          </div>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="bg-primary text-surface px-6 py-3.5 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 min-h-[48px] shadow-lg shadow-primary/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Invite Teammate
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-black flex gap-3 animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-black flex gap-3 animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            {success}
          </div>
        )}

        {/* Filter Input */}
        <section className="bg-surface border border-border p-5 rounded-card shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by teammate name or email..."
              className="w-full pl-12 pr-4 py-3.5 bg-bg border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary font-medium text-xs min-h-[48px]"
            />
          </div>
        </section>

        {/* Layout: Active Team on Left, Pending Invites on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Active Teammates Table */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">group</span>
              Active Teammates
            </h3>
            
            <div className="bg-surface border border-border rounded-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-border bg-bg/50">
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-muted">Teammate</th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-muted">Role</th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-muted">Status</th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => {
                      const name = `${member.first_name || ""} ${member.last_name || ""}`.trim() || "Teammate";
                      const initials = name.substring(0, 2).toUpperCase();
                      return (
                        <tr key={member.id} className="border-b border-border last:border-0 hover:bg-bg/10 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-gradient-to-tr from-primary to-[#4c33cf] text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-sm text-text leading-tight truncate">{name}</h4>
                                <p className="text-xs text-muted font-bold tracking-tight truncate">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${getRoleBadgeClass(member.team_role)}`}>
                              {member.team_role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              member.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            }`}>
                              {member.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleRemoveMember(member.id, name)}
                              className="px-3 py-2 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white font-black text-[10px] uppercase rounded-xl transition-all min-h-[44px]"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-muted font-semibold text-sm">
                          No active team members matching filter preferences.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pending Invitations list */}
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">mail</span>
              Pending Invitations
            </h3>

            <div className="bg-surface border border-border p-6 rounded-card shadow-sm space-y-4">
              {invites.filter(i => i.status === "PENDING").map((invite) => (
                <div key={invite.id} className="border-b border-border/60 last:border-0 pb-4 last:pb-0 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-text truncate leading-tight">{invite.invited_email}</p>
                      <p className="text-[10px] text-muted font-bold mt-0.5">
                        Sent on {new Date(invite.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeClass(invite.role)}`}>
                      {invite.role}
                    </span>
                  </div>
                </div>
              ))}
              {invites.filter(i => i.status === "PENDING").length === 0 && (
                <div className="text-center text-muted text-xs font-semibold py-8 border border-dashed border-border/80 rounded-2xl">
                  No pending corporate team invitations.
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-card p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setShowInviteModal(false); setInviteEmail(""); setError(null); }}
              className="absolute top-6 right-6 p-2 text-muted hover:text-text hover:bg-bg rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-black tracking-tight">Invite Teammate</h3>
              <p className="text-muted text-sm font-semibold">Send a secure corporate invite to collaborate in this workspace.</p>
            </div>
            
            <form onSubmit={handleInviteSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted uppercase tracking-wider">Work Email Address</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full p-3.5 bg-bg border border-border rounded-2xl font-semibold text-xs min-h-[48px] outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted uppercase tracking-wider">Access Level (Role)</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full p-3.5 bg-bg border border-border rounded-2xl font-semibold text-xs min-h-[48px] outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="VIEWER">Viewer (Read-only)</option>
                  <option value="INTERVIEWER">Interviewer (Assess candidate details)</option>
                  <option value="HIRING_MANAGER">Hiring Manager (Shortlist, schedule)</option>
                  <option value="ADMIN">Admin (Full administrative credentials)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-primary text-surface font-black text-sm rounded-2xl hover:scale-[1.02] transition-all min-h-[48px] shadow-lg shadow-primary/10 cursor-pointer flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <div className="size-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    Sending Invite...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">send</span>
                    Send Invitation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
