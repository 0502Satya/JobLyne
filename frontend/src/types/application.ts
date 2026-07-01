export interface CandidateApplication {
  id: string;
  job: string; // Job ID
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
  location?: string;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_experience?: number | string;
  cover_letter?: string;
  interview_schedule?: string;
}
