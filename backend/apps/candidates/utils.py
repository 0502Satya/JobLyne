from django.core.cache import cache
from django.db.models import Exists, OuterRef
from apps.candidates.models import (
    JobSeekers, CandidateExperience, CandidateEducation, JobSeekerSkills,
    CandidateProjects, CandidateCertifications, CandidateLanguages, CandidatePortfolioLinks
)

def calculate_profile_completeness(user_or_seeker):
    """
    Calculates the profile completeness score for a candidate, cached in Redis/LocMem with a 5-minute TTL.
    Supports passing a preloaded JobSeekers instance to compute in-memory using prefetched relations.
    """
    if not user_or_seeker:
        return 0
        
    if isinstance(user_or_seeker, JobSeekers):
        user_id = user_or_seeker.user_id
        user = user_or_seeker.user
    else:
        user_id = user_or_seeker.id
        user = user_or_seeker
        
    cache_key = f'profile_completeness:{user_id}'
    cached_score = cache.get(cache_key)
    if cached_score is not None:
        return cached_score
        
    if isinstance(user_or_seeker, JobSeekers) and hasattr(user_or_seeker, '_prefetched_objects_cache'):
        score = _compute_from_job_seeker(user_or_seeker)
    else:
        score = _compute_profile_completeness(user)
        
    cache.set(cache_key, score, timeout=300)  # 5-minute TTL
    return score

def _compute_from_job_seeker(job_seeker):
    def relation_exists(manager):
        return len(manager.all()) > 0

    score = 0
    
    # Basic Info & Photo (20%)
    if job_seeker.headline: score += 5
    if job_seeker.summary: score += 5
    if job_seeker.phone or (job_seeker.user and job_seeker.user.phone): score += 5
    if job_seeker.user and job_seeker.user.profile_photo_url: score += 5
    
    # Career Details (10%)
    if job_seeker.notice_period: score += 2
    if job_seeker.expected_salary: score += 2
    if job_seeker.functional_area: score += 2
    if job_seeker.industry: score += 2
    if job_seeker.work_mode: score += 2
    
    # Experience (20%)
    if relation_exists(job_seeker.candidate_experience_job_seeker):
        score += 20
    elif job_seeker.experience_years == 0:
        score += 20
        
    # Education (15%)
    if relation_exists(job_seeker.candidate_education_job_seeker):
        score += 15
        
    # Skills (15%)
    if relation_exists(job_seeker.job_seeker_skills_job_seeker):
        score += 15
        
    # Projects & Certifications (10%)
    if relation_exists(job_seeker.candidate_projects_job_seeker):
        score += 5
    if relation_exists(job_seeker.candidate_certifications_job_seeker):
        score += 5
        
    # Languages & Portfolio (10%)
    if relation_exists(job_seeker.candidate_languages_job_seeker):
        score += 5
    if relation_exists(job_seeker.candidate_portfolio_links_job_seeker):
        score += 5
        
    return score

def _compute_profile_completeness(user):
    job_seeker = JobSeekers.objects.filter(user=user).annotate(
        has_experience=Exists(CandidateExperience.objects.filter(job_seeker=OuterRef('pk'))),
        has_education=Exists(CandidateEducation.objects.filter(job_seeker=OuterRef('pk'))),
        has_skills=Exists(JobSeekerSkills.objects.filter(job_seeker=OuterRef('pk'))),
        has_projects=Exists(CandidateProjects.objects.filter(job_seeker=OuterRef('pk'))),
        has_certifications=Exists(CandidateCertifications.objects.filter(job_seeker=OuterRef('pk'))),
        has_languages=Exists(CandidateLanguages.objects.filter(job_seeker=OuterRef('pk'))),
        has_portfolio_links=Exists(CandidatePortfolioLinks.objects.filter(job_seeker=OuterRef('pk')))
    ).select_related('user').first()
    
    if not job_seeker:
        return 0
        
    score = 0
    
    # Basic Info & Photo (20%)
    if job_seeker.headline: score += 5
    if job_seeker.summary: score += 5
    if job_seeker.phone or (job_seeker.user and job_seeker.user.phone): score += 5
    if job_seeker.user and job_seeker.user.profile_photo_url: score += 5
    
    # Career Details (10%)
    if job_seeker.notice_period: score += 2
    if job_seeker.expected_salary: score += 2
    if job_seeker.functional_area: score += 2
    if job_seeker.industry: score += 2
    if job_seeker.work_mode: score += 2
    
    # Experience (20%)
    if job_seeker.has_experience:
        score += 20
    elif job_seeker.experience_years == 0: # Fresher counts as complete if marked
        score += 20
        
    # Education (15%)
    if job_seeker.has_education:
        score += 15
        
    # Skills (15%)
    if job_seeker.has_skills:
        score += 15
        
    # Projects & Certifications (10%)
    if job_seeker.has_projects:
        score += 5
    if job_seeker.has_certifications:
        score += 5
        
    # Languages & Portfolio (10%)
    if job_seeker.has_languages:
        score += 5
    if job_seeker.has_portfolio_links:
        score += 5
        
    return score
