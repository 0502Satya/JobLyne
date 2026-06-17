import uuid
from django.db import models

class Companies(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    website = models.CharField(max_length=255, null=True, blank=True)
    logo_url = models.TextField(null=True, blank=True)
    cover_image_url = models.TextField(null=True, blank=True)
    industry = models.CharField(max_length=255, null=True, blank=True)
    culture = models.TextField(null=True, blank=True)
    benefits = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    verified_badge = models.BooleanField(default=False)
    tax_id = models.CharField(max_length=100, null=True, blank=True)
    cin_number = models.CharField(max_length=50, null=True, blank=True)
    gstin_number = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'companies'

class CompanyReviews(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey('Companies', on_delete=models.CASCADE, null=True, blank=True, related_name='company_reviews_company')
    job_seeker = models.ForeignKey('candidates.JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='company_reviews_job_seeker')
    rating = models.IntegerField(null=True, blank=True)
    review_text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'company_reviews'

class CompanyTeamInvitations(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey('Companies', on_delete=models.CASCADE, null=True, blank=True, related_name='company_team_invitations_company')
    invited_email = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    invited_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'company_team_invitations'

class Recruiters(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=False, blank=False, unique=True, related_name='recruiters_user')
    agency_name = models.CharField(max_length=255, null=True, blank=True)
    subscription_plan = models.ForeignKey('commerce.SubscriptionPlans', on_delete=models.CASCADE, null=True, blank=True, related_name='recruiters_subscription_plan')
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'recruiters'

class RecruiterSavedSearches(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recruiter = models.ForeignKey('Recruiters', on_delete=models.CASCADE, null=True, blank=True, related_name='recruiter_saved_searches_recruiter')
    search_criteria = models.JSONField(null=True, blank=True)
    alert_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'recruiter_saved_searches'

class RecruiterPipelines(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recruiter = models.ForeignKey('Recruiters', on_delete=models.CASCADE, null=True, blank=True, related_name='recruiter_pipelines_recruiter')
    name = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'recruiter_pipelines'

class PipelineStages(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pipeline = models.ForeignKey('RecruiterPipelines', on_delete=models.CASCADE, null=True, blank=True, related_name='pipeline_stages_pipeline')
    stage_name = models.CharField(max_length=255, null=True, blank=True)
    order_index = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'pipeline_stages'

class CompanyRecruiterRelations(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey('Companies', on_delete=models.CASCADE, related_name='recruiter_relations')
    recruiter = models.ForeignKey('Recruiters', on_delete=models.CASCADE, related_name='company_relations')
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'company_recruiter_relations'
        unique_together = [['company', 'recruiter']]

class CreditAuditLogs(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='credit_audit_logs')
    action_type = models.CharField(max_length=255, null=True, blank=True) # e.g. 'UNLOCK_CANDIDATE', 'BOOST_JOB'
    credits_deducted = models.IntegerField(default=0)
    reference_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'credit_audit_logs'
