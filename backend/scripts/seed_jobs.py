import os
import django
import uuid

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import Companies, Jobs, CustomUser, Recruiters, Locations, JobCategories, Industries
from django.utils import timezone

def seed_jobs():
    # 1. Create a Company if it doesn't exist
    company, created = Companies.objects.get_or_create(
        name="TechFlow Systems",
        defaults={
            "description": "Leading tech company.",
            "industry": "Technology",
            "city": "San Francisco",
            "country": "USA"
        }
    )
    if created:
        print(f"Created company: {company.name}")

    # 2. Create a Recruiter if needed (Jobs need a company or recruiter)
    # Let's just use company.

    # 3. Create mock jobs
    job_data = [
        {
            "title": "Senior Frontend Developer",
            "description": "We are looking for a React expert.",
            "requirements": "React.js, TypeScript, Tailwind CSS, Next.js",
            "location_name": "Remote",
            "salary_min": 140000,
            "salary_max": 180000,
            "employment_type": "Full-time"
        },
        {
            "title": "Backend Engineer",
            "description": "Join our Python team.",
            "requirements": "Python, Django, PostgreSQL, AWS",
            "location_name": "New York (Hybrid)",
            "salary_min": 130000,
            "salary_max": 170000,
            "employment_type": "Full-time"
        },
        {
            "title": "Product Designer",
            "description": "Design the future of JobLyne.",
            "requirements": "Figma, UI/UX, Prototyping",
            "location_name": "Austin, TX",
            "salary_min": 110000,
            "salary_max": 150000,
            "employment_type": "Full-time"
        }
    ]

    for data in job_data:
        job, created = Jobs.objects.get_or_create(
            title=data["title"],
            company=company,
            defaults={
                "description": data["description"],
                "requirements": data["requirements"],
                "employment_type": data["employment_type"],
                "salary_min": data["salary_min"],
                "salary_max": data["salary_max"],
                "currency": "$",
                "posted_at": timezone.now(),
                "status": "OPEN"
            }
        )
        if created:
            print(f"Created job: {job.title}")
        else:
            print(f"Job already exists: {job.title}")

if __name__ == "__main__":
    seed_jobs()
