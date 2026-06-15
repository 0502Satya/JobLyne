import re
import uuid

sql = """
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "password" varchar NOT NULL,
  "account_type" varchar,
  "phone" varchar,
  "phone_verified" boolean,
  "two_factor_enabled" boolean,
  "profile_photo_url" text,
  "profile_completeness_score" int,
  "last_login_at" timestamp,
  "last_active" timestamp,
  "failed_login_attempts" int,
  "marketing_consent" boolean,
  "data_processing_consent" boolean,
  "data_export_requested" boolean,
  "is_verified" boolean,
  "is_active" boolean,
  "created_at" timestamp,
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "user_sessions" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "refresh_token" varchar,
  "ip_address" varchar,
  "user_agent" varchar,
  "expires_at" timestamp,
  "created_at" timestamp
);

CREATE TABLE "user_consents" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "consent_type" varchar,
  "granted" boolean,
  "ip_address" varchar,
  "granted_at" timestamp
);

CREATE TABLE "deletion_requests" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "request_reason" text,
  "status" varchar,
  "requested_at" timestamp,
  "processed_at" timestamp
);

CREATE TABLE "admin_roles" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "description" text,
  "created_at" timestamp
);

CREATE TABLE "permissions" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "description" text,
  "created_at" timestamp
);

CREATE TABLE "role_permissions" (
  "id" uuid PRIMARY KEY,
  "role_id" uuid,
  "permission_id" uuid
);

CREATE TABLE "user_roles" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "role_id" uuid
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY,
  "actor_user_id" uuid,
  "target_entity_type" varchar,
  "target_entity_id" uuid,
  "action" varchar,
  "old_values" jsonb,
  "new_values" jsonb,
  "ip_address" varchar,
  "created_at" timestamp
);

CREATE TABLE "job_seekers" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid UNIQUE,
  "full_name" varchar,
  "phone" varchar,
  "location" varchar,
  "video_intro_url" text,
  "headline" varchar,
  "summary" text,
  "experience_years" int,
  "current_salary" decimal,
  "expected_salary" decimal,
  "currency" varchar,
  "resume_file_url" text,
  "resume_parsed_data" jsonb,
  "created_at" timestamp,
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "candidate_education" (
  "id" uuid PRIMARY KEY,
  "job_seeker_id" uuid,
  "degree" varchar,
  "institution" varchar,
  "field_of_study" varchar,
  "start_year" int,
  "end_year" int,
  "grade" varchar,
  "created_at" timestamp
);

CREATE TABLE "candidate_experience" (
  "id" uuid PRIMARY KEY,
  "job_seeker_id" uuid,
  "company_name" varchar,
  "designation" varchar,
  "start_date" date,
  "end_date" date,
  "is_current" boolean,
  "responsibilities" text,
  "created_at" timestamp
);

CREATE TABLE "candidate_certifications" (
  "id" uuid PRIMARY KEY,
  "job_seeker_id" uuid,
  "name" varchar,
  "issuing_organization" varchar,
  "issue_date" date,
  "credential_url" text,
  "created_at" timestamp
);

CREATE TABLE "candidate_projects" (
  "id" uuid PRIMARY KEY,
  "job_seeker_id" uuid,
  "title" varchar,
  "description" text,
  "tech_stack" jsonb,
  "project_url" text,
  "created_at" timestamp
);

CREATE TABLE "candidate_languages" (
  "id" uuid PRIMARY KEY,
  "job_seeker_id" uuid,
  "language" varchar,
  "proficiency_level" varchar
);

CREATE TABLE "candidate_portfolio_links" (
  "id" uuid PRIMARY KEY,
  "job_seeker_id" uuid,
  "platform" varchar,
  "url" text
);

CREATE TABLE "job_seeker_skills" (
  "id" uuid PRIMARY KEY,
  "job_seeker_id" uuid NOT NULL,
  "skill_id" uuid NOT NULL,
  "proficiency_level" varchar,
  "years_of_experience" int,
  "is_primary" boolean DEFAULT false,
  "created_at" timestamp
);

CREATE TABLE "saved_jobs" (
  "id" uuid PRIMARY KEY,
  "job_seeker_id" uuid,
  "job_id" uuid,
  "saved_at" timestamp
);

CREATE TABLE "job_alerts" (
  "id" uuid PRIMARY KEY,
  "job_seeker_id" uuid,
  "keywords" varchar,
  "location" varchar,
  "experience_min" int,
  "frequency" varchar,
  "last_triggered" timestamp
);

CREATE TABLE "jobs" (
  "id" uuid PRIMARY KEY,
  "company_id" uuid,
  "recruiter_id" uuid,
  "title" varchar,
  "description" text,
  "requirements" text,
  "location" varchar,
  "location_id" uuid,
  "job_category_id" uuid,
  "industry_id" uuid,
  "employment_type" varchar,
  "experience_required" int,
  "salary_min" decimal,
  "salary_max" decimal,
  "currency" varchar,
  "status" varchar,
  "is_featured" boolean DEFAULT false,
  "boost_score" int DEFAULT 0,
  "posted_at" timestamp,
  "expires_at" timestamp,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "job_skills" (
  "id" uuid PRIMARY KEY,
  "job_id" uuid NOT NULL,
  "skill_id" uuid NOT NULL,
  "is_required" boolean DEFAULT true,
  "created_at" timestamp
);

CREATE TABLE "job_status_history" (
  "id" uuid PRIMARY KEY,
  "job_id" uuid NOT NULL,
  "previous_status" varchar,
  "new_status" varchar NOT NULL,
  "changed_by_user_id" uuid,
  "reason" text,
  "changed_at" timestamp NOT NULL
);

CREATE TABLE "applications" (
  "id" uuid PRIMARY KEY,
  "job_id" uuid,
  "job_seeker_id" uuid,
  "status" varchar,
  "cover_letter" text,
  "interview_schedule" timestamp,
  "offer_details" jsonb,
  "rejection_reason" text,
  "applied_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "application_status_history" (
  "id" uuid PRIMARY KEY,
  "application_id" uuid NOT NULL,
  "previous_status" varchar,
  "new_status" varchar NOT NULL,
  "changed_by_user_id" uuid,
  "reason" text,
  "changed_at" timestamp NOT NULL
);

CREATE TABLE "application_notes" (
  "id" uuid PRIMARY KEY,
  "application_id" uuid,
  "recruiter_user_id" uuid,
  "note" text,
  "created_at" timestamp
);

CREATE TABLE "companies" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "description" text,
  "website" varchar,
  "logo_url" text,
  "cover_image_url" text,
  "industry" varchar,
  "culture" text,
  "benefits" text,
  "city" varchar,
  "country" varchar,
  "verified_badge" boolean,
  "created_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "company_reviews" (
  "id" uuid PRIMARY KEY,
  "company_id" uuid,
  "job_seeker_id" uuid,
  "rating" int,
  "review_text" text,
  "created_at" timestamp
);

CREATE TABLE "company_team_invitations" (
  "id" uuid PRIMARY KEY,
  "company_id" uuid,
  "invited_email" varchar,
  "role" varchar,
  "status" varchar,
  "invited_at" timestamp
);

CREATE TABLE "recruiters" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "agency_name" varchar,
  "subscription_plan_id" uuid,
  "created_at" timestamp
);

CREATE TABLE "recruiter_saved_searches" (
  "id" uuid PRIMARY KEY,
  "recruiter_id" uuid,
  "search_criteria" jsonb,
  "alert_enabled" boolean,
  "created_at" timestamp
);

CREATE TABLE "recruiter_pipelines" (
  "id" uuid PRIMARY KEY,
  "recruiter_id" uuid,
  "name" varchar,
  "created_at" timestamp
);

CREATE TABLE "pipeline_stages" (
  "id" uuid PRIMARY KEY,
  "pipeline_id" uuid,
  "stage_name" varchar,
  "order_index" int
);

CREATE TABLE "candidate_shortlists" (
  "id" uuid PRIMARY KEY,
  "recruiter_id" uuid,
  "job_seeker_id" uuid,
  "job_id" uuid,
  "created_at" timestamp
);

CREATE TABLE "trainers" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "bio" text,
  "expertise" jsonb,
  "approval_status" varchar,
  "rejection_reason" text,
  "created_at" timestamp
);

CREATE TABLE "trainer_kyc_documents" (
  "id" uuid PRIMARY KEY,
  "trainer_id" uuid,
  "document_type" varchar,
  "file_url" text,
  "verification_status" varchar,
  "uploaded_at" timestamp
);

CREATE TABLE "trainer_bank_details" (
  "id" uuid PRIMARY KEY,
  "trainer_id" uuid,
  "account_holder_name" varchar,
  "bank_name" varchar,
  "account_number" varchar,
  "ifsc_code" varchar,
  "tax_id" varchar,
  "created_at" timestamp
);

CREATE TABLE "institutes" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "name" varchar,
  "description" text,
  "accreditation_number" varchar,
  "documents" jsonb,
  "verification_status" varchar,
  "verified_badge" boolean,
  "created_at" timestamp
);

CREATE TABLE "courses" (
  "id" uuid PRIMARY KEY,
  "trainer_id" uuid,
  "institute_id" uuid,
  "title" varchar,
  "description" text,
  "price" decimal,
  "currency" varchar,
  "is_free" boolean,
  "language" varchar,
  "certificate_available" boolean,
  "approval_status" varchar,
  "preview_video_url" text,
  "learning_outcomes" text,
  "prerequisites" text,
  "created_at" timestamp
);

CREATE TABLE "course_skills" (
  "id" uuid PRIMARY KEY,
  "course_id" uuid NOT NULL,
  "skill_id" uuid NOT NULL,
  "skill_level" varchar,
  "created_at" timestamp
);

CREATE TABLE "course_sections" (
  "id" uuid PRIMARY KEY,
  "course_id" uuid,
  "title" varchar,
  "order_index" int
);

CREATE TABLE "lectures" (
  "id" uuid PRIMARY KEY,
  "section_id" uuid,
  "title" varchar,
  "lecture_type" varchar,
  "content_url" text,
  "duration_minutes" int,
  "created_at" timestamp
);

CREATE TABLE "quiz_questions" (
  "id" uuid PRIMARY KEY,
  "lecture_id" uuid,
  "question_text" text,
  "question_type" varchar,
  "passing_score" int,
  "created_at" timestamp
);

CREATE TABLE "quiz_options" (
  "id" uuid PRIMARY KEY,
  "question_id" uuid,
  "option_text" text,
  "is_correct" boolean
);

CREATE TABLE "quiz_attempts" (
  "id" uuid PRIMARY KEY,
  "question_id" uuid,
  "job_seeker_id" uuid,
  "enrollment_id" uuid,
  "selected_option_id" uuid,
  "score" int,
  "attempted_at" timestamp
);

CREATE TABLE "assignments" (
  "id" uuid PRIMARY KEY,
  "lecture_id" uuid,
  "instructions" text,
  "submission_type" varchar,
  "max_score" int
);

CREATE TABLE "assignment_submissions" (
  "id" uuid PRIMARY KEY,
  "assignment_id" uuid,
  "job_seeker_id" uuid,
  "enrollment_id" uuid,
  "file_url" text,
  "score" int,
  "feedback" text,
  "submitted_at" timestamp
);

CREATE TABLE "course_questions" (
  "id" uuid PRIMARY KEY,
  "course_id" uuid,
  "job_seeker_id" uuid,
  "question_text" text,
  "created_at" timestamp
);

CREATE TABLE "course_answers" (
  "id" uuid PRIMARY KEY,
  "question_id" uuid,
  "responder_user_id" uuid,
  "answer_text" text,
  "created_at" timestamp
);

CREATE TABLE "enrollments" (
  "id" uuid PRIMARY KEY,
  "course_id" uuid,
  "job_seeker_id" uuid,
  "payment_id" uuid,
  "enrolled_at" timestamp,
  "progress_percentage" int,
  "completion_date" timestamp,
  "certificate_url" text
);

CREATE TABLE "certificate_templates" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "description" text,
  "html_template" text,
  "thumbnail_url" text,
  "is_active" boolean,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "certificates" (
  "id" uuid PRIMARY KEY,
  "course_id" uuid,
  "job_seeker_id" uuid,
  "template_id" uuid,
  "file_url" text,
  "issued_at" timestamp
);

CREATE TABLE "course_coupons" (
  "id" uuid PRIMARY KEY,
  "course_id" uuid,
  "code" varchar,
  "discount_percentage" int,
  "valid_until" timestamp,
  "usage_limit" int,
  "created_at" timestamp
);

CREATE TABLE "trainer_earnings" (
  "id" uuid PRIMARY KEY,
  "trainer_id" uuid,
  "course_id" uuid,
  "enrollment_id" uuid,
  "gross_amount" decimal,
  "platform_commission" decimal,
  "net_amount" decimal,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "payouts" (
  "id" uuid PRIMARY KEY,
  "trainer_id" uuid,
  "period_start" timestamp,
  "period_end" timestamp,
  "total_amount" decimal,
  "transaction_reference" varchar,
  "payout_status" varchar,
  "processed_at" timestamp
);

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "description" text,
  "product_type" varchar,
  "role_type" varchar,
  "price" decimal,
  "currency" varchar,
  "billing_cycle" varchar,
  "metadata" jsonb,
  "is_active" boolean,
  "created_at" timestamp
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "total_amount" decimal,
  "currency" varchar,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY,
  "order_id" uuid,
  "product_id" uuid,
  "quantity" int,
  "unit_price" decimal,
  "total_price" decimal,
  "reference_entity_type" varchar,
  "reference_entity_id" uuid
);

CREATE TABLE "subscription_plans" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "role_type" varchar,
  "billing_cycle" varchar,
  "price" decimal,
  "currency" varchar,
  "features" jsonb,
  "is_active" boolean,
  "created_at" timestamp
);

CREATE TABLE "subscriptions" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "plan_id" uuid,
  "start_date" timestamp,
  "end_date" timestamp,
  "auto_renew" boolean,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "subscription_usage" (
  "id" uuid PRIMARY KEY,
  "subscription_id" uuid,
  "feature_key" varchar,
  "used_count" int,
  "limit_count" int,
  "last_updated" timestamp
);

CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY,
  "order_id" uuid,
  "user_id" uuid,
  "amount" decimal,
  "currency" varchar,
  "payment_method" varchar,
  "gateway_transaction_id" varchar,
  "idempotency_key" varchar UNIQUE,
  "status" varchar,
  "gateway_response" jsonb,
  "created_at" timestamp
);

CREATE TABLE "payment_webhook_logs" (
  "id" uuid PRIMARY KEY,
  "gateway_name" varchar,
  "event_type" varchar,
  "payload" jsonb,
  "processed" boolean,
  "received_at" timestamp
);

CREATE TABLE "invoices" (
  "id" uuid PRIMARY KEY,
  "order_id" uuid,
  "user_id" uuid,
  "invoice_number" varchar,
  "tax_amount" decimal,
  "total_amount" decimal,
  "pdf_url" text,
  "issued_at" timestamp
);

CREATE TABLE "refunds" (
  "id" uuid PRIMARY KEY,
  "payment_id" uuid,
  "amount" decimal,
  "reason" text,
  "refund_status" varchar,
  "gateway_refund_id" varchar,
  "processed_at" timestamp
);

CREATE TABLE "revenue_distributions" (
  "id" uuid PRIMARY KEY,
  "order_item_id" uuid,
  "beneficiary_type" varchar,
  "beneficiary_id" uuid,
  "gross_amount" decimal,
  "commission_amount" decimal,
  "net_amount" decimal,
  "created_at" timestamp
);

CREATE TABLE "wallets" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "wallet_type" varchar,
  "balance" decimal,
  "currency" varchar,
  "created_at" timestamp
);

CREATE TABLE "wallet_transactions" (
  "id" uuid PRIMARY KEY,
  "wallet_id" uuid,
  "transaction_type" varchar,
  "amount" decimal,
  "reference_type" varchar,
  "reference_id" uuid,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "credit_types" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "description" text,
  "is_active" boolean
);

CREATE TABLE "credit_balances" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "credit_type_id" uuid,
  "available_credits" int,
  "reserved_credits" int,
  "expires_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "credit_transactions" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "credit_type_id" uuid,
  "transaction_type" varchar,
  "amount" int,
  "reference_type" varchar,
  "reference_id" uuid,
  "created_at" timestamp
);

CREATE TABLE "credit_packages" (
  "id" uuid PRIMARY KEY,
  "product_id" uuid,
  "credit_type_id" uuid,
  "credit_amount" int,
  "validity_days" int,
  "created_at" timestamp
);

CREATE TABLE "credit_reservations" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "credit_type_id" uuid,
  "reserved_amount" int,
  "reference_type" varchar,
  "reference_id" uuid,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "advertiser_accounts" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "advertiser_type" varchar,
  "company_id" uuid,
  "institute_id" uuid,
  "wallet_id" uuid,
  "created_at" timestamp
);

CREATE TABLE "ad_campaigns" (
  "id" uuid PRIMARY KEY,
  "advertiser_id" uuid,
  "campaign_name" varchar,
  "budget_total" decimal,
  "budget_spent" decimal,
  "bidding_model" varchar,
  "cost_per_click" decimal,
  "cost_per_thousand" decimal,
  "start_date" timestamp,
  "end_date" timestamp,
  "status" varchar,
  "targeting_criteria" jsonb,
  "created_at" timestamp
);

CREATE TABLE "ad_creatives" (
  "id" uuid PRIMARY KEY,
  "campaign_id" uuid,
  "title" varchar,
  "description" text,
  "media_url" text,
  "landing_url" text,
  "approval_status" varchar,
  "rejection_reason" text,
  "created_at" timestamp
);

CREATE TABLE "ad_slots" (
  "id" uuid PRIMARY KEY,
  "slot_name" varchar,
  "page_type" varchar,
  "width" int,
  "height" int,
  "pricing_model" varchar,
  "is_active" boolean
);

CREATE TABLE "ad_impressions" (
  "id" uuid PRIMARY KEY,
  "creative_id" uuid,
  "slot_id" uuid,
  "user_id" uuid,
  "ip_address" varchar,
  "user_agent" varchar,
  "impression_cost" decimal,
  "created_at" timestamp
);

CREATE TABLE "ad_clicks" (
  "id" uuid PRIMARY KEY,
  "impression_id" uuid,
  "creative_id" uuid,
  "user_id" uuid,
  "click_cost" decimal,
  "created_at" timestamp
);

CREATE TABLE "ad_conversions" (
  "id" uuid PRIMARY KEY,
  "campaign_id" uuid,
  "user_id" uuid,
  "conversion_type" varchar,
  "conversion_value" decimal,
  "created_at" timestamp
);

CREATE TABLE "ad_campaign_metrics" (
  "id" uuid PRIMARY KEY,
  "campaign_id" uuid,
  "date" date,
  "impressions" int,
  "clicks" int,
  "conversions" int,
  "spend" decimal,
  "created_at" timestamp
);

CREATE TABLE "ad_budget_transactions" (
  "id" uuid PRIMARY KEY,
  "campaign_id" uuid,
  "wallet_transaction_id" uuid,
  "amount" decimal,
  "transaction_type" varchar,
  "created_at" timestamp
);

CREATE TABLE "skills" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "category" varchar,
  "description" text,
  "is_active" boolean,
  "created_at" timestamp
);

CREATE TABLE "job_categories" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "parent_category_id" uuid,
  "is_active" boolean
);

CREATE TABLE "industries" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "description" text,
  "is_active" boolean
);

CREATE TABLE "locations" (
  "id" uuid PRIMARY KEY,
  "city" varchar,
  "state" varchar,
  "country" varchar,
  "latitude" decimal,
  "longitude" decimal,
  "timezone" varchar,
  "is_active" boolean
);

CREATE TABLE "search_queries" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "query_text" varchar,
  "filters" jsonb,
  "result_count" int,
  "searched_at" timestamp
);

CREATE TABLE "saved_searches" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "search_type" varchar,
  "search_criteria" jsonb,
  "alert_enabled" boolean,
  "created_at" timestamp
);

CREATE TABLE "search_result_clicks" (
  "id" uuid PRIMARY KEY,
  "search_query_id" uuid,
  "entity_type" varchar,
  "entity_id" uuid,
  "clicked_at" timestamp
);

CREATE TABLE "notification_preferences" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "email_enabled" boolean,
  "sms_enabled" boolean,
  "push_enabled" boolean,
  "marketing_enabled" boolean,
  "updated_at" timestamp
);

CREATE TABLE "notification_templates" (
  "id" uuid PRIMARY KEY,
  "template_key" varchar,
  "subject_template" text,
  "body_template" text,
  "channel" varchar,
  "is_active" boolean,
  "created_at" timestamp
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "template_id" uuid,
  "channel" varchar,
  "content" jsonb,
  "status" varchar,
  "sent_at" timestamp,
  "read_at" timestamp,
  "error_message" text
);

CREATE TABLE "message_threads" (
  "id" uuid PRIMARY KEY,
  "thread_type" varchar,
  "reference_entity_type" varchar,
  "reference_entity_id" uuid,
  "created_at" timestamp
);

CREATE TABLE "thread_participants" (
  "id" uuid PRIMARY KEY,
  "thread_id" uuid,
  "user_id" uuid,
  "role" varchar,
  "joined_at" timestamp
);

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY,
  "thread_id" uuid,
  "sender_id" uuid,
  "message_type" varchar,
  "content" text,
  "attachment_url" text,
  "is_read" boolean,
  "sent_at" timestamp
);

CREATE TABLE "interview_notifications" (
  "id" uuid PRIMARY KEY,
  "application_id" uuid,
  "recruiter_id" uuid,
  "job_seeker_id" uuid,
  "scheduled_time" timestamp,
  "meeting_link" text,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "communication_delivery_logs" (
  "id" uuid PRIMARY KEY,
  "notification_id" uuid,
  "provider_name" varchar,
  "provider_message_id" varchar,
  "delivery_status" varchar,
  "delivered_at" timestamp
);

ALTER TABLE "user_sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "user_consents" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "deletion_requests" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "role_permissions" ADD FOREIGN KEY ("role_id") REFERENCES "admin_roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "role_permissions" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "user_roles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "user_roles" ADD FOREIGN KEY ("role_id") REFERENCES "admin_roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "audit_logs" ADD FOREIGN KEY ("actor_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "job_seekers" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "candidate_education" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "candidate_experience" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "candidate_certifications" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "candidate_projects" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "candidate_languages" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "candidate_portfolio_links" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "job_seeker_skills" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "job_seeker_skills" ADD FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "saved_jobs" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "saved_jobs" ADD FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "job_alerts" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "jobs" ADD FOREIGN KEY ("company_id") REFERENCES "companies" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "jobs" ADD FOREIGN KEY ("recruiter_id") REFERENCES "recruiters" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "jobs" ADD FOREIGN KEY ("job_category_id") REFERENCES "job_categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "jobs" ADD FOREIGN KEY ("industry_id") REFERENCES "industries" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "jobs" ADD FOREIGN KEY ("location_id") REFERENCES "locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "job_skills" ADD FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "job_skills" ADD FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "job_status_history" ADD FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "job_status_history" ADD FOREIGN KEY ("changed_by_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "applications" ADD FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "applications" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "application_status_history" ADD FOREIGN KEY ("application_id") REFERENCES "applications" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "application_status_history" ADD FOREIGN KEY ("changed_by_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "application_notes" ADD FOREIGN KEY ("application_id") REFERENCES "applications" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "application_notes" ADD FOREIGN KEY ("recruiter_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "company_reviews" ADD FOREIGN KEY ("company_id") REFERENCES "companies" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "company_reviews" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "company_team_invitations" ADD FOREIGN KEY ("company_id") REFERENCES "companies" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "recruiters" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "recruiters" ADD FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "recruiter_saved_searches" ADD FOREIGN KEY ("recruiter_id") REFERENCES "recruiters" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "recruiter_pipelines" ADD FOREIGN KEY ("recruiter_id") REFERENCES "recruiters" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "pipeline_stages" ADD FOREIGN KEY ("pipeline_id") REFERENCES "recruiter_pipelines" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "candidate_shortlists" ADD FOREIGN KEY ("recruiter_id") REFERENCES "recruiters" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "candidate_shortlists" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "candidate_shortlists" ADD FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "trainers" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "trainer_kyc_documents" ADD FOREIGN KEY ("trainer_id") REFERENCES "trainers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "trainer_bank_details" ADD FOREIGN KEY ("trainer_id") REFERENCES "trainers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "institutes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "courses" ADD FOREIGN KEY ("trainer_id") REFERENCES "trainers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "courses" ADD FOREIGN KEY ("institute_id") REFERENCES "institutes" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "course_skills" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "course_skills" ADD FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "course_sections" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "lectures" ADD FOREIGN KEY ("section_id") REFERENCES "course_sections" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "quiz_questions" ADD FOREIGN KEY ("lecture_id") REFERENCES "lectures" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "quiz_options" ADD FOREIGN KEY ("question_id") REFERENCES "quiz_questions" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "quiz_attempts" ADD FOREIGN KEY ("question_id") REFERENCES "quiz_questions" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "quiz_attempts" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "quiz_attempts" ADD FOREIGN KEY ("enrollment_id") REFERENCES "enrollments" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "assignments" ADD FOREIGN KEY ("lecture_id") REFERENCES "lectures" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "assignment_submissions" ADD FOREIGN KEY ("assignment_id") REFERENCES "assignments" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "assignment_submissions" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "assignment_submissions" ADD FOREIGN KEY ("enrollment_id") REFERENCES "enrollments" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "course_questions" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "course_questions" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "course_answers" ADD FOREIGN KEY ("question_id") REFERENCES "course_questions" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "course_answers" ADD FOREIGN KEY ("responder_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "enrollments" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "enrollments" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "enrollments" ADD FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "certificates" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "certificates" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "certificates" ADD FOREIGN KEY ("template_id") REFERENCES "certificate_templates" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "course_coupons" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "trainer_earnings" ADD FOREIGN KEY ("trainer_id") REFERENCES "trainers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "trainer_earnings" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "trainer_earnings" ADD FOREIGN KEY ("enrollment_id") REFERENCES "enrollments" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "payouts" ADD FOREIGN KEY ("trainer_id") REFERENCES "trainers" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "order_items" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "order_items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "subscriptions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "subscriptions" ADD FOREIGN KEY ("plan_id") REFERENCES "subscription_plans" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "subscription_usage" ADD FOREIGN KEY ("subscription_id") REFERENCES "subscriptions" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "payments" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "payments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "invoices" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "invoices" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "refunds" ADD FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "revenue_distributions" ADD FOREIGN KEY ("order_item_id") REFERENCES "order_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "wallets" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "wallet_transactions" ADD FOREIGN KEY ("wallet_id") REFERENCES "wallets" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "credit_balances" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "credit_balances" ADD FOREIGN KEY ("credit_type_id") REFERENCES "credit_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "credit_transactions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "credit_transactions" ADD FOREIGN KEY ("credit_type_id") REFERENCES "credit_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "credit_packages" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "credit_packages" ADD FOREIGN KEY ("credit_type_id") REFERENCES "credit_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "credit_reservations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "credit_reservations" ADD FOREIGN KEY ("credit_type_id") REFERENCES "credit_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "advertiser_accounts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "advertiser_accounts" ADD FOREIGN KEY ("company_id") REFERENCES "companies" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "advertiser_accounts" ADD FOREIGN KEY ("institute_id") REFERENCES "institutes" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "advertiser_accounts" ADD FOREIGN KEY ("wallet_id") REFERENCES "wallets" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_campaigns" ADD FOREIGN KEY ("advertiser_id") REFERENCES "advertiser_accounts" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_creatives" ADD FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_impressions" ADD FOREIGN KEY ("creative_id") REFERENCES "ad_creatives" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_impressions" ADD FOREIGN KEY ("slot_id") REFERENCES "ad_slots" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_impressions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_clicks" ADD FOREIGN KEY ("impression_id") REFERENCES "ad_impressions" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_clicks" ADD FOREIGN KEY ("creative_id") REFERENCES "ad_creatives" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_clicks" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_conversions" ADD FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_conversions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_campaign_metrics" ADD FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_budget_transactions" ADD FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "ad_budget_transactions" ADD FOREIGN KEY ("wallet_transaction_id") REFERENCES "wallet_transactions" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "job_categories" ADD FOREIGN KEY ("parent_category_id") REFERENCES "job_categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "search_queries" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "saved_searches" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "search_result_clicks" ADD FOREIGN KEY ("search_query_id") REFERENCES "search_queries" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "notification_preferences" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "notifications" ADD FOREIGN KEY ("template_id") REFERENCES "notification_templates" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "thread_participants" ADD FOREIGN KEY ("thread_id") REFERENCES "message_threads" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "thread_participants" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "messages" ADD FOREIGN KEY ("thread_id") REFERENCES "message_threads" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "interview_notifications" ADD FOREIGN KEY ("application_id") REFERENCES "applications" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "interview_notifications" ADD FOREIGN KEY ("recruiter_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "interview_notifications" ADD FOREIGN KEY ("job_seeker_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "communication_delivery_logs" ADD FOREIGN KEY ("notification_id") REFERENCES "notifications" ("id") DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX ON "job_seeker_skills" ("job_seeker_id", "skill_id");
CREATE UNIQUE INDEX ON "job_skills" ("job_id", "skill_id");
CREATE UNIQUE INDEX ON "applications" ("job_id", "job_seeker_id");
CREATE UNIQUE INDEX ON "course_skills" ("course_id", "skill_id");
"""

