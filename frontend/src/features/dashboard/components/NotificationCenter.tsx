"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  getNotificationsAction, 
  markAllNotificationsReadAction, 
  markNotificationReadAction 
} from "@/features/auth/actions";
import { toast } from "react-hot-toast";

/**
 * Premium glassmorphic Notification Center dropdown.
 * Replaces the static bell icon in the dashboard header.
 */
export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load and sync notifications
  const syncNotifications = async (silent = false) => {
    try {
      const data = await getNotificationsAction();
      if (data && !data.error) {
        setNotifications(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      if (!silent) console.error("Failed to sync notifications:", err);
    }
  };

  // Sync on mount & active poll every 4 seconds for real-time responsiveness
  useEffect(() => {
    syncNotifications(true);

    const interval = setInterval(() => {
      syncNotifications(true);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Handle outside clicks to close the dropdown popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute unread count
  const unreadCount = notifications.filter(n => n.status === "UNREAD").length;

  // Bulk mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      const res = await markAllNotificationsReadAction();
      if (res.error) {
        toast.error(res.error);
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, status: "READ", read_at: new Date().toISOString() })));
        toast.success("All notifications marked as read!");
      }
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  // Mark single notification as read on click
  const handleNotificationClick = async (notification: any) => {
    if (notification.status === "READ") return;
    try {
      const res = await markNotificationReadAction(notification.id);
      if (!res.error) {
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: "READ", read_at: new Date().toISOString() } : n));
      }
    } catch (err) {
      console.error("Failed to mark single notification read:", err);
    }
  };

  // Get dynamic icons based on notification template key
  const getNotificationIcon = (key: string) => {
    const k = key?.toLowerCase() || "";
    if (k.includes("message") || k.includes("chat")) return "chat";
    if (k.includes("interview") || k.includes("schedule")) return "calendar_month";
    if (k.includes("job") || k.includes("match")) return "work";
    if (k.includes("skill") || k.includes("profile")) return "bolt";
    return "notifications";
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-bg text-muted hover:bg-border/20 transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
        aria-label="Toggle notifications"
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        
        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-surface text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center animate-bounce border border-surface">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Popover Container */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header Block */}
          <div className="p-4 border-b border-border/60 bg-bg/20 flex items-center justify-between">
            <h3 className="font-black text-sm text-text flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
              Recent Alerts
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List Pool */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const isUnread = n.status === "UNREAD";
                return (
                  <div 
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 flex gap-3 transition-colors cursor-pointer ${isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-bg/40"}`}
                  >
                    {/* Icon Column */}
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${isUnread ? "bg-primary/10 border-primary/20 text-primary" : "bg-bg border-border/30 text-muted"}`}>
                      <span className="material-symbols-outlined text-lg leading-none">
                        {getNotificationIcon(n.template_key)}
                      </span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-xs ${isUnread ? "font-black text-text" : "font-bold text-muted"}`}>
                          {n.subject || "Alert Notification"}
                        </span>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse"></span>
                        )}
                      </div>
                      
                      <p className={`text-xs leading-relaxed ${isUnread ? "text-text/90 font-medium" : "text-muted font-normal"}`}>
                        {n.body || n.content?.message || "Opportunity listing update."}
                      </p>
                      
                      <span className="text-[10px] text-muted font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.sent_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-border/20 rounded-full text-muted">
                  <span className="material-symbols-outlined text-4xl">notifications_off</span>
                </div>
                <div>
                  <p className="text-text font-black text-sm">All caught up!</p>
                  <p className="text-muted text-xs mt-0.5">You have zero new notifications.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer View Alerts redirect */}
          <div className="p-3 border-t border-border/60 bg-bg/20 text-center">
            <a 
              href="/dashboard/alerts" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-black text-primary hover:underline flex items-center justify-center gap-1 min-h-[36px]"
            >
              Manage Alert Settings
              <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
