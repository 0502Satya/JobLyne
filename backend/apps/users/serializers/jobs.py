from rest_framework import serializers
from ..models import Jobs, Applications

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.CharField(source='company.logo_url', read_only=True)
    
    class Meta:
        model = Jobs
        fields = [
            'id', 'title', 'company_name', 'company_logo', 'description', 
            'requirements', 'location', 'employment_type', 'experience_required',
            'salary_min', 'salary_max', 'currency', 'posted_at', 'status'
        ]

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)

    class Meta:
        model = Applications
        fields = [
            'id', 'job', 'job_title', 'company_name', 'status', 
            'applied_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'applied_at', 'updated_at']
