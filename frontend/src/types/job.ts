export interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo?: string;
  location: string;
  is_saved?: boolean;
  has_applied?: boolean;
  skills?: string[];
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  created_at: string;
  posted_at?: string;
  match_score?: number;
}
