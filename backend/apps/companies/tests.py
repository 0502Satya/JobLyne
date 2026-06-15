from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone

from apps.users.models import CustomUser
from apps.companies.models import Recruiters
from apps.candidates.models import JobSeekers, JobSeekerSkills
from apps.jobs.models import Jobs, JobSkills
from apps.taxonomy.models import Skills

User = get_user_model()

class JobLyneRecruiterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter_user = CustomUser.objects.create_user(
            email="recruiter_test_actions@example.com",
            password="Password123",
            account_type="RECRUITER",
            is_verified=True,
            is_active=True
        )
        self.recruiter = Recruiters.objects.create(
            user=self.recruiter_user,
            agency_name="Premier Sourcing Agency"
        )
        self.candidate_user = CustomUser.objects.create_user(
            email="candidate_sourcing_test@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        self.seeker = JobSeekers.objects.create(
            user=self.candidate_user,
            full_name="Premium Candidate",
            is_open_to_opportunities=True
        )
        self.action_url = reverse('recruiter_candidate_action')

    def test_recruiter_dashboard_requires_recruiter_or_company_role(self):
        self.client.force_authenticate(user=self.candidate_user)
        url = reverse('recruiter_dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_recruiter_candidate_action_fails_when_no_job_posted(self):
        self.client.force_authenticate(user=self.recruiter_user)
        # Recruiter has no jobs posted, action should fail with 400
        response = self.client.post(self.action_url, {
            "candidate_id": str(self.seeker.id),
            "action": "invite"
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("You must post at least one job", response.data["error"])

    def test_toggle_shortlist_without_job_returns_400(self):
        self.client.force_authenticate(user=self.recruiter_user)
        response = self.client.post(self.action_url, {
            "candidate_id": str(self.seeker.id),
            "action": "toggle_shortlist"
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("You must post at least one job", response.data["error"])

    def test_recruiter_candidate_action_succeeds_when_job_posted(self):
        self.client.force_authenticate(user=self.recruiter_user)
        # Create a job for the recruiter
        job = Jobs.objects.create(
            recruiter=self.recruiter,
            title="Senior Backend Engineer",
            description="Build modern APIs",
            status="OPEN"
        )
        # Action should now succeed
        response = self.client.post(self.action_url, {
            "candidate_id": str(self.seeker.id),
            "action": "invite"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Candidate invited successfully.")

    def test_recruiter_dashboard_returns_match_score_for_skills(self):
        self.client.force_authenticate(user=self.recruiter_user)
        # Create a job with skill "Python"
        job = Jobs.objects.create(
            recruiter=self.recruiter,
            title="Python Developer",
            description="Django backend development",
            status="OPEN"
        )
        skill_python = Skills.objects.create(name="Python")
        JobSkills.objects.create(job=job, skill=skill_python, is_required=True)

        # Seeker has skill "Python"
        JobSeekerSkills.objects.create(job_seeker=self.seeker, skill=skill_python)

        url = reverse('recruiter_dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        candidates = response.data.get("results", response.data).get("candidates", [])
        self.assertTrue(len(candidates) > 0)
        # Match score should be 100% since skills align perfectly
        self.assertEqual(candidates[0]["matchScore"], 100)


class JobLyneRecruiterProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter_user = CustomUser.objects.create_user(
            email="recruiter_profile_test@example.com",
            password="Password123",
            account_type="RECRUITER",
            is_verified=True,
            is_active=True
        )
        self.recruiter = Recruiters.objects.create(
            user=self.recruiter_user,
            agency_name="Old Agency Name"
        )
        self.candidate_user = CustomUser.objects.create_user(
            email="candidate_profile_test@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        self.url = reverse('recruiter_profile')

    def test_recruiter_profile_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_recruiter_profile_restricts_candidate(self):
        self.client.force_authenticate(user=self.candidate_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_get_recruiter_profile_success(self):
        self.client.force_authenticate(user=self.recruiter_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "recruiter_profile_test@example.com")
        self.assertEqual(response.data["agency_name"], "Old Agency Name")

    def test_patch_recruiter_profile_success(self):
        self.client.force_authenticate(user=self.recruiter_user)
        patch_data = {
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+1234567890",
            "agency_name": "New Agency Name",
            "profile_photo_url": "https://example.com/new_pic.jpg"
        }
        response = self.client.patch(self.url, patch_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["first_name"], "John")
        self.assertEqual(response.data["last_name"], "Doe")
        self.assertEqual(response.data["phone"], "+1234567890")
        self.assertEqual(response.data["agency_name"], "New Agency Name")
        self.assertEqual(response.data["profile_photo_url"], "https://example.com/new_pic.jpg")

        self.recruiter_user.refresh_from_db()
        self.assertEqual(self.recruiter_user.first_name, "John")
        self.assertEqual(self.recruiter_user.last_name, "Doe")
        self.assertEqual(self.recruiter_user.phone, "+1234567890")
        self.assertEqual(self.recruiter_user.profile_photo_url, "https://example.com/new_pic.jpg")

        self.recruiter.refresh_from_db()
        self.assertEqual(self.recruiter.agency_name, "New Agency Name")

