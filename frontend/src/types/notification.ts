export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type?: string;
}

export interface SavedSearchAlert {
  id: string;
  name: string;
  keywords?: string;
  location?: string;
  is_enabled: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
}
