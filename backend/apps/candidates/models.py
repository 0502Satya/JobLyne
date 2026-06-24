import uuid
from django.db import models

class JobSeekers(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.CustomUser', on_delete=models.CASCADE, null=False, blank=False, related_name='job_seekers_user')
    full_name = models.CharField(max_length=255, null=True, blank=True)
    first_name = models.CharField(max_length=255, null=True, blank=True)
    middle_name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=255, null=True, blank=True)
    whatsapp_number = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    video_intro_url = models.TextField(null=True, blank=True)
    headline = models.CharField(max_length=255, null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    current_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=255, null=True, blank=True)
    resume_file_url = models.TextField(null=True, blank=True)
    resume_parsed_data = models.JSONField(null=True, blank=True)
    
    # Naukri-style Enhanced Fields
    resume_headline = models.TextField(null=True, blank=True)
    notice_period = models.CharField(max_length=100, null=True, blank=True) # e.g. "15 Days", "Immediate"
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, null=True, blank=True) # Male / Female / Other
    marital_status = models.CharField(max_length=50, null=True, blank=True) # Single / Married
    current_company = models.CharField(max_length=255, null=True, blank=True)
    current_designation = models.CharField(max_length=255, null=True, blank=True)
    industry = models.CharField(max_length=255, null=True, blank=True)
    functional_area = models.CharField(max_length=255, null=True, blank=True)
    ug_qualification = models.CharField(max_length=255, null=True, blank=True)
    pg_qualification = models.CharField(max_length=255, null=True, blank=True)
    pincode = models.CharField(max_length=20, null=True, blank=True)
    
    # Social Media / Portfolio Links
    social_links = models.JSONField(null=True, blank=True) # e.g. {"facebook": "...", "instagram": "..."}
    
    # New Job Preference Fields
    desired_titles = models.TextField(null=True, blank=True)
    work_mode = models.JSONField(null=True, blank=True) # e.g. ["Remote", "Hybrid"]
    preferred_locations = models.JSONField(null=True, blank=True) # e.g. ["New York", "London"]
    is_open_to_opportunities = models.BooleanField(default=True, db_index=True)
    nationality = models.CharField(max_length=255, null=True, blank=True)
    preferred_company_size = models.CharField(max_length=100, null=True, blank=True)
    open_to_relocation = models.BooleanField(default=False)
    open_to_international = models.BooleanField(default=False)
    privacy_settings = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'job_seekers'

class CandidateEducation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='candidate_education_job_seeker')
    degree = models.CharField(max_length=255, null=True, blank=True)
    institution = models.CharField(max_length=255, null=True, blank=True)
    field_of_study = models.CharField(max_length=255, null=True, blank=True)
    start_year = models.IntegerField(null=True, blank=True)
    end_year = models.IntegerField(null=True, blank=True)
    grade = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'candidate_education'

class CandidateExperience(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='candidate_experience_job_seeker')
    company_name = models.CharField(max_length=255, null=True, blank=True)
    designation = models.CharField(max_length=255, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    responsibilities = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'candidate_experience'

class CandidateCertifications(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='candidate_certifications_job_seeker')
    name = models.CharField(max_length=255, null=True, blank=True)
    issuing_organization = models.CharField(max_length=255, null=True, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    credential_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'candidate_certifications'

class CandidateProjects(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='candidate_projects_job_seeker')
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    tech_stack = models.JSONField(null=True, blank=True)
    project_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'candidate_projects'

class CandidateLanguages(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='candidate_languages_job_seeker')
    language = models.CharField(max_length=255, null=True, blank=True)
    proficiency_level = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'candidate_languages'

class CandidatePortfolioLinks(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='candidate_portfolio_links_job_seeker')
    platform = models.CharField(max_length=255, null=True, blank=True)
    url = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'candidate_portfolio_links'

class JobSeekerSkills(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='job_seeker_skills_job_seeker')
    skill = models.ForeignKey('taxonomy.Skills', on_delete=models.CASCADE, null=True, blank=True, related_name='job_seeker_skills_skill')
    proficiency_level = models.CharField(max_length=255, null=True, blank=True)
    years_of_experience = models.IntegerField(null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'job_seeker_skills'

class SavedJobs(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='saved_jobs_job_seeker')
    job = models.ForeignKey('jobs.Jobs', on_delete=models.CASCADE, null=True, blank=True, related_name='saved_jobs_job')
    saved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'saved_jobs'
        indexes = [
            models.Index(fields=['job_seeker', 'job']),
        ]
        unique_together = [['job_seeker', 'job']]

class JobAlerts(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='job_alerts_job_seeker')
    keywords = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    experience_min = models.IntegerField(null=True, blank=True)
    frequency = models.CharField(max_length=255, null=True, blank=True)
    last_triggered = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'job_alerts'

class CandidateShortlists(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recruiter = models.ForeignKey('companies.Recruiters', on_delete=models.CASCADE, null=True, blank=True, related_name='candidate_shortlists_recruiter')
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=True, blank=True, related_name='candidate_shortlists_job_seeker')
    job = models.ForeignKey('jobs.Jobs', on_delete=models.CASCADE, null=True, blank=True, related_name='candidate_shortlists_job')
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'candidate_shortlists'
        unique_together = [['recruiter', 'job_seeker']]

class CandidateProfileViews(models.Model):
    """Records each time a recruiter/company user views a candidate's profile."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_seeker = models.ForeignKey('JobSeekers', on_delete=models.CASCADE, null=False, blank=False, related_name='profile_views')
    viewer = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='viewed_profiles')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'candidate_profile_views'
        indexes = [
            models.Index(fields=['job_seeker', 'viewed_at']),
        ]
