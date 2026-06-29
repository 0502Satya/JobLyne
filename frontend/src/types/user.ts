import { PrivacySettings } from "./profile";

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  role?: string;
  candidate_profile?: {
    privacy_settings?: PrivacySettings;
  };
}
