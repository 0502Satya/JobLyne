from rest_framework import serializers
from django.db import transaction

from ..models import (
    JobSeekers, CandidateExperience, CandidateEducation, JobSeekerSkills, Skills,
    CandidateCertifications, CandidateProjects, CandidateLanguages, CandidatePortfolioLinks
)
from ..utils import calculate_profile_completeness

class CandidateExperienceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    title = serializers.CharField(source='designation', allow_blank=True, required=False)
    company = serializers.CharField(source='company_name', allow_blank=True, required=False)
    description = serializers.CharField(source='responsibilities', allow_blank=True, required=False)
    current = serializers.BooleanField(source='is_current', required=False)

    class Meta:
        model = CandidateExperience
        fields = ['id', 'title', 'company', 'start_date', 'end_date', 'current', 'description']

class CandidateEducationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    school = serializers.CharField(source='institution', allow_blank=True, required=False)
    field = serializers.CharField(source='field_of_study', allow_blank=True, required=False)

    class Meta:
        model = CandidateEducation
        fields = ['id', 'degree', 'school', 'field', 'start_year', 'end_year', 'grade']

class CandidateCertificationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = CandidateCertifications
        fields = ['id', 'name', 'issuing_organization', 'issue_date', 'credential_url']

class CandidateProjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = CandidateProjects
        fields = ['id', 'title', 'description', 'tech_stack', 'project_url']

class CandidateLanguageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = CandidateLanguages
        fields = ['id', 'language', 'proficiency_level']

class CandidatePortfolioLinkSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = CandidatePortfolioLinks
        fields = ['id', 'platform', 'url']

def _update_nested_relation(instance_relation, model_class, data_list, parent_field_name, parent_instance):
    """
    Safely upserts/updates/deletes a list of child objects on a parent instance.
    """
    existing_items = {item.id: item for item in instance_relation.all()}
    keep_ids = []
    for data in data_list:
        item_id = data.pop('id', None)
        if item_id and item_id in existing_items:
            item = existing_items[item_id]
            for attr, val in data.items():
                setattr(item, attr, val)
            item.save()
            keep_ids.append(item.id)
        else:
            data[parent_field_name] = parent_instance
            new_item = model_class.objects.create(**data)
            keep_ids.append(new_item.id)
    
    # Delete child objects that are not in keep_ids
    instance_relation.exclude(id__in=keep_ids).delete()

class CandidateProfileSerializer(serializers.ModelSerializer):
    experience = CandidateExperienceSerializer(many=True, source='candidate_experience_job_seeker', required=False)
    education = CandidateEducationSerializer(many=True, source='candidate_education_job_seeker', required=False)
    certifications = CandidateCertificationSerializer(many=True, source='candidate_certifications_job_seeker', required=False)
    projects = CandidateProjectSerializer(many=True, source='candidate_projects_job_seeker', required=False)
    languages = CandidateLanguageSerializer(many=True, source='candidate_languages_job_seeker', required=False)
    portfolio_links = CandidatePortfolioLinkSerializer(many=True, source='candidate_portfolio_links_job_seeker', required=False)
    skills = serializers.SerializerMethodField()
    bio = serializers.CharField(source='summary', allow_blank=True, required=False)
    completeness = serializers.SerializerMethodField()

    class Meta:
        model = JobSeekers
        fields = [
            'id', 'full_name', 'first_name', 'middle_name', 'last_name', 
            'phone', 'whatsapp_number', 'location', 'city', 'country', 'headline', 
            'bio', 'summary', 'experience_years', 'current_salary', 
            'expected_salary', 'currency', 'resume_file_url',
            'resume_headline', 'notice_period', 'date_of_birth', 'gender',
            'marital_status', 'current_company', 'current_designation',
            'industry', 'functional_area', 'ug_qualification', 'pg_qualification', 'pincode',
            'desired_titles', 'work_mode', 'preferred_locations', 'is_open_to_opportunities',
            'experience', 'education', 'certifications', 'projects', 'languages', 'portfolio_links', 'skills', 'completeness', 'social_links'
        ]
        read_only_fields = ['id', 'completeness']
        extra_kwargs = {
            'summary': {'write_only': True, 'required': False}
        }

    def get_completeness(self, obj):
        return calculate_profile_completeness(obj.user)

    def get_skills(self, obj):
        return list(JobSeekerSkills.objects.filter(job_seeker=obj).values_list('skill__name', flat=True))

    @transaction.atomic
    def update(self, instance, validated_data):
        # Handle complex relational fields
        experience_data = validated_data.pop('candidate_experience_job_seeker', None)
        education_data = validated_data.pop('candidate_education_job_seeker', None)
        certification_data = validated_data.pop('candidate_certifications_job_seeker', None)
        project_data = validated_data.pop('candidate_projects_job_seeker', None)
        language_data = validated_data.pop('candidate_languages_job_seeker', None)
        portfolio_data = validated_data.pop('candidate_portfolio_links_job_seeker', None)
        skills_data = self.context['request'].data.get('skills', None)
        
        # Update JobSeeker main fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle Experience
        if experience_data is not None:
            _update_nested_relation(instance.candidate_experience_job_seeker, CandidateExperience, experience_data, 'job_seeker', instance)

        # Handle Education
        if education_data is not None:
            _update_nested_relation(instance.candidate_education_job_seeker, CandidateEducation, education_data, 'job_seeker', instance)

        # Handle Certifications
        if certification_data is not None:
            _update_nested_relation(instance.candidate_certifications_job_seeker, CandidateCertifications, certification_data, 'job_seeker', instance)

        # Handle Projects
        if project_data is not None:
            _update_nested_relation(instance.candidate_projects_job_seeker, CandidateProjects, project_data, 'job_seeker', instance)

        # Handle Languages
        if language_data is not None:
            _update_nested_relation(instance.candidate_languages_job_seeker, CandidateLanguages, language_data, 'job_seeker', instance)

        # Handle Portfolio Links
        if portfolio_data is not None:
            _update_nested_relation(instance.candidate_portfolio_links_job_seeker, CandidatePortfolioLinks, portfolio_data, 'job_seeker', instance)

        # Handle Skills (optimized to avoid deleting/recreating active links)
        if skills_data is not None:
            existing_links = {link.skill.name: link for link in JobSeekerSkills.objects.filter(job_seeker=instance).select_related('skill')}
            keep_skills = set(skills_data)
            
            # Delete links that are no longer requested
            for name, link in list(existing_links.items()):
                if name not in keep_skills:
                    link.delete()
            
            # Add missing links
            for skill_name in keep_skills:
                if skill_name not in existing_links:
                    skill, _ = Skills.objects.get_or_create(name=skill_name)
                    JobSeekerSkills.objects.create(job_seeker=instance, skill=skill)

        return instance