tables = {}
for match in re.finditer(r'CREATE TABLE "([^"]+)" \((.*?)\);', sql, re.DOTALL):
    table_name = match.group(1)
    fields = match.group(2).strip().split(',\n')
    parsed_fields = []
    for f in fields:
        f = f.strip()
        if not f: continue
        parts = f.split()
        fname = parts[0].strip('"')
        ftype = parts[1]
        constraints = " ".join(parts[2:])
        parsed_fields.append({"name": fname, "type": ftype, "constraints": constraints})
    tables[table_name] = {"fields": parsed_fields, "fks": []}

for match in re.finditer(r'ALTER TABLE "([^"]+)" ADD FOREIGN KEY \("([^"]+)"\) REFERENCES "([^"]+)" \("([^"]+)"\)', sql):
    table = match.group(1)
    field = match.group(2)
    ref_table = match.group(3)
    ref_field = match.group(4)
    if table in tables:
        tables[table]['fks'].append({"field": field, "ref_table": ref_table})

# Find models that are OneToOne (e.g., job_seekers has user_id UNIQUE)
o2o_fields = []
# also check CREATE UNIQUE INDEX for potential O2O or unique_together, for now manually parsing UNIQUE field constraint
for t_name, t_data in tables.items():
    for f in t_data["fields"]:
        if "UNIQUE" in f["constraints"] and f["name"] in [fk["field"] for fk in t_data["fks"]]:
            o2o_fields.append((t_name, f["name"]))

