import uuid
from django.db import models

class Jobs(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey('Companies', on_delete=models.CASCADE, null=True, blank=True, related_name='jobs_company')
    recruiter = models.ForeignKey('Recruiters', on_delete=models.CASCADE, null=True, blank=True, related_name='jobs_recruiter')
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    requirements = models.TextField(null=True, blank=True)
    raw_location = models.CharField(max_length=255, null=True, blank=True)
    location = models.ForeignKey('Locations', on_delete=models.CASCADE, null=True, blank=True, related_name='jobs_location')
    job_category = models.ForeignKey('JobCategories', on_delete=models.CASCADE, null=True, blank=True, related_name='jobs_job_category')
    industry = models.ForeignKey('Industries', on_delete=models.CASCADE, null=True, blank=True, related_name='jobs_industry')
    employment_type = models.CharField(max_length=255, null=True, blank=True)
    experience_required = models.IntegerField(null=True, blank=True)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    boost_score = models.IntegerField(null=True, blank=True)
    posted_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'jobs'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['posted_at']),
        ]

class JobSkills(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey('Jobs', on_delete=models.CASCADE, null=True, blank=True, related_name='job_skills_job')
    skill = models.ForeignKey('Skills', on_delete=models.CASCADE, null=True, blank=True, related_name='job_skills_skill')
    is_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'job_skills'

class JobStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey('Jobs', on_delete=models.CASCADE, null=True, blank=True, related_name='job_status_history_job')
    previous_status = models.CharField(max_length=255, null=True, blank=True)
    new_status = models.CharField(max_length=255, null=True, blank=True)
    changed_by_user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='job_status_history_changed_by_user')
    reason = models.TextField(null=True, blank=True)
    changed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'job_status_history'

class Applications(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey('Jobs', on_delete=models.CASCADE, null=False, blank=False, related_name='applications_job')
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=False, blank=False, related_name='applications_job_seeker')
    status = models.CharField(max_length=255, null=True, blank=True)
    cover_letter = models.TextField(null=True, blank=True)
    interview_schedule = models.DateTimeField(null=True, blank=True)
    offer_details = models.JSONField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'applications'
        indexes = [
            models.Index(fields=['status']),
        ]

class ApplicationStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey('Applications', on_delete=models.CASCADE, null=True, blank=True, related_name='application_status_history_application')
    previous_status = models.CharField(max_length=255, null=True, blank=True)
    new_status = models.CharField(max_length=255, null=True, blank=True)
    changed_by_user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='application_status_history_changed_by_user')
    reason = models.TextField(null=True, blank=True)
    changed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'application_status_history'

class ApplicationNotes(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey('Applications', on_delete=models.CASCADE, null=True, blank=True, related_name='application_notes_application')
    recruiter_user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='application_notes_recruiter_user')
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'application_notes'
