export interface CandidateApplication {
  id: string;
  job: string; // Job ID
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
  location?: string;
}