def map_type(sql_type, fname, constraints):
    if sql_type == "uuid":
        if "PRIMARY KEY" in constraints:
            return "models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)"
        return "models.UUIDField(null=True, blank=True)" # fallback for non-PK uuids without FK
    if sql_type == "varchar":
        return "models.CharField(max_length=255, null=True, blank=True)"
    if sql_type == "text":
        return "models.TextField(null=True, blank=True)"
    if sql_type == "boolean":
        return "models.BooleanField(default=False)"
    if sql_type == "int":
        return "models.IntegerField(null=True, blank=True)"
    if sql_type == "decimal":
        return "models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)"
    if sql_type == "timestamp":
        if fname == "created_at": return "models.DateTimeField(auto_now_add=True, null=True)"
        if fname == "updated_at": return "models.DateTimeField(auto_now=True, null=True)"
        return "models.DateTimeField(null=True, blank=True)"
    if sql_type == "date":
        return "models.DateField(null=True, blank=True)"
    if sql_type == "jsonb":
        return "models.JSONField(null=True, blank=True)"
    return f"models.CharField(max_length=255, null=True, blank=True)  # Unknown type {sql_type}"

def to_camel_case(snake_str):
    if snake_str == "users": return "CustomUser"
    components = snake_str.split('_')
    return "".join(x.title() for x in components)

