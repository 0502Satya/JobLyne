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
  work_mode?: string[];
  preferred_locations?: string[];
  employment_type?: string;
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

export interface DashboardStats {
  applications: number;
  saved_jobs?: number;
  alerts?: number;
  messages?: number;
  pending_applications: number;
  profile_views: number;
  profile_views_change: number;
  interviews: number;
  next_interview_time: string | null;
}

export function mapProfile(dto: any): Profile {
  if (!dto) return {};
  
  return {
    id: dto.id ?? "",
    full_name: dto.full_name ?? "",
    first_name: dto.first_name ?? "",
    middle_name: dto.middle_name ?? "",
    last_name: dto.last_name ?? "",
    username: dto.username ?? "",
    email: dto.email ?? "",
    phone: dto.phone ?? "",
    whatsapp_number: dto.whatsapp_number ?? "",
    location: dto.location ?? "",
    city: dto.city ?? "",
    country: dto.country ?? "",
    hometown: dto.hometown ?? "",
    pincode: dto.pincode ?? "",
    headline: dto.headline ?? "",
    bio: dto.bio ?? "",
    summary: dto.summary ?? "",
    experience_years: dto.experience_years ?? 0,
    notice_period: dto.notice_period ?? "",
    expected_salary: dto.expected_salary ?? "",
    current_salary: dto.current_salary ?? "",
    currency: dto.currency ?? "",
    resume_file_url: dto.resume_file_url ?? "",
    gender: dto.gender ?? "",
    date_of_birth: dto.date_of_birth ?? "",
    marital_status: dto.marital_status ?? "",
    current_company: dto.current_company ?? "",
    current_designation: dto.current_designation ?? "",
    industry: dto.industry ?? "",
    functional_area: dto.functional_area ?? "",
    work_mode: Array.isArray(dto.work_mode) ? dto.work_mode : (typeof dto.work_mode === "string" ? [dto.work_mode] : []),
    preferred_locations: Array.isArray(dto.preferred_locations) ? dto.preferred_locations : (typeof dto.preferred_locations === "string" ? [dto.preferred_locations] : []),
    employment_type: dto.employment_type ?? "",
    is_open_to_opportunities: Boolean(dto.is_open_to_opportunities),
    desired_titles: dto.desired_titles ?? "",
    social_links: dto.social_links ?? {},
    experience: Array.isArray(dto.experience) ? dto.experience : [],
    education: Array.isArray(dto.education) ? dto.education : [],
    projects: Array.isArray(dto.projects) ? dto.projects : [],
    certifications: Array.isArray(dto.certifications) ? dto.certifications : [],
    skills: Array.isArray(dto.skills) ? dto.skills : [],
    languages: Array.isArray(dto.languages) ? dto.languages : [],
    completeness: Number(dto.completeness ?? 0),
    profile_photo_url: dto.profile_photo_url ?? "",
    member_since: dto.member_since ?? "",
    nationality: dto.nationality ?? "",
    preferred_company_size: dto.preferred_company_size ?? "",
    open_to_relocation: Boolean(dto.open_to_relocation),
    open_to_international: Boolean(dto.open_to_international),
    privacy_settings: dto.privacy_settings ?? {},
  };
}
