"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Building2, Search, Filter, ShieldCheck, Mail, 
  Phone, Globe, FileText, CheckCircle2, Ban, Eye, X, ExternalLink
} from "lucide-react";
import { 
  getAdminCompaniesAction, 
  getAdminCompanyDetailAction, 
  moderateCompanyAction 
} from "@/features/admin/actions";
import { Dialog, Button } from "@/shared/ui";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Detail Overlay
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Action state
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    const filters = {
      status: statusFilter === "All" ? "" : statusFilter.toLowerCase(),
      search: search
    };
    const res = await getAdminCompaniesAction(filters);
    if (res.error) {
      toast.error(res.error);
    } else {
      setCompanies(Array.isArray(res) ? res : (res?.results || []));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies();
  };

  const handleOpenDetail = async (id: string) => {
    setDetailLoading(true);
    const res = await getAdminCompanyDetailAction(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      setSelectedCompany(res);
      setNotes("");
    }
    setDetailLoading(false);
  };

  const handleModerate = async (action: string) => {
    if (!selectedCompany) return;
    
    if (action === "reject" && !notes.trim()) {
      toast.error("Rejection reason notes are required.");
      return;
    }

    setActionLoading(true);
    const res = await moderateCompanyAction(selectedCompany.id, action, notes);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Action '${action}' applied successfully.`);
      setSelectedCompany(null);
      fetchCompanies();
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">Employers Directory</h1>
        <p className="text-slate-400 text-xs mt-1">Review registrations, download legal documents, and suspend workspace portals.</p>
      </div>

      {/* Search & Filter Controls bar */}
      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by company name, registration number, email..."
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

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold">Verification Filter:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected Needs Correction</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-6">Company Portal</th>
                <th className="py-4 px-6">Official Email</th>
                <th className="py-4 px-6">Registry No</th>
                <th className="py-4 px-6">Industry</th>
                <th className="py-4 px-6">Verification</th>
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
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">No companies matching search filters found.</td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{c.name}</td>
                    <td className="py-4 px-6 font-medium">{c.official_email || "N/A"}</td>
                    <td className="py-4 px-6 font-mono text-[11px]">{c.registration_number || "N/A"}</td>
                    <td className="py-4 px-6">{c.industry}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        c.verification_status === "verified" ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/50" :
                        c.verification_status === "pending" ? "text-amber-400 bg-amber-950/20 border-amber-900/50" :
                        "text-rose-400 bg-rose-950/20 border-rose-900/50"
                      }`}>
                        {c.verification_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleOpenDetail(c.id)}
                        disabled={detailLoading}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-lg text-[10px] font-bold text-white hover:bg-slate-700 hover:text-white flex items-center gap-1.5 inline-flex cursor-pointer transition-colors"
                      >
                        <Eye size={12} /> View File
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
      {selectedCompany && (
        <Dialog isOpen={true} onClose={() => setSelectedCompany(null)} title="Company Document Profile" size="lg">
          <div className="space-y-6 text-left max-h-[70vh] overflow-y-auto pr-2">
            
            {/* Header section */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white">{selectedCompany.legal_name || selectedCompany.name}</h3>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mt-0.5">
                  {selectedCompany.industry} • {selectedCompany.company_size} Employees
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                selectedCompany.verification_status === "verified" ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/50" :
                selectedCompany.verification_status === "pending" ? "text-amber-400 bg-amber-950/20 border-amber-900/50" :
                "text-rose-400 bg-rose-950/20 border-rose-900/50"
              }`}>
                {selectedCompany.verification_status}
              </span>
            </div>

            {/* Legal Documents Grid */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-l-2 border-primary pl-2">Submitted Corporate Docs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Incorporation Document", url: selectedCompany.incorporation_doc_url },
                  { label: "Tax Registration Copy", url: selectedCompany.tax_doc_url },
                  { label: "Address Proof Record", url: selectedCompany.address_proof_url },
                  { label: "Signatory ID Proof", url: selectedCompany.id_proof_url }
                ].map((doc, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/40">
                    <span className="text-xs font-bold text-slate-300">{doc.label}</span>
                    {doc.url ? (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline text-[10px] font-extrabold flex items-center gap-1"
                      >
                        <FileText size={12} /> View File <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-500 uppercase font-extrabold">Not Uploaded</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Company Legal fields */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-l-2 border-primary pl-2">Registry Details</h4>
                <div className="space-y-2">
                  <div><span className="text-slate-500">Registry ID:</span> <span className="font-mono text-white ml-1">{selectedCompany.registration_number || "N/A"}</span></div>
                  <div><span className="text-slate-500">Tax ID:</span> <span className="font-mono text-white ml-1">{selectedCompany.tax_id || "N/A"}</span></div>
                  <div><span className="text-slate-500">GSTIN / CIN:</span> <span className="font-mono text-white ml-1">{selectedCompany.gstin_number || selectedCompany.cin_number || "N/A"}</span></div>
                  <div><span className="text-slate-500">Established:</span> <span className="text-white ml-1">{selectedCompany.year_established || "N/A"}</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-l-2 border-primary pl-2">Contact Details</h4>
                <div className="space-y-2">
                  <div><span className="text-slate-500">Official Email:</span> <span className="text-white ml-1">{selectedCompany.official_email || "N/A"}</span></div>
                  <div><span className="text-slate-500">Phone Contact:</span> <span className="text-white ml-1">{selectedCompany.phone_number || "N/A"}</span></div>
                  <div><span className="text-slate-500">Authorized:</span> <span className="text-white ml-1">{selectedCompany.authorized_contact_name} ({selectedCompany.authorized_contact_designation || "HR"})</span></div>
                  <div><span className="text-slate-500">Website:</span> {selectedCompany.website ? <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1">{selectedCompany.website}</a> : <span className="text-slate-500 ml-1">N/A</span>}</div>
                </div>
              </div>
            </div>

            {/* Moderation actions box */}
            <div className="border-t border-slate-800/80 pt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Decision Notes / Rejection Reason</label>
                <textarea
                  placeholder="Provide brief notes explaining approvals or rejections..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary placeholder-slate-700"
                />
              </div>
              
              <div className="flex justify-between items-center gap-3">
                <div className="flex gap-2">
                  {selectedCompany.verification_status !== "verified" ? (
                    <Button 
                      onClick={() => handleModerate("approve")}
                      disabled={actionLoading}
                      variant="primary" 
                      className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Approve Workspace
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleModerate("suspend")}
                      disabled={actionLoading}
                      variant="danger" 
                      className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white flex items-center gap-1"
                    >
                      <Ban size={14} /> Suspend Portal
                    </Button>
                  )}
                  {selectedCompany.verification_status !== "rejected" && (
                    <Button 
                      onClick={() => handleModerate("reject")}
                      disabled={actionLoading}
                      variant="secondary" 
                      className="px-4 py-2 text-xs font-bold border-rose-900 text-rose-400 hover:bg-rose-950/20 flex items-center gap-1"
                    >
                      <X size={14} /> Reject with Reason
                    </Button>
                  )}
                </div>
                <Button 
                  onClick={() => handleModerate("delete")}
                  disabled={actionLoading}
                  variant="danger" 
                  className="px-4 py-2 text-xs font-bold border border-red-950 text-red-500 hover:bg-red-950/20 bg-transparent flex items-center gap-1"
                >
                  Delete Account
                </Button>
              </div>
            </div>

            {/* Audit log for this company */}
            {selectedCompany.logs && selectedCompany.logs.length > 0 && (
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Decision Audit Logs</h4>
                <div className="space-y-2">
                  {selectedCompany.logs.map((log: any, i: number) => (
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
