"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Users, Search, ShieldCheck, Mail, Phone, 
  MapPin, Eye, FileText, Ban, CheckCircle2, Trash2
} from "lucide-react";
import { 
  getAdminCandidatesAction, 
  getAdminCandidateDetailAction, 
  moderateCandidateAction 
} from "@/features/admin/actions";
import { Dialog, Button } from "@/shared/ui";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Details Overlay
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Action State
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    const res = await getAdminCandidatesAction(search);
    if (res.error) {
      toast.error(res.error);
    } else {
      setCandidates(Array.isArray(res) ? res : (res?.results || []));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleOpenDetail = async (id: string) => {
    setDetailLoading(true);
    const res = await getAdminCandidateDetailAction(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      setSelectedCandidate(res);
      setNotes("");
    }
    setDetailLoading(false);
  };

  const handleModerate = async (action: string) => {
    if (!selectedCandidate) return;
    
    setActionLoading(true);
    const res = await moderateCandidateAction(selectedCandidate.id, action, notes);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Candidate profile ${action === 'delete' ? 'deleted' : action === 'suspend' ? 'suspended' : 'reactivated'} successfully.`);
      setSelectedCandidate(null);
      fetchCandidates();
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">Candidates Directory</h1>
        <p className="text-slate-400 text-xs mt-1">Audit job seeker profiles, verify resume records, and suspend accounts.</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-md">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full max-w-md">
          <input
            type="text"
            placeholder="Search by candidate name, email, phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary placeholder-slate-600"
          />
          <button 
            type="submit" 
            className="h-10 px-4 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1 hover:opacity-90 cursor-pointer"
          >
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      {/* Candidates List Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Phone Contact</th>
                <th className="py-4 px-6">Completeness</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">No candidates registered on this platform.</td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{c.name}</td>
                    <td className="py-4 px-6 font-medium">{c.email}</td>
                    <td className="py-4 px-6 font-mono">{c.phone || "N/A"}</td>
                    <td className="py-4 px-6">{c.profile_completeness || 50}%</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        c.is_active ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/50" : "text-rose-400 bg-rose-950/20 border-rose-900/50"
                      }`}>
                        {c.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleOpenDetail(c.id)}
                        disabled={detailLoading}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-lg text-[10px] font-bold text-white hover:bg-slate-700 hover:text-white flex items-center gap-1.5 inline-flex cursor-pointer transition-colors"
                      >
                        <Eye size={12} /> View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Dialog */}
      {selectedCandidate && (
        <Dialog isOpen={true} onClose={() => setSelectedCandidate(null)} title="Candidate User Profile" size="lg">
          <div className="space-y-6 text-left max-h-[70vh] overflow-y-auto pr-2">
            
            {/* Header section */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white">{selectedCandidate.name}</h3>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mt-0.5">
                  {selectedCandidate.headline || "Software Developer"} • {selectedCandidate.profile_completeness}% Completeness
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                selectedCandidate.is_active ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/50" : "text-rose-400 bg-rose-950/20 border-rose-900/50"
              }`}>
                {selectedCandidate.is_active ? "Active" : "Suspended"}
              </span>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-l-2 border-primary pl-2">Personal Data</h4>
                <div className="space-y-2">
                  <div><span className="text-slate-500">Email Address:</span> <span className="text-white ml-1">{selectedCandidate.email}</span></div>
                  <div><span className="text-slate-500">Phone Number:</span> <span className="text-white ml-1">{selectedCandidate.phone || "N/A"}</span></div>
                  <div><span className="text-slate-500">City / Location:</span> <span className="text-white ml-1">{selectedCandidate.location || "N/A"}</span></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-l-2 border-primary pl-2">Professional details</h4>
                <div className="space-y-2">
                  <div><span className="text-slate-500">Current Company:</span> <span className="text-white ml-1">{selectedCandidate.current_company || "N/A"}</span></div>
                  <div><span className="text-slate-500">Designation:</span> <span className="text-white ml-1">{selectedCandidate.current_designation || "N/A"}</span></div>
                  <div><span className="text-slate-500">Notice Period:</span> <span className="text-white ml-1">{selectedCandidate.notice_period || "N/A"}</span></div>
                </div>
              </div>
            </div>

            {/* Resume slot */}
            <div className="space-y-3 border-t border-slate-800/80 pt-4">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-l-2 border-primary pl-2">Curriculum Vitae</h4>
              <div className="flex justify-between items-center p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/40">
                <span className="text-xs font-bold text-slate-350">Uploaded Resume PDF / Word Document</span>
                {selectedCandidate.resume_file_url ? (
                  <a 
                    href={selectedCandidate.resume_file_url}
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary hover:underline text-[10px] font-extrabold flex items-center gap-1"
                  >
                    <FileText size={12} /> View Document <Eye size={10} />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold">No resume uploaded</span>
                )}
              </div>
            </div>

            {/* Moderation Controls */}
            <div className="border-t border-slate-800/80 pt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Decision audit notes</label>
                <textarea
                  placeholder="Provide notes/reason for suspending or reactivating this account..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary placeholder-slate-700"
                />
              </div>

              <div className="flex justify-between items-center gap-3">
                <div className="flex gap-2">
                  {selectedCandidate.is_active ? (
                    <Button 
                      onClick={() => handleModerate("suspend")}
                      disabled={actionLoading}
                      variant="danger" 
                      className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white flex items-center gap-1"
                    >
                      <Ban size={14} /> Suspend User Account
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleModerate("reactivate")}
                      disabled={actionLoading}
                      variant="primary" 
                      className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Reactivate Account
                    </Button>
                  )}
                </div>
                <Button 
                  onClick={() => handleModerate("delete")}
                  disabled={actionLoading}
                  variant="danger" 
                  className="px-4 py-2 text-xs font-bold border border-red-950 text-red-500 hover:bg-red-950/20 bg-transparent flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Delete Profile Permanent
                </Button>
              </div>
            </div>

            {/* Audit Logs */}
            {selectedCandidate.logs && selectedCandidate.logs.length > 0 && (
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Decision Logs for Candidate</h4>
                <div className="space-y-2">
                  {selectedCandidate.logs.map((log: any, i: number) => (
                    <div key={i} className="text-[10px] text-slate-400 flex justify-between p-2 bg-slate-950/20 rounded border border-slate-850">
                      <span><strong>{log.actor}</strong>: {log.action} ({log.reason})</span>
                      <span className="font-mono text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </Dialog>
      )}

    </div>
  );
}
