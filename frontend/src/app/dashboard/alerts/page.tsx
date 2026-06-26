"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPreferencesAction,
  updatePreferencesAction,
  getSavedSearchesAction,
  createSavedSearchAction,
  deleteSavedSearchAction,
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction
} from "@/features/auth/actions";
import { toast } from "react-hot-toast";
import {
  Input,
  Button,
  Tabs,
  Toggle,
  Card,
  Text,
  LoadingState,
  Icon,
  Dialog,
  Breadcrumbs
} from "@/shared/ui";
import {
  BellRing,
  PlusCircle,
  Search,
  MapPin,
  Rocket,
  BellOff,
  Trash2,
  Clock,
  Check
} from "lucide-react";

export default function JobAlertsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Alert creation modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertName, setAlertName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);
  const [creating, setCreating] = useState(false);

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

      const notificationsRes = await getNotificationsAction();
      if (notificationsRes && !notificationsRes.error) {
        setNotifications(Array.isArray(notificationsRes) ? notificationsRes : (notificationsRes.results || []));
      }
    } catch (err) {
      console.error("Failed to load alerts page details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  const handleTogglePref = async (key: string, currentValue: boolean) => {
    if (!preferences) return;
    const originalPref = { ...preferences };
    const updatedPref = { ...preferences, [key]: !currentValue };
    setPreferences(updatedPref);

    try {
      const res = await updatePreferencesAction({ [key]: !currentValue });
      if (res.error) {
        toast.error(res.error);
        setPreferences(originalPref);
      } else {
        toast.success("Preferences updated successfully!");
      }
    } catch (err) {
      toast.error("Failed to update preferences");
      setPreferences(originalPref);
    }
  };

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
        setAlerts(originalAlerts);
      } else {
        toast.success(!alert.alert_enabled ? "Alert activated!" : "Alert paused");
      }
    } catch (err) {
      toast.error("Failed to toggle alert status");
      setAlerts(originalAlerts);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    const alertToRestore = alerts.find(a => a.id === alertId);
    if (!alertToRestore) return;

    // 1. Optimistically remove from UI immediately
    setAlerts(prev => prev.filter(a => a.id !== alertId));

    let undone = false;

    // 2. Show undo toast (5-second window)
    toast.custom(
      (t) => (
        <div
          role="status"
          aria-live="polite"
          className={`${
            t.visible ? "animate-in fade-in" : "animate-out fade-out"
          } max-w-sm w-full bg-card border border-border/80 shadow-lg rounded-xl pointer-events-auto flex items-center justify-between p-4 gap-4`}
        >
          <div className="flex items-center gap-2">
            <span className="text-success">✓</span>
            <span className="text-sm text-text">Job alert unsubscribed</span>
          </div>
          <button
            onClick={() => {
              undone = true;
              toast.dismiss(t.id);
              // Restore optimistically
              setAlerts(prev => {
                if (prev.some(a => a.id === alertId)) return prev;
                return [...prev, alertToRestore];
              });
            }}
            className="text-primary hover:text-primary/80 text-sm font-semibold whitespace-nowrap focus:outline-none"
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000 }
    );

    // 3. After toast dismisses, commit the server action
    setTimeout(async () => {
      if (!undone) {
        try {
          const res = await deleteSavedSearchAction(alertId);
          if (res.error) {
            toast.error(res.error);
            setAlerts(prev => {
              if (prev.some(a => a.id === alertId)) return prev;
              return [...prev, alertToRestore];
            });
          }
        } catch (err) {
          toast.error("Failed to delete alert");
          setAlerts(prev => {
            if (prev.some(a => a.id === alertId)) return prev;
            return [...prev, alertToRestore];
          });
        }
      }
    }, 5000);
  };

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

  const handleRunSearch = (alert: any) => {
    const criteria = alert.search_criteria || {};
    const query = criteria.query || "";
    const loc = criteria.location || "";
    
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (loc) params.append("location", loc);
    params.append("sort", "match");

    router.push(`/jobs?${params.toString()}`);
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllNotificationsReadAction();
      if (res.error) {
        toast.error(res.error);
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, status: "READ", read_at: new Date().toISOString() })));
        toast.success("All alerts marked as read!");
      }
    } catch (err) {
      toast.error("Failed to update alerts");
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      const res = await markNotificationReadAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "READ", read_at: new Date().toISOString() } : n));
        toast.success("Alert marked as read");
      }
    } catch (err) {
      toast.error("Failed to update alert");
    }
  };

  const getNotificationIcon = (key: string) => {
    const k = key?.toLowerCase() || "";
    if (k.includes("message") || k.includes("chat")) return "chat";
    if (k.includes("interview") || k.includes("schedule")) return "calendar_month";
    if (k.includes("job") || k.includes("match")) return "work";
    if (k.includes("skill") || k.includes("profile")) return "bolt";
    return "notifications";
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center w-full">
        <LoadingState variant="list" rows={4} />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.status === "UNREAD").length;

  const tabItems = [
    {
      id: "inbox",
      label: `Inbox Alerts (${unreadCount})`,
      icon: "notifications",
      content: (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Text variant="h3" className="text-text mb-1">Alert Inbox</Text>
                <Text variant="body-sm" color="muted">View persistent notifications and historical match listings.</Text>
              </div>
              {unreadCount > 0 && (
                <Button variant="secondary" onClick={handleMarkAllRead}>
                  Mark all as read
                </Button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="divide-y divide-border/40">
                {notifications.map((n) => {
                  const isUnread = n.status === "UNREAD";
                  return (
                    <div
                      key={n.id}
                      className={`py-4 flex gap-4 items-start ${isUnread ? "bg-primary/5 rounded-xl px-4" : ""}`}
                    >
                      <div className={`justify-center w-10 shrink-0 items-center flex h-10 rounded-xl border ${isUnread ? "text-primary border-primary/20 bg-primary/10" : "bg-bg text-muted border-border/30"}`}>
                        <Icon name={getNotificationIcon(n.template_key)} size={20} aria-hidden="true" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Text variant="body" weight={isUnread ? "semibold" : "regular"} className="text-text">
                            {n.subject || "Alert Notification"}
                          </Text>
                          {isUnread && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkSingleRead(n.id)}
                              leftIcon={<Check size={14} />}
                            >
                              Mark read
                            </Button>
                          )}
                        </div>
                        <Text variant="body-sm" color={isUnread ? "default" : "muted"} className="mt-1 block">
                          {n.body || n.content?.message || "Opportunity listing update."}
                        </Text>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                          <Clock size={12} />
                          <span>
                            {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.sent_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="justify-center py-20 text-center gap-4 flex flex-col items-center">
                <div className="bg-border/20 p-4 text-muted rounded-full">
                  <BellOff size={48} />
                </div>
                <div>
                  <Text variant="body" className="text-text">All caught up!</Text>
                  <Text variant="body-sm" color="muted">You have zero unread alerts or notifications.</Text>
                </div>
              </div>
            )}
          </div>
        </Card>
      )
    },
    {
      id: "subscriptions",
      label: "Job Subscriptions",
      icon: "rss_feed",
      content: (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Text variant="h3" className="text-text mb-1">Active Subscriptions</Text>
                <Text variant="body-sm" color="muted">Manage your saved search keywords and matching filters.</Text>
              </div>
              <Button onClick={() => setIsModalOpen(true)} leftIcon={<PlusCircle size={16} />}>
                Create Job Alert
              </Button>
            </div>

            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const criteria = alert.search_criteria || {};
                  return (
                    <div 
                      key={alert.id}
                      className="border border-border/60 bg-bg/20 flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl gap-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Text variant="body" weight="semibold" className="text-text">
                            {alert.search_type || "Untitled Alert"}
                          </Text>
                          {!alert.alert_enabled && (
                            <span className="px-2 py-0.5 bg-border/40 text-[10px] font-semibold text-muted rounded uppercase tracking-wider">Paused</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {criteria.query && (
                            <span className="inline-flex items-center gap-1 bg-bg px-2.5 py-0.5 rounded text-xs text-muted border border-border/30">
                              <Search size={12} />
                              &ldquo;{criteria.query}&rdquo;
                            </span>
                          )}
                          {criteria.location && (
                            <span className="inline-flex items-center gap-1 bg-bg px-2.5 py-0.5 rounded text-xs text-muted border border-border/30">
                              <MapPin size={12} />
                              {criteria.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunSearch(alert)}
                          leftIcon={<Rocket size={14} />}
                        >
                          Run Search
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleAlertActive(alert)}
                          aria-label={alert.alert_enabled ? "Pause alert" : "Activate alert"}
                        >
                          {alert.alert_enabled ? <BellOff size={16} /> : <BellRing size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                          aria-label="Delete alert"
                          className="text-error hover:bg-error-bg hover:text-error"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="justify-center py-20 text-center gap-4 flex flex-col items-center">
                <div className="bg-border/20 p-4 text-muted rounded-full">
                  <BellOff size={48} />
                </div>
                <div>
                  <Text variant="body" className="text-text">No active job alerts</Text>
                  <Text variant="body-sm" color="muted">Subscribe to job alerts to get notified of matching listings automatically.</Text>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="mt-2">
                  Create your first alert
                </Button>
              </div>
            )}
          </div>
        </Card>
      )
    },
    {
      id: "channels",
      label: "Channels",
      icon: "settings",
      content: (
        <Card className="p-6">
          <div className="space-y-6 max-w-lg">
            <div>
              <Text variant="h3" className="text-text mb-1">Delivery Settings</Text>
              <Text variant="body-sm" color="muted">Choose channels to deliver match listings and system reminders.</Text>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
                <div className="space-y-0.5">
                  <Text variant="body-sm" weight="semibold" className="text-text">Email Alerts</Text>
                  <Text variant="caption" color="muted">Receive job matches in your email inbox.</Text>
                </div>
                <Toggle
                  checked={!!preferences?.email_enabled}
                  onChange={() => handleTogglePref("email_enabled", !!preferences?.email_enabled)}
                  aria-label="Toggle Email Alerts"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
                <div className="space-y-0.5">
                  <Text variant="body-sm" weight="semibold" className="text-text">Push Notifications</Text>
                  <Text variant="caption" color="muted">Show real-time alerts in browser popups.</Text>
                </div>
                <Toggle
                  checked={!!preferences?.push_enabled}
                  onChange={() => handleTogglePref("push_enabled", !!preferences?.push_enabled)}
                  aria-label="Toggle Push Notifications"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg/40">
                <div className="space-y-0.5">
                  <Text variant="body-sm" weight="semibold" className="text-text">SMS Text Alerts</Text>
                  <Text variant="caption" color="muted">Receive mobile reminders directly to your phone.</Text>
                </div>
                <Toggle
                  checked={!!preferences?.sms_enabled}
                  onChange={() => handleTogglePref("sms_enabled", !!preferences?.sms_enabled)}
                  aria-label="Toggle SMS Alerts"
                />
              </div>
            </div>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Job Alerts" },
        ]}
      />
      <div>
        <Text variant="h1" className="text-text mb-1">Job Alerts Manager</Text>
        <Text variant="body" color="muted">Configure real-time matching alerts, custom search deliveries, and notifications inbox.</Text>
      </div>

      <Tabs items={tabItems} variant="underline" />

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Job Alert"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" form="create-alert-form" isLoading={creating} className="flex-1">Save and subscribe</Button>
          </div>
        }
      >
        <form id="create-alert-form" onSubmit={handleCreateAlert} className="gap-4 flex flex-col pt-2">
          <Input 
            label="Alert Subtitle Name"
            id="alertName"
            value={alertName}
            onChange={(e) => setAlertName(e.target.value)}
            placeholder="e.g. Senior React Developer Alert" 
            required
          />

          <Input 
            label="Target Keywords"
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="React, Django, Senior..." 
          />

          <Input 
            label="Desired City / Region"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote, Austin" 
          />

          <div className="border border-border/40 bg-bg/20 mt-2 p-4 rounded-xl">
            <Toggle 
              checked={isAlertEnabled}
              onChange={(checked) => setIsAlertEnabled(checked)}
              label="Alert Deliveries Enabled"
              helper="Toggle to instantly receive notifications."
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
