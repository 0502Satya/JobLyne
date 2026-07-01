"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  ShieldAlert, Mail, Clock, CheckCircle2, 
  User, ExternalLink, HelpCircle
} from "lucide-react";
import { 
  getAdminSupportReportsAction, 
  moderateSupportReportAction 
} from "@/features/admin/actions";
import { Button } from "@/shared/ui";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    const res = await getAdminSupportReportsAction();
    if (res.error) {
      toast.error(res.error);
    } else {
      setReports(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId: string, action: "resolve" | "assign") => {
    setActionLoading(true);
    const res = await moderateSupportReportAction(reportId, action);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(action === "resolve" ? "Ticket resolved." : "Ticket assigned to your queue.");
      fetchReports();
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">Support & Reports</h1>
        <p className="text-slate-400 text-xs mt-1">Review candidate complaints, fake company listings, and policy violation tickets.</p>
      </div>

      {/* Reports Listing Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-6">Reporter</th>
                <th className="py-4 px-6">Segment Target</th>
                <th className="py-4 px-6">Complaint Subject</th>
                <th className="py-4 px-6">Assigned To</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-350">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">No complaints filed currently.</td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-500" /> {r.reporter}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border border-slate-800 bg-slate-950 text-slate-400">
                        {r.target_type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-200">{r.subject}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium max-w-sm truncate">{r.description}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-400">{r.assigned_to}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        r.status === "resolved" ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/50" : "text-amber-400 bg-amber-950/20 border-amber-900/50"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 shrink-0">
                      {r.status === "unresolved" && (
                        <>
                          {r.assigned_to === "Unassigned" && (
                            <button 
                              onClick={() => handleAction(r.id, "assign")}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 bg-transparent border border-primary text-primary rounded-lg text-[10px] font-bold hover:bg-primary/5 cursor-pointer inline-flex items-center gap-1 transition-colors"
                            >
                              Claim Ticket
                            </button>
                          )}
                          <button 
                            onClick={() => handleAction(r.id, "resolve")}
                            disabled={actionLoading}
                            className="px-2.5 py-1.5 bg-transparent border border-emerald-900 text-emerald-400 rounded-lg text-[10px] font-bold hover:bg-emerald-950/25 cursor-pointer inline-flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 size={12} /> Resolve Ticket
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
