from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from apps.candidates.models import JobSeekers
from apps.companies.models import RecruiterSavedSearches
from apps.communication.models import Notifications, NotificationTemplates

@receiver(post_save, sender=JobSeekers)
def check_saved_searches(sender, instance, created, **kwargs):
    if not instance.is_open_to_opportunities:
        return

    # Fetch all enabled recruiter saved searches
    saved_searches = RecruiterSavedSearches.objects.filter(alert_enabled=True)
    if not saved_searches.exists():
        return

    for search in saved_searches:
        recruiter = search.recruiter
        if not recruiter or not recruiter.user:
            continue

        criteria = search.search_criteria or {}
        matches = True

        # Check keyword query
        query = criteria.get('query', '').strip().lower()
        if query:
            name = (instance.full_name or '').lower()
            headline = (instance.headline or '').lower()
            summary = (instance.summary or '').lower()
            if query not in name and query not in headline and query not in summary:
                matches = False

        # Check location
        location_crit = criteria.get('location', '').strip().lower()
        if location_crit:
            candidate_loc = f"{instance.location or ''} {instance.city or ''} {instance.country or ''}".lower()
            if location_crit not in candidate_loc:
                matches = False

        # Check experience range
        exp_min = criteria.get('experience_min')
        exp_max = criteria.get('experience_max')
        cand_exp = instance.experience_years or 0
        if exp_min is not None:
            try:
                if cand_exp < int(exp_min):
                    matches = False
            except ValueError:
                pass
        if exp_max is not None:
            try:
                if cand_exp > int(exp_max):
                    matches = False
            except ValueError:
                pass

        # Check skills
        skills_crit = criteria.get('skills', [])
        if skills_crit:
            cand_skills = set(
                instance.job_seeker_skills_job_seeker.values_list('skill__name', flat=True)
            )
            cand_skills_lower = {s.lower() for s in cand_skills}
            skills_match = False
            for s in skills_crit:
                if s.strip().lower() in cand_skills_lower:
                    skills_match = True
                    break
            if not skills_match:
                matches = False

        # If it matches, trigger a notification
        if matches:
            template, _ = NotificationTemplates.objects.get_or_create(
                template_key="saved_search_match",
                defaults={
                    "subject_template": "New Talent Match: {{ candidate_name }}",
                    "body_template": "A new candidate matching your saved criteria was found: {{ headline }}",
                    "channel": "email",
                    "is_active": True
                }
            )

            Notifications.objects.create(
                user=recruiter.user,
                template=template,
                channel="email",
                content={
                    "candidate_name": instance.full_name or "Anonymous Candidate",
                    "headline": instance.headline or "Software Professional",
                    "candidate_id": str(instance.id),
                    "search_id": str(search.id)
                },
                status="SENT",
                sent_at=timezone.now()
            )
