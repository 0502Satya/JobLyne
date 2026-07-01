"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Users, UserPlus, Key, Mail, ShieldCheck, 
  Lock, Clock, UserCheck
} from "lucide-react";
import { getAdminListAction, createAdminAction } from "@/features/admin/actions";
import { Button } from "@/shared/ui";

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invite state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("support_admin");
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const res = await getAdminListAction();
    if (res.error) {
      toast.error(res.error);
    } else {
      setAdmins(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in email and password.");
      return;
    }

    setInviteLoading(true);
    const res = await createAdminAction({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role: role
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Teammate administrator invited successfully.");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      fetchAdmins();
    }
    setInviteLoading(false);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">Admin Teammates</h1>
        <p className="text-slate-400 text-xs mt-1">Manage JobLyne internal personnel, assign permissions, and check active sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Invite Admin Form */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800/60 pb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-primary" /> Create Administrator
          </h3>
          
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="teammate@joblyne.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary placeholder-slate-700"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Login Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary placeholder-slate-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary placeholder-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary placeholder-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Administrative Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-primary"
              >
                <option value="verification_officer">Verification Officer</option>
                <option value="support_admin">Support Admin</option>
                <option value="content_moderator">Content Moderator</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={inviteLoading}
                variant="primary"
                className="w-full h-10 text-xs font-bold bg-primary text-white hover:opacity-95 cursor-pointer flex justify-center items-center gap-1.5"
              >
                Invite Admin Personnel
              </Button>
            </div>
          </form>
        </div>

        {/* Admins Personnel Directory */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Contact</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 font-semibold">No admin teammate records found.</td>
                  </tr>
                ) : (
                  admins.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                        <UserCheck size={14} className="text-primary" /> {a.name}
                      </td>
                      <td className="py-4 px-6">{a.email}</td>
                      <td className="py-4 px-6 font-semibold uppercase text-slate-400 tracking-wider text-[10px]">{a.role.replace("_", " ")}</td>
                      <td className="py-4 px-6 text-slate-500 font-mono text-[10px]">
                        {a.last_login ? new Date(a.last_login).toLocaleDateString() : "Never"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
