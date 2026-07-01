import React from "react";
import { redirect } from "next/navigation";
import { getPreferences, getSavedSearches, getNotifications } from "@/services/notifications.server";
import AlertsPageClient from "@/features/dashboard/components/alerts/AlertsPageClient";

export default async function JobAlertsPage() {
  let preferences = null;
  let alerts = [];
  let notifications = [];

  try {
    [preferences, alerts, notifications] = await Promise.all([
      getPreferences(),
      getSavedSearches(),
      getNotifications()
    ]);
  } catch (error) {
    redirect("/auth/signin");
  }

  return (
    <AlertsPageClient
      initialPreferences={preferences}
      initialAlerts={alerts}
      initialNotifications={notifications}
    />
  );
}
