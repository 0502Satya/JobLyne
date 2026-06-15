import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import CustomUser, JobSeekers, Skills, JobSeekerSkills

def create_test_candidate():
    email = "dashboard_tester@example.com"
    user, created = CustomUser.objects.get_or_create(
        email=email,
        defaults={
            "account_type": "CANDIDATE",
            "is_active": True,
            "is_verified": True
        }
    )
    user.set_password("password123")
    user.save()
    
    job_seeker, _ = JobSeekers.objects.get_or_create(
        user=user,
        defaults={"full_name": "Dashboard Tester", "headline": "QA Engineer"}
    )
    
    # Add some skills to test Match Score
    skill_names = ["React.js", "Python"]
    for name in skill_names:
        skill, _ = Skills.objects.get_or_create(name=name)
        JobSeekerSkills.objects.get_or_create(job_seeker=job_seeker, skill=skill)
        
    print(f"Test candidate created: {email} / password123")

if __name__ == "__main__":
    create_test_candidate()
