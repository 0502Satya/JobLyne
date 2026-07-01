from rest_framework import serializers
from apps.jobs.models import Jobs, Applications

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.CharField(source='company.logo_url', read_only=True)
    company_verification_status = serializers.CharField(source='company.verification_status', read_only=True)
    company_social_links = serializers.JSONField(source='company.social_links', read_only=True)
    skills = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    applicant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Jobs
        fields = [
            'id', 'title', 'company_name', 'company_logo', 'description', 
            'requirements', 'location', 'employment_type', 'experience_required',
            'salary_min', 'salary_max', 'currency', 'posted_at', 'status', 'skills',
            'applicant_count', 'company_verification_status', 'company_social_links'
        ]

    def get_skills(self, obj):
        return [link.skill.name for link in obj.job_skills_job.all() if link.skill]

    def get_applicant_count(self, obj):
        return obj.applications_job.count()

    def get_location(self, obj):
        if obj.location:
            parts = [obj.location.city, obj.location.state, obj.location.country]
            return ", ".join([p for p in parts if p])
        return obj.raw_location or ""

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)
    
    # Candidate details
    candidate_id = serializers.CharField(source='job_seeker.id', read_only=True)
    candidate_user_id = serializers.CharField(source='job_seeker.user.id', read_only=True)
    candidate_name = serializers.CharField(source='job_seeker.full_name', read_only=True)
    candidate_headline = serializers.CharField(source='job_seeker.headline', read_only=True)
    candidate_skills = serializers.SerializerMethodField()
    candidate_email = serializers.CharField(source='job_seeker.user.email', read_only=True)
    candidate_phone = serializers.CharField(source='job_seeker.phone', read_only=True)
    candidate_experience = serializers.IntegerField(source='job_seeker.experience_years', read_only=True)
    candidate_resume = serializers.CharField(source='job_seeker.resume_file_url', read_only=True)

    class Meta:
        model = Applications
        fields = [
            'id', 'job', 'job_title', 'company_name', 'status', 
            'applied_at', 'updated_at', 'interview_schedule', 'cover_letter', 
            'rejection_reason', 'candidate_id', 'candidate_user_id', 'candidate_name', 
            'candidate_headline', 'candidate_skills', 'candidate_email', 
            'candidate_phone', 'candidate_experience', 'candidate_resume'
        ]
        read_only_fields = ['id', 'applied_at', 'updated_at']

    def get_candidate_skills(self, obj):
        if obj.job_seeker:
            return [link.skill.name for link in obj.job_seeker.job_seeker_skills_job_seeker.all() if link.skill]
        return []
