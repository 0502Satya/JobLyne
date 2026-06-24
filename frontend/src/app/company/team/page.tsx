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
import { toast } from "react-hot-toast";
import { Button, Dialog } from "@/shared/ui";
import { 
  Network, 
  LayoutDashboard, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Search, 
  Users, 
  Mail, 
  X, 
  Send, 
  Loader2 
} from "lucide-react";

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
  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();



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
        toast.error(res.error);
      } else {
        const msg = `Invitation successfully sent to ${emailTrimmed}.`;
        setSuccess(msg);
        toast.success(msg);
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

  const handleRemoveMemberClick = (memberId: string, name: string) => {
    setDeleteTarget({ id: memberId, name });
  };

  const confirmRemoveMember = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleteTarget(null);
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await deleteTeamMemberAction(id);
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        const msg = `Team member ${name} successfully dissociated.`;
        setSuccess(msg);
        toast.success(msg);
        await loadTeamData();
      }
    } catch (err) {
      setError("Failed to delete member.");
      toast.error("Failed to delete member.");
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
        return "bg-error-bg text-error border-error/20";
      case "HIRING_MANAGER":
        return "bg-info/10 text-info border-info/20";
      case "INTERVIEWER":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted/10 text-muted border-muted/20";
    }
  };

  if (loading && members.length === 0) {
    return (
      <div className="text-text justify-center gap-4 items-center bg-bg flex min-h-screen flex-col">
        <div className="border-t-primary size-12 border-primary/20 rounded-full border-4 animate-spin"></div>
        <p className="type-label uppercase tracking-widest">Loading Teammates...</p>
      </div>
    );
  }

  return (
    <div className="text-text bg-bg pb-20 transition-colors flex min-h-screen flex-col">
      
      {/* Sticky Header */}
      <header className="border-b border-border px-6 py-4 items-center sticky z-40 flex top-0 bg-surface justify-between md:px-12">
        <div className="flex gap-6 items-center">
          <Link href="/company" className="text-primary items-center gap-2 flex transition-opacity hover:opacity-90">
            <Network size={30} aria-hidden="true" />
            <span className="text-2xl tracking-tight">JobLyne</span>
          </Link>
          <div className="h-6 hidden w-px bg-border md:block"></div>
          <span className="text-primary px-3 hidden py-1.5 rounded-full type-badge bg-primary/10 md:inline-block">Company Hub</span>
        </div>
        <div className="gap-4 flex items-center">
          <Link href="/company" className="type-badge rounded-xl min-h-[44px] items-center gap-2 py-3 transition-colors flex px-4 hover:bg-primary/5 hover:text-primary active:scale-[0.98]">
            <LayoutDashboard size={18} aria-hidden="true" />
            Dashboard
          </Link>
          <button 
            onClick={() => logoutAction()} 
            className="rounded-xl min-h-[44px] py-3 transition-colors type-badge px-4 hover:text-error hover:bg-error/5 active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="w-full space-y-8 mx-auto max-w-7xl flex-1 p-6 md:p-12">
        
        {/* Welcome Section */}
        <div className="flex justify-between gap-6 flex-col sm:flex-row sm:items-center">
          <div>
            <h1 className="text-text type-h1">Team Collaboration</h1>
            <p className="type-label">Invite hiring managers, configure sub-roles, and review system logs.</p>
          </div>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="min-h-[48px] cursor-pointer px-6 rounded-2xl py-3.5 items-center transition-all gap-2 type-ui shadow-primary/10 shadow-lg bg-primary flex text-white hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus size={18} aria-hidden="true" />
            Invite Teammate
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="slide-in-from-top-2 rounded-2xl text-error animate-in gap-3 border-error/20 type-ui flex p-4 bg-error-bg border">
            <AlertCircle size={20} aria-hidden="true" />
            {error}
          </div>
        )}
        {success && (
          <div className="slide-in-from-top-2 rounded-2xl text-success animate-in gap-3 bg-success-bg type-ui border-success/20 flex p-4 border">
            <CheckCircle size={20} aria-hidden="true" />
            {success}
          </div>
        )}

        {/* Filter Input */}
        <section className="rounded-card border-border gap-4 items-center shadow-sm flex-col flex p-5 bg-surface border sm:flex-row">
          <div className="w-full relative flex-1">
            <Search className="left-4 absolute top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by teammate name or email..."
              className="w-full outline-none pl-12 min-h-[48px] border-border rounded-2xl py-3.5 bg-bg pr-4 type-caption border focus:ring-2 focus:ring-primary"
            />
          </div>
        </section>

        {/* Layout: Active Team on Left, Pending Invites on Right */}
        <div className="items-start grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Active Teammates Table */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="type-h2 items-center gap-2 flex">
              <Users className="text-primary" size={20} aria-hidden="true" />
              Active Teammates
            </h3>
            
            <div className="rounded-card border-border overflow-hidden shadow-sm bg-surface border">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[552px]">
                  <thead>
                    <tr className="border-b bg-bg/50 border-border">
                      <th scope="col" className="type-badge p-4">Teammate</th>
                      <th scope="col" className="type-badge p-4">Role</th>
                      <th scope="col" className="type-badge p-4">Status</th>
                      <th scope="col" className="text-right type-badge p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => {
                      const name = `${member.first_name || ""} ${member.last_name || ""}`.trim() || "Teammate";
                      const initials = name.substring(0, 2).toUpperCase();
                      return (
                        <tr key={member.id} className="border-b transition-colors border-border last:border-0 hover:bg-bg/10">
                          <td className="p-4">
                            <div className="flex gap-3 items-center">
                              <div className="justify-center shrink-0 shadow-md bg-gradient-primary items-center text-white type-ui flex size-10 rounded-xl">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-text type-ui truncate leading-tight">{name}</h4>
                                <p className="tracking-tight truncate type-caption text-muted">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`py-1 px-2.5 rounded-full type-badge border ${getRoleBadgeClass(member.team_role)}`}>
                              {member.team_role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 rounded-full py-0.5 type-badge border ${
                              member.is_active ? "bg-success-bg text-success border-success/15" : "bg-error-bg text-error border-error/15"
                            }`}>
                              {member.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              onClick={() => handleRemoveMemberClick(member.id, name)}
                              variant="danger"
                              size="sm"
                              className="text-xs uppercase min-h-0 py-2"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="type-label p-12 text-center">
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
            <h3 className="type-h2 items-center gap-2 flex">
              <Mail className="text-primary" size={20} aria-hidden="true" />
              Pending Invitations
            </h3>

            <div className="rounded-card border-border shadow-sm p-6 space-y-4 bg-surface border">
              {invites.filter(i => i.status === "PENDING").map((invite) => (
                <div key={invite.id} className="border-b pb-4 space-y-2 border-border/60 last:border-0 last:pb-0">
                  <div className="gap-2 flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-text type-ui truncate leading-tight">{invite.invited_email}</p>
                      <p className="text-xs mt-0.5 text-muted">
                        Sent on {new Date(invite.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 uppercase text-xs rounded-full tracking-wider py-0.5 border ${getRoleBadgeClass(invite.role)}`}>
                      {invite.role}
                    </span>
                  </div>
                </div>
              ))}
              {invites.filter(i => i.status === "PENDING").length === 0 && (
                <div className="border-dashed rounded-2xl border-border/80 text-center py-8 type-caption text-muted border">
                  No pending corporate team invitations.
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="justify-center fade-in inset-0 items-center duration-200 animate-in flex backdrop-blur-sm p-6 z-50 bg-black/60 fixed">
          <div className="w-full rounded-card border-border relative duration-200 animate-in max-w-md shadow-2xl zoom-in-95 p-8 bg-surface border">
            <button 
              onClick={() => { setShowInviteModal(false); setInviteEmail(""); setError(null); }}
              className="min-h-[40px] justify-center rounded-xl min-w-[40px] absolute items-center p-2 right-6 flex top-6 text-muted hover:bg-bg hover:text-text"
              aria-label="Close modal"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <div className="space-y-2 mb-6">
              <h3 className="type-h2">Invite Teammate</h3>
              <p className="type-label">Send a secure corporate invite to collaborate in this workspace.</p>
            </div>
            
            <form onSubmit={handleInviteSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="type-badge">Work Email Address</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full outline-none min-h-[48px] border-border rounded-2xl p-3.5 bg-bg type-caption border focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-badge">Access Level (Role)</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full outline-none min-h-[48px] border-border rounded-2xl p-3.5 bg-bg cursor-pointer type-caption border focus:ring-2 focus:ring-primary"
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
                className="relative w-full justify-center min-h-[48px] py-4 rounded-2xl items-center transition-all gap-2 type-ui shadow-primary/10 shadow-lg flex bg-primary cursor-pointer text-white hover:scale-[1.02]"
              >
                <span className="flex items-center gap-2">
                  <Send size={18} aria-hidden="true" />
                  <span>Send Invitation</span>
                </span>
                {isPending && (
                  <span className="absolute right-4 flex items-center">
                    <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <Dialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirm member dissociation"
      >
        <div className="space-y-4">
          <p className="text-text">
            Are you sure you want to remove <strong className="font-semibold text-primary">{deleteTarget?.name}</strong> from your company team? This action is irreversible.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmRemoveMember}
            >
              Remove Teammate
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
