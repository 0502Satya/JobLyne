export interface WorkExperience {
  id?: string | number;
  title?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  description?: string;
  employment_type?: string;
  location?: string;
  technologies?: string[] | string;
  achievements?: string;
}

export interface Education {
  id?: string | number;
  degree?: string;
  school?: string;
  field?: string;
  start_year?: number | string;
  end_year?: number | string;
  grade?: string;
  description?: string;
  certifications?: string;
}

export interface Project {
  id?: string | number;
  title?: string;
  description?: string;
  tech_stack?: string[] | string;
  project_url?: string;
  github_url?: string;
  team_size?: number | string;
  role?: string;
  duration?: string;
}

export interface Certification {
  id?: string | number;
  name?: string;
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface PrivacySettings {
  public_profile?: boolean;
  visible_to_recruiters_only?: boolean;
  hide_current_company?: boolean;
  anonymous_applications?: boolean;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface Profile {
  id?: string;
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  location?: string;
  city?: string;
  country?: string;
  hometown?: string;
  pincode?: string;
  headline?: string;
  bio?: string;
  summary?: string;
  experience_years?: number | string;
  notice_period?: string;
  expected_salary?: number | string;
  current_salary?: number | string;
  currency?: string;
  resume_file_url?: string;
  gender?: string;
  date_of_birth?: string;
  marital_status?: string;
  current_company?: string;
  current_designation?: string;
  industry?: string;
  functional_area?: string;
  work_mode?: string[] | string;
  preferred_locations?: string[] | string;
  is_open_to_opportunities?: boolean;
  desired_titles?: string;
  social_links?: Record<string, string>;
  experience?: WorkExperience[];
  education?: Education[];
  projects?: Project[];
  certifications?: Certification[];
  skills?: string[];
  languages?: Language[];
  completeness?: number;
  profile_photo_url?: string;
  member_since?: string;
  nationality?: string;
  preferred_company_size?: string;
  open_to_relocation?: boolean;
  open_to_international?: boolean;
  privacy_settings?: PrivacySettings;
}
