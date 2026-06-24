"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  getNotificationsAction, 
  markAllNotificationsReadAction, 
  markNotificationReadAction 
} from "@/features/auth/actions";
import { toast } from "react-hot-toast";
import { Bell, BellRing, BellOff, Clock, ChevronRight } from "lucide-react";
import Icon from "@/shared/ui/Icon";

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

  // Sync on mount & active poll using Page Visibility API and dynamic timing
  useEffect(() => {
    syncNotifications(true);

    let interval: NodeJS.Timeout;

    const startPolling = () => {
      if (document.hidden) return;
      const ms = isOpen ? 10000 : 30000; // 10s if open, 30s if closed
      interval = setInterval(() => {
        syncNotifications(true);
      }, ms);
    };

    const handleVisibilityChange = () => {
      clearInterval(interval);
      if (!document.hidden) {
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isOpen]);

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
        className="justify-center h-10 w-10 cursor-pointer relative min-h-[44px] overflow-hidden items-center bg-bg rounded-full transition-colors flex min-w-[44px] text-muted hover:bg-border/20"
        aria-label="Toggle notifications"
      >
        <Bell size={20} aria-hidden="true" />
        
        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="justify-center border-surface right-1.5 absolute top-1.5 text-xs min-w-[16px] items-center rounded-full h-4 flex bg-error text-white px-1 border">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Popover Container */}
      {isOpen && (
        <div className="slide-in-from-top-2 mt-2.5 w-80 fade-in border-border rounded-2xl absolute overflow-hidden duration-200 animate-in shadow-2xl z-50 right-0 bg-surface border sm:w-96">
          
          {/* Header Block */}
          <div className="bg-bg/20 border-b items-center border-border/60 flex p-4 justify-between">
            <h3 className="text-text items-center gap-2 type-ui flex">
              <BellRing size={20} className="text-primary" aria-hidden="true" />
              Recent Alerts
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-primary type-caption hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List Pool */}
          <div className="overflow-y-auto divide-border/40 divide-y max-h-80">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const isUnread = n.status === "UNREAD";
                return (
                  <div 
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`cursor-pointer gap-3 transition-colors flex p-4 ${isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-bg/40"}`}
                  >
                    {/* Icon Column */}
                    <div className={`justify-center w-9 shrink-0 items-center flex h-9 rounded-xl border ${isUnread ? "text-primary border-primary/20 bg-primary/10" : "bg-bg text-muted border-border/30"}`}>
                      <Icon name={getNotificationIcon(n.template_key)} size={18} aria-hidden="true" />
                    </div>

                    {/* Content Column */}
                    <div className="flex gap-0.5 flex-1 flex-col">
                      <div className="gap-2 flex items-start justify-between">
                        <span className={`text-xs ${isUnread ? "text-text" : "text-muted"}`}>
                          {n.subject || "Alert Notification"}
                        </span>
                        {isUnread && (
                          <span className="h-2 shrink-0 animate-pulse w-2 rounded-full bg-primary mt-1.5"></span>
                        )}
                      </div>
                      
                      <p className={`leading-relaxed text-xs ${isUnread ? "text-text/90" : "text-muted"}`}>
                        {n.body || n.content?.message || "Opportunity listing update."}
                      </p>
                      
                      <span className="gap-1 text-xs items-center flex mt-1 text-muted">
                        <Clock size={12} aria-hidden="true" />
                        {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.sent_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="justify-center py-12 items-center text-center gap-3 flex flex-col">
                <div className="bg-border/20 p-3 text-muted rounded-full">
                  <BellOff size={36} className="text-muted" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-text type-ui">All caught up!</p>
                  <p className="text-xs text-muted mt-0.5">You have zero new notifications.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer View Alerts redirect */}
          <div className="border-t bg-bg/20 p-3 border-border/60 text-center">
            <a 
              href="/dashboard/alerts" 
              onClick={() => setIsOpen(false)}
              className="justify-center text-primary type-badge gap-1 items-center min-h-[36px] flex hover:underline"
            >
              Manage Alert Settings
              <ChevronRight size={16} className="leading-none" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
