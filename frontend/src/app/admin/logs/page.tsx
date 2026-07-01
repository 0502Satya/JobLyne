"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ClipboardList, Clock, ShieldAlert, ArrowDown } from "lucide-react";
import { getAdminLogsAction } from "@/features/admin/actions";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const res = await getAdminLogsAction();
      if (res.error) {
        toast.error(res.error);
      } else {
        setLogs(res);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">Audit Trail Logs</h1>
        <p className="text-slate-400 text-xs mt-1">Immutable session action history of administrator and moderation operations.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Personnel actor</th>
                <th className="py-4 px-6">System Action</th>
                <th className="py-4 px-6">Target Segment</th>
                <th className="py-4 px-6">Audit notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-350">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-semibold">No system logs recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-500 text-[10px] flex items-center gap-1.5 shrink-0">
                      <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">{log.actor}</td>
                    <td className="py-4 px-6 font-semibold uppercase text-slate-400 text-[10px] tracking-wider">
                      {log.action.replace("_", " ")}
                    </td>
                    <td className="py-4 px-6 font-medium capitalize text-slate-400">{log.entity}</td>
                    <td className="py-4 px-6 italic text-slate-400 font-medium">{log.notes || "None"}</td>
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
