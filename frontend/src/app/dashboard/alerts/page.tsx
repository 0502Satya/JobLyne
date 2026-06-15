"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  getPreferencesAction, 
  updatePreferencesAction, 
  getSavedSearchesAction, 
  createSavedSearchAction, 
  deleteSavedSearchAction 
} from "@/features/auth/actions";
import { toast } from "react-hot-toast";

/**
 * Premium Job Alerts & Notification Preferences Manager.
 */
export default function JobAlertsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Alert creation modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertName, setAlertName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);
  const [creating, setCreating] = useState(false);

  // Sync all details
  const syncData = async () => {
    try {
      const prefRes = await getPreferencesAction();
      if (prefRes && !prefRes.error) {
        setPreferences(prefRes);
      }

      const alertsRes = await getSavedSearchesAction();
      if (alertsRes && !alertsRes.error) {
        setAlerts(alertsRes);
      }
    } catch (err) {
      console.error("Failed to load alerts manager details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  // Handle preference toggles
  const handleTogglePref = async (key: string, currentValue: boolean) => {
    if (!preferences) return;
    const originalPref = { ...preferences };
    const updatedPref = { ...preferences, [key]: !currentValue };
    setPreferences(updatedPref);

    try {
      const res = await updatePreferencesAction({ [key]: !currentValue });
      if (res.error) {
        toast.error(res.error);
        setPreferences(originalPref); // Rollback
      } else {
        toast.success("Preferences updated successfully!");
      }
    } catch (err) {
      toast.error("Failed to update preferences");
      setPreferences(originalPref);
    }
  };

  // Toggle active status for saved search alerts
  const handleToggleAlertActive = async (alert: any) => {
    const originalAlerts = [...alerts];
    const updatedAlerts = alerts.map(a => a.id === alert.id ? { ...a, alert_enabled: !alert.alert_enabled } : a);
    setAlerts(updatedAlerts);

    try {
      const res = await createSavedSearchAction({
        ...alert,
        alert_enabled: !alert.alert_enabled
      });
      if (res.error) {
        toast.error(res.error);
        setAlerts(originalAlerts); // Rollback
      } else {
        toast.success(alert.alert_enabled ? "Alert paused" : "Alert activated!");
      }
    } catch (err) {
      toast.error("Failed to toggle alert status");
      setAlerts(originalAlerts);
    }
  };

  // Delete saved search alert
  const handleDeleteAlert = async (alertId: string) => {
    const originalAlerts = [...alerts];
    setAlerts(prev => prev.filter(a => a.id !== alertId));

    try {
      const res = await deleteSavedSearchAction(alertId);
      if (res.error) {
        toast.error(res.error);
        setAlerts(originalAlerts); // Rollback
      } else {
        toast.success("Job alert unsubscribed");
      }
    } catch (err) {
      toast.error("Failed to delete alert");
      setAlerts(originalAlerts);
    }
  };

  // Submit custom job alert
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertName.trim()) {
      toast.error("Please enter a name for your job alert.");
      return;
    }
    setCreating(true);

    const searchCriteria = {
      query: keywords.trim(),
      location: location.trim()
    };

    try {
      const res = await createSavedSearchAction({
        search_type: alertName.trim(),
        search_criteria: searchCriteria,
        alert_enabled: isAlertEnabled
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Job alert created successfully!");
        setAlerts(prev => [res, ...prev]);
        setIsModalOpen(false);
        // Clear inputs
        setAlertName("");
        setKeywords("");
        setLocation("");
        setIsAlertEnabled(true);
      }
    } catch (err) {
      toast.error("Failed to create job alert");
    } finally {
      setCreating(false);
    }
  };

  // Redirect to jobs feed running search terms
  const handleRunSearch = (alert: any) => {
    const criteria = alert.search_criteria || {};
    const query = criteria.query || "";
    const loc = criteria.location || "";
    
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (loc) params.append("location", loc);
    params.append("sort", "match"); // AI sort by default for alerts!

    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-text">
        <div className="h-40 bg-surface rounded-2xl border border-border"></div>
        <div className="h-60 bg-surface rounded-2xl border border-border"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-text w-full max-w-full box-sizing-border-box overflow-hidden">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-text flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">notifications_active</span>
            Job Alerts Manager
          </h2>
          <p className="text-muted font-medium mt-1">Configure real-time matching alerts and custom search deliveries.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-surface font-bold text-xs px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 min-h-[48px] shadow"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Create Job Alert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
        
        {/* Left Column: Notification Channel Preferences */}
        <div className="lg:col-span-1 bg-surface border border-border/60 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="font-black text-base border-b border-border/40 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">settings</span>
            Delivery Channels
          </h3>

          <div className="flex flex-col gap-4">
            {/* Email Preferences Toggle */}
            <div className="flex justify-between items-center bg-bg/20 border border-border/40 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${preferences?.email_enabled ? "bg-primary/10 border-primary/20 text-primary" : "bg-bg border-border/30 text-muted"}`}>
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Email Alerts</p>
                  <p className="text-[10px] text-muted font-semibold mt-0.5">Receive matches in inbox.</p>
                </div>
              </div>
              <button 
                onClick={() => handleTogglePref("email_enabled", !!preferences?.email_enabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${preferences?.email_enabled ? "bg-primary" : "bg-border"}`}
                aria-label="Toggle Email Alerts"
              >
                <div className={`bg-surface w-4 h-4 rounded-full shadow transition-transform ${preferences?.email_enabled ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex justify-between items-center bg-bg/20 border border-border/40 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${preferences?.push_enabled ? "bg-primary/10 border-primary/20 text-primary" : "bg-bg border-border/30 text-muted"}`}>
                  <span className="material-symbols-outlined text-lg">notifications</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Push Alerts</p>
                  <p className="text-[10px] text-muted font-semibold mt-0.5">Real-time browser popups.</p>
                </div>
              </div>
              <button 
                onClick={() => handleTogglePref("push_enabled", !!preferences?.push_enabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${preferences?.push_enabled ? "bg-primary" : "bg-border"}`}
                aria-label="Toggle Push Alerts"
              >
                <div className={`bg-surface w-4 h-4 rounded-full shadow transition-transform ${preferences?.push_enabled ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>

            {/* SMS Notifications Toggle */}
            <div className="flex justify-between items-center bg-bg/20 border border-border/40 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${preferences?.sms_enabled ? "bg-primary/10 border-primary/20 text-primary" : "bg-bg border-border/30 text-muted"}`}>
                  <span className="material-symbols-outlined text-lg">sms</span>
                </div>
                <div>
                  <p className="text-sm font-bold">SMS Texts</p>
                  <p className="text-[10px] text-muted font-semibold mt-0.5">Alerts sent directly to phone.</p>
                </div>
              </div>
              <button 
                onClick={() => handleTogglePref("sms_enabled", !!preferences?.sms_enabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${preferences?.sms_enabled ? "bg-primary" : "bg-border"}`}
                aria-label="Toggle SMS Alerts"
              >
                <div className={`bg-surface w-4 h-4 rounded-full shadow transition-transform ${preferences?.sms_enabled ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: List of Saved Alerts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface border border-border/60 rounded-2xl p-6 flex flex-col gap-6">
            <h3 className="font-black text-base border-b border-border/40 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
              Active Subscriptions
            </h3>

            {alerts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {alerts.map((alert) => {
                  const criteria = alert.search_criteria || {};
                  
                  return (
                    <div 
                      key={alert.id}
                      className="bg-bg/20 border border-border/40 rounded-xl p-5 hover:border-primary/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      {/* Alert details */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-text">{alert.search_type || "Untitled Alert"}</h4>
                          {!alert.alert_enabled && (
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-border/40 text-muted rounded">Paused</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center mt-1.5">
                          {criteria.query && (
                            <span className="px-2.5 py-0.5 rounded bg-bg border border-border/30 text-xs font-bold text-muted flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs leading-none">search</span>
                              &ldquo;{criteria.query}&rdquo;
                            </span>
                          )}
                          {criteria.location && (
                            <span className="px-2.5 py-0.5 rounded bg-bg border border-border/30 text-xs font-bold text-muted flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs leading-none">pin_drop</span>
                              {criteria.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                        {/* Run Search */}
                        <button 
                          onClick={() => handleRunSearch(alert)}
                          className="bg-primary/10 hover:bg-primary text-primary hover:text-surface text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 min-h-[44px]"
                        >
                          <span className="material-symbols-outlined text-sm">rocket_launch</span>
                          Search Feed
                        </button>

                        {/* Toggle Alert Enabled */}
                        <button 
                          onClick={() => handleToggleAlertActive(alert)}
                          className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] ${alert.alert_enabled ? "bg-green-50/20 border-green-200/40 text-green-700 dark:text-green-400 hover:bg-green-100/10" : "bg-bg border-border/30 text-muted hover:text-text"}`}
                          aria-label={alert.alert_enabled ? "Pause alert" : "Activate alert"}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {alert.alert_enabled ? "notifications" : "notifications_paused"}
                          </span>
                        </button>

                        {/* Delete Alert */}
                        <button 
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="w-11 h-11 rounded-xl bg-red-50/10 dark:bg-red-900/10 border border-red-200/30 text-red-500 hover:bg-red-500 hover:text-surface hover:border-red-500 transition-all flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                          aria-label="Delete alert"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-border/20 rounded-full text-muted">
                  <span className="material-symbols-outlined text-5xl">notifications_off</span>
                </div>
                <div>
                  <p className="text-text font-black text-base">No active job alerts</p>
                  <p className="text-muted text-xs mt-1 max-w-sm">Subscribing to alerts allows our AI-matching engine to notify you instantly when matching jobs appear.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 bg-primary text-surface font-bold text-xs px-5 py-3 rounded-xl hover:opacity-90 transition-opacity min-h-[48px]"
                >
                  Create your first alert
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Create Alert Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-2xl flex flex-col gap-6 animate-in scale-in duration-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Create Job Alert
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-bg hover:bg-border/20 text-muted hover:text-text"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="flex flex-col gap-4">
              {/* Alert Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Alert Subtitle Name</label>
                <input 
                  type="text" 
                  value={alertName}
                  onChange={(e) => setAlertName(e.target.value)}
                  placeholder="e.g. Senior React Developer Alert" 
                  className="w-full bg-bg border border-border/60 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:outline-none min-h-[44px]"
                  required
                />
              </div>

              {/* Keywords */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Target Keywords</label>
                <input 
                  type="text" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="React, Django, Senior..." 
                  className="w-full bg-bg border border-border/60 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Desired City / Region</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, Austin" 
                  className="w-full bg-bg border border-border/60 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Alert toggler */}
              <div className="flex justify-between items-center bg-bg/20 border border-border/40 p-4 rounded-xl mt-2">
                <div>
                  <p className="text-xs font-bold">Alert Deliveries Enabled</p>
                  <p className="text-[9px] text-muted font-semibold mt-0.5">Toggle to instantly receive notifications.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAlertEnabled(!isAlertEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${isAlertEnabled ? "bg-primary" : "bg-border"}`}
                  aria-label="Toggle Alert Enabled Status"
                >
                  <div className={`bg-surface w-4 h-4 rounded-full shadow transition-transform ${isAlertEnabled ? "translate-x-6" : "translate-x-0"}`}></div>
                </button>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-border/40">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-border/60 hover:bg-bg/40 font-bold text-xs py-3.5 rounded-xl min-h-[48px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-primary text-surface font-black text-xs py-3.5 rounded-xl hover:opacity-90 transition-opacity min-h-[48px] flex items-center justify-center gap-1.5 shadow"
                >
                  {creating ? (
                    <span className="animate-spin h-4 w-4 border-2 border-surface border-t-transparent rounded-full"></span>
                  ) : (
                    "Save & Subscribe"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
