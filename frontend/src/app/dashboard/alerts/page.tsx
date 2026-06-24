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
import { 
  BellRing, 
  PlusCircle, 
  Settings, 
  Mail, 
  Bell, 
  MessageSquare, 
  Search, 
  MapPin, 
  Rocket, 
  BellOff, 
  Trash2 
} from "lucide-react";

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

    router.push(`/jobs?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="text-text gap-8 animate-pulse flex flex-col">
        <div className="h-40 border-border rounded-2xl bg-surface border"></div>
        <div className="border-border rounded-2xl h-60 bg-surface border"></div>
      </div>
    );
  }

  return (
    <div className="w-full text-text max-w-full box-sizing-border-box gap-8 overflow-hidden flex flex-col">
      {/* Header Block */}
      <div className="gap-4 flex justify-between flex-col md:flex-row md:items-center">
        <div>
          <h2 className="text-text items-center type-h1 gap-2 flex">
            <BellRing className="text-primary" size={30} aria-hidden="true" />
            Job Alerts Manager
          </h2>
          <p className="mt-1 text-muted">Configure real-time matching alerts and custom search deliveries.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="justify-center min-h-[48px] gap-1.5 px-6 items-center transition-all py-3 shadow bg-primary flex type-caption text-white rounded-xl hover:opacity-90"
        >
          <PlusCircle size={18} aria-hidden="true" />
          Create Job Alert
        </button>
      </div>

      <div className="w-full gap-8 items-start grid grid-cols-1 lg:grid-cols-3">
        
        {/* Left Column: Notification Channel Preferences */}
        <div className="lg:col-span-1 rounded-2xl border-border/60 flex-col p-6 flex gap-6 bg-surface border">
          <h3 className="border-border/40 border-b pb-3 text-base items-center gap-2 flex">
            <Settings className="text-primary" size={20} aria-hidden="true" />
            Delivery Channels
          </h3>

          <div className="gap-4 flex flex-col">
            {/* Email Preferences Toggle */}
            <div className="border-border/40 bg-bg/20 items-center flex justify-between p-4 rounded-xl border">
              <div className="flex gap-3 items-center">
                <div className={`justify-center h-10 w-10 items-center flex rounded-xl border ${preferences?.email_enabled ? "text-primary border-primary/20 bg-primary/10" : "bg-bg text-muted border-border/30"}`}>
                  <Mail size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="type-ui">Email Alerts</p>
                  <p className="text-xs mt-0.5 text-muted">Receive matches in inbox.</p>
                </div>
              </div>
              <button 
                onClick={() => handleTogglePref("email_enabled", !!preferences?.email_enabled)}
                className={`w-12 h-6 p-1 rounded-full transition-colors cursor-pointer ${preferences?.email_enabled ? "bg-primary" : "bg-border"}`}
                aria-label="Toggle email alerts"
              >
                <div className={`transition-transform rounded-full shadow h-4 w-4 bg-surface ${preferences?.email_enabled ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>

            {/* Push Notifications Toggle */}
            <div className="border-border/40 bg-bg/20 items-center flex justify-between p-4 rounded-xl border">
              <div className="flex gap-3 items-center">
                <div className={`justify-center h-10 w-10 items-center flex rounded-xl border ${preferences?.push_enabled ? "text-primary border-primary/20 bg-primary/10" : "bg-bg text-muted border-border/30"}`}>
                  <Bell size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="type-ui">Push Alerts</p>
                  <p className="text-xs mt-0.5 text-muted">Real-time browser popups.</p>
                </div>
              </div>
              <button 
                onClick={() => handleTogglePref("push_enabled", !!preferences?.push_enabled)}
                className={`w-12 h-6 p-1 rounded-full transition-colors cursor-pointer ${preferences?.push_enabled ? "bg-primary" : "bg-border"}`}
                aria-label="Toggle push alerts"
              >
                <div className={`transition-transform rounded-full shadow h-4 w-4 bg-surface ${preferences?.push_enabled ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>

            {/* SMS Notifications Toggle */}
            <div className="border-border/40 bg-bg/20 items-center flex justify-between p-4 rounded-xl border">
              <div className="flex gap-3 items-center">
                <div className={`justify-center h-10 w-10 items-center flex rounded-xl border ${preferences?.sms_enabled ? "text-primary border-primary/20 bg-primary/10" : "bg-bg text-muted border-border/30"}`}>
                  <MessageSquare size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="type-ui">SMS Texts</p>
                  <p className="text-xs mt-0.5 text-muted">Alerts sent directly to phone.</p>
                </div>
              </div>
              <button 
                onClick={() => handleTogglePref("sms_enabled", !!preferences?.sms_enabled)}
                className={`w-12 h-6 p-1 rounded-full transition-colors cursor-pointer ${preferences?.sms_enabled ? "bg-primary" : "bg-border"}`}
                aria-label="Toggle SMS alerts"
              >
                <div className={`transition-transform rounded-full shadow h-4 w-4 bg-surface ${preferences?.sms_enabled ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: List of Saved Alerts */}
        <div className="lg:col-span-2 flex gap-6 flex-col">
          <div className="rounded-2xl border-border/60 flex-col p-6 flex gap-6 bg-surface border">
            <h3 className="border-border/40 border-b pb-3 text-base items-center gap-2 flex">
              <BellRing className="text-primary" size={20} aria-hidden="true" />
              Active Subscriptions
            </h3>

            {alerts.length > 0 ? (
              <div className="gap-4 flex flex-col">
                {alerts.map((alert) => {
                  const criteria = alert.search_criteria || {};
                  
                  return (
                    <div 
                      key={alert.id}
                      className="border-border/40 bg-bg/20 gap-4 items-start transition-all flex-col flex justify-between p-5 rounded-xl border hover:border-primary/40 sm:flex-row sm:items-center"
                    >
                      {/* Alert details */}
                      <div className="gap-1 flex flex-col">
                        <div className="gap-2 flex items-center">
                          <h4 className="text-text type-ui">{alert.search_type || "Untitled Alert"}</h4>
                          {!alert.alert_enabled && (
                            <span className="px-2 uppercase text-xs tracking-wider py-0.5 bg-border/40 rounded text-muted">Paused</span>
                          )}
                        </div>
                        <div className="items-center gap-2 flex-wrap flex mt-1.5">
                          {criteria.query && (
                            <span className="gap-1 border-border/30 items-center bg-bg px-2.5 py-0.5 flex type-caption rounded text-muted border">
                              <Search className="leading-none text-muted" size={12} aria-hidden="true" />
                              &ldquo;{criteria.query}&rdquo;
                            </span>
                          )}
                          {criteria.location && (
                            <span className="gap-1 border-border/30 items-center bg-bg px-2.5 py-0.5 flex type-caption rounded text-muted border">
                              <MapPin className="leading-none text-muted" size={12} aria-hidden="true" />
                              {criteria.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="w-full justify-end shrink-0 items-center gap-2 flex sm:w-auto">
                        {/* Run Search */}
                        <button 
                          onClick={() => handleRunSearch(alert)}
                          className="justify-center text-primary type-badge gap-1.5 min-h-[44px] items-center transition-all py-2.5 flex px-4 rounded-xl bg-primary/10 hover:bg-primary hover:text-white"
                        >
                          <Rocket size={14} aria-hidden="true" />
                          Search Feed
                        </button>

                        {/* Toggle Alert Enabled */}
                        <button 
                          onClick={() => handleToggleAlertActive(alert)}
                          className={`w-11 justify-center min-h-[44px] items-center transition-colors h-11 flex min-w-[44px] rounded-xl border ${alert.alert_enabled ? "text-success bg-success-bg border-success/20 hover:bg-success-bg/80" : "bg-bg text-muted border-border/30 hover:text-text"}`}
                          aria-label={alert.alert_enabled ? "Pause alert" : "Activate alert"}
                        >
                          {alert.alert_enabled ? (
                            <Bell size={20} aria-hidden="true" />
                          ) : (
                            <BellOff size={20} aria-hidden="true" />
                          )}
                        </button>

                        {/* Delete Alert */}
                        <button 
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="w-11 justify-center shrink-0 min-w-[44px] min-h-[44px] items-center text-error transition-all bg-error-bg h-11 flex border-error/20 rounded-xl border hover:bg-error hover:text-white hover:border-error"
                          aria-label="Delete alert"
                        >
                          <Trash2 size={20} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="justify-center gap-4 items-center py-20 text-center flex flex-col">
                <div className="bg-border/20 p-4 rounded-full text-muted">
                  <BellOff size={48} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-text text-base">No active job alerts</p>
                  <p className="mt-1 text-xs text-muted max-w-sm">Subscribing to alerts allows our AI-matching engine to notify you instantly when matching jobs appear.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="min-h-[48px] rounded-xl mt-2 py-3 bg-primary type-caption text-white px-5 transition-opacity hover:opacity-90"
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
        <div className="justify-center fade-in inset-0 items-center animate-in bg-card/60 flex backdrop-blur-sm duration-300 z-50 p-4 fixed">
          <div className="inset-0 absolute" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="w-full border-border rounded-3xl relative overflow-hidden duration-200 scale-in flex-col animate-in p-6 max-w-md shadow-2xl flex gap-6 bg-surface border">
            <div className="border-border/40 border-b pb-3 items-center flex justify-between">
              <h3 className="type-card-title items-center gap-2 flex">
                <PlusCircle className="text-primary" size={20} aria-hidden="true" />
                Create Job Alert
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="justify-center items-center bg-bg rounded-full h-8 flex w-8 text-muted hover:text-text hover:bg-border/20"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="gap-4 flex flex-col">
              {/* Alert Name */}
              <div className="flex gap-1.5 flex-col">
                <label className="uppercase tracking-wider type-caption text-muted">Alert Subtitle Name</label>
                <input 
                  type="text" 
                  value={alertName}
                  onChange={(e) => setAlertName(e.target.value)}
                  placeholder="e.g. Senior React Developer Alert" 
                  className="w-full min-h-[44px] px-3 text-sm border-border/60 bg-bg py-2.5 rounded-xl border focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Keywords */}
              <div className="flex gap-1.5 flex-col">
                <label className="uppercase tracking-wider type-caption text-muted">Target Keywords</label>
                <input 
                  type="text" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="React, Django, Senior..." 
                  className="w-full min-h-[44px] px-3 text-sm border-border/60 bg-bg py-2.5 rounded-xl border focus:outline-none focus:border-primary"
                />
              </div>

              {/* Location */}
              <div className="flex gap-1.5 flex-col">
                <label className="uppercase tracking-wider type-caption text-muted">Desired City / Region</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, Austin" 
                  className="w-full min-h-[44px] px-3 text-sm border-border/60 bg-bg py-2.5 rounded-xl border focus:outline-none focus:border-primary"
                />
              </div>

              {/* Alert toggler */}
              <div className="border-border/40 bg-bg/20 mt-2 items-center flex justify-between p-4 rounded-xl border">
                <div>
                  <p className="type-caption">Alert Deliveries Enabled</p>
                  <p className="mt-0.5 text-xs text-muted">Toggle to instantly receive notifications.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAlertEnabled(!isAlertEnabled)}
                  className={`w-12 h-6 p-1 rounded-full transition-colors cursor-pointer ${isAlertEnabled ? "bg-primary" : "bg-border"}`}
                  aria-label="Toggle alert enabled status"
                >
                  <div className={`transition-transform rounded-full shadow h-4 w-4 bg-surface ${isAlertEnabled ? "translate-x-6" : "translate-x-0"}`}></div>
                </button>
              </div>

              <div className="border-border/40 border-t gap-3 flex mt-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 min-h-[48px] py-3.5 border-border/60 type-caption rounded-xl border hover:bg-bg/40"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="relative justify-center type-badge flex-1 min-h-[48px] gap-1.5 py-3.5 items-center shadow bg-primary flex text-white rounded-xl transition-opacity hover:opacity-90"
                >
                  <span>Save and subscribe</span>
                  {creating && (
                    <span className="absolute right-4 flex items-center">
                      <span className="border-2 rounded-full h-4 border-t-transparent w-4 animate-spin border-white"></span>
                    </span>
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