model_code = "import uuid\nfrom django.db import models\nfrom django.contrib.auth.models import AbstractBaseUser, PermissionsMixin\nfrom .managers import CustomUserManager\n\n"

# topological sort to define models in correct order (or we can just define foreign keys with string names 'ModelName' which Django supports!)
# We'll use string names for FKs so order doesn't matter.

for table_name, data in tables.items():
    class_name = to_camel_case(table_name)
    if class_name == "CustomUser":
        model_code += "class CustomUser(AbstractBaseUser, PermissionsMixin):\n"
        model_code += "    ACCOUNT_TYPE_CHOICES = (\n"
        model_code += "        ('CANDIDATE', 'Candidate'),\n"
        model_code += "        ('COMPANY', 'Company'),\n"
        model_code += "        ('RECRUITER', 'Recruiter'),\n"
        model_code += "    )\n"
    else:
        model_code += f"class {class_name}(models.Model):\n"
    
    for f in data["fields"]:
        fname = f["name"]
        
        if fname == "id" and "PRIMARY KEY" in f["constraints"]:
            model_code += f"    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)\n"
            continue
            
        fk_ref = next((fk for fk in data["fks"] if fk["field"] == fname), None)
        if fk_ref:
            ref_class = to_camel_case(fk_ref["ref_table"])
            field_name_clean = fname.replace("_id", "")
            if (table_name, fname) in o2o_fields or "UNIQUE" in f["constraints"]:
                model_code += f"    {field_name_clean} = models.OneToOneField('{ref_class}', on_delete=models.CASCADE, null=True, blank=True, related_name='{table_name}_{field_name_clean}')\n"
            else:
                model_code += f"    {field_name_clean} = models.ForeignKey('{ref_class}', on_delete=models.CASCADE, null=True, blank=True, related_name='{table_name}_{field_name_clean}')\n"
            continue
            
        ftype = f["type"]
        django_field = map_type(ftype, fname, f["constraints"])
        
        if class_name == "CustomUser":
            if fname == "email": 
                model_code += f"    email = models.EmailField(unique=True)\n"
                continue
            if fname == "password": continue # AbstractBaseUser provides this
            if fname == "last_login_at":
                model_code += f"    last_login = models.DateTimeField(null=True, blank=True, db_column='last_login_at')\n"
                continue
            
        ftype = f["type"]
        django_field = map_type(ftype, fname, f["constraints"])
        model_code += f"    {fname} = {django_field}\n"
    
    if class_name == "CustomUser":
        model_code += "    is_staff = models.BooleanField(default=False)\n"
        model_code += "\n    USERNAME_FIELD = 'email'\n"
        model_code += "    objects = CustomUserManager()\n"

    model_code += f"\n    class Meta:\n        db_table = '{table_name}'\n\n"

import os
output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps", "users", "generated_models.py"))
with open(output_path, "w") as outf:
    outf.write(model_code)
print("done")
