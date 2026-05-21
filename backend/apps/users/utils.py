from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_otp_email(user_email, otp_code):
    """
    Sends an OTP verification email to the user.
    """
    subject = f'{otp_code} is your JobLyne verification code'
    message = f"""
Hi,

Welcome to JobLyne! To complete your registration, please use the following verification code:

{otp_code}

This code will expire shortly. If you did not request this, please ignore this email.

Best regards,
The JobLyne Team
"""
    html_message = f"""
<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 10px;">
    <h2 style="color: #135bec; text-align: center;">JobLyne</h2>
    <hr style="border: 0; border-top: 1px solid #e1e4e8; margin: 20px 0;">
    <p>Hi,</p>
    <p>Welcome to JobLyne! To complete your registration, please use the following verification code:</p>
    <div style="background-color: #f0f4ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #135bec; border-radius: 5px; margin: 20px 0;">
        {otp_code}
    </div>
    <p>This code will expire shortly. If you did not request this, please ignore this email.</p>
    <hr style="border: 0; border-top: 1px solid #e1e4e8; margin: 20px 0;">
    <p style="font-size: 12px; color: #6a737d; text-align: center;">
        &copy; {2026} JobLyne. All rights reserved.
    </p>
</div>
"""
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
            html_message=html_message
        )
        logger.info(f"OTP email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending OTP email to {user_email}: {str(e)}")
        # Fallback for debugging in terminal
        print(f"--- FAILED TO SEND EMAIL TO {user_email}. OTP: {otp_code} ---")
        print(f"Error details: {str(e)}")
        return False

def calculate_profile_completeness(user):
    """
    Calculates the profile completeness score for a candidate in exactly 1 optimized DB query.
    """
    from django.db.models import Exists, OuterRef
    from .models import (
        JobSeekers, CandidateExperience, CandidateEducation, JobSeekerSkills,
        CandidateProjects, CandidateCertifications, CandidateLanguages, CandidatePortfolioLinks
    )
    
    if user.account_type != 'CANDIDATE':
        return 0
        
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
