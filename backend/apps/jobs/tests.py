from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import CustomUser
from apps.jobs.models import Jobs, JobSkills, Applications
from apps.taxonomy.models import Skills, Locations
from apps.candidates.models import JobSeekers
from apps.companies.models import Recruiters
from apps.jobs.serializers import JobSerializer

User = get_user_model()

class JobLyneJobSerializerTests(TestCase):
    def setUp(self):
        self.job = Jobs.objects.create(
            title="Senior backend engineer",
            description="Build robust APIs",
            salary_min=100000,
            salary_max=150000,
            currency="USD",
            status="OPEN"
        )
        self.skill_python = Skills.objects.create(name="Python")
        self.skill_django = Skills.objects.create(name="Django")
        
        JobSkills.objects.create(job=self.job, skill=self.skill_python, is_required=True)
        JobSkills.objects.create(job=self.job, skill=self.skill_django, is_required=False)

    def test_job_serializer_skills(self):
        serializer = JobSerializer(self.job)
        data = serializer.data
        self.assertEqual(data["title"], "Senior backend engineer")
        self.assertEqual(data["skills"], ["Python", "Django"])


class JobLyneDuplicateApplicationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email="apply_test@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        self.job_seeker = JobSeekers.objects.create(user=self.user, full_name="Apply Test User")
        self.job = Jobs.objects.create(
            title="Software Developer",
            description="Build cool things",
            status="OPEN"
        )
        self.url = reverse('application-list')

    def test_duplicate_application_rejection(self):
        self.client.force_authenticate(user=self.user)
        
        # 1st apply - success
        response = self.client.post(self.url, {"job": str(self.job.id)})
        self.assertEqual(response.status_code, 201)
        
        # 2nd apply - fail
        response = self.client.post(self.url, {"job": str(self.job.id)})
        self.assertEqual(response.status_code, 400)
        self.assertIn("already applied", response.data["error"])


class JobLyneJobEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter_user1 = CustomUser.objects.create_user(
            email="job_rec1@example.com",
            password="Password123",
            account_type="RECRUITER",
            is_verified=True,
            is_active=True
        )
        self.recruiter1 = Recruiters.objects.create(user=self.recruiter_user1, agency_name="Agency One")
        
        self.recruiter_user2 = CustomUser.objects.create_user(
            email="job_rec2@example.com",
            password="Password123",
            account_type="RECRUITER",
            is_verified=True,
            is_active=True
        )
        self.recruiter2 = Recruiters.objects.create(user=self.recruiter_user2, agency_name="Agency Two")
        
        self.candidate = CustomUser.objects.create_user(
            email="job_cand@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )

        self.job = Jobs.objects.create(
            recruiter=self.recruiter1,
            title="Recruiter 1 Job",
            description="Own job",
            status="OPEN"
        )

    def test_job_create_requires_corporate_account(self):
        self.client.force_authenticate(user=self.candidate)
        url = reverse('job_list')
        response = self.client.post(url, {"title": "New Job", "description": "Desc"})
        self.assertEqual(response.status_code, 403)

    def test_recruiter_can_patch_own_job(self):
        self.client.force_authenticate(user=self.recruiter_user1)
        url = reverse('job_detail', kwargs={"pk": self.job.pk})
        response = self.client.patch(url, {"title": "Updated Title"})
        self.assertEqual(response.status_code, 200)
        self.job.refresh_from_db()
        self.assertEqual(self.job.title, "Updated Title")

    def test_recruiter_cannot_patch_other_recruiter_job(self):
        self.client.force_authenticate(user=self.recruiter_user2)
        url = reverse('job_detail', kwargs={"pk": self.job.pk})
        response = self.client.patch(url, {"title": "Malicious Update"})
        self.assertEqual(response.status_code, 403)

    def test_job_list_filters(self):
        location_berlin = Locations.objects.create(city="Berlin", country="Germany")
        
        # Create a specific job to filter
        Jobs.objects.create(
            recruiter=self.recruiter1,
            title="Senior Django Backend Developer",
            description="Django project",
            location=location_berlin,
            salary_min=120000,
            salary_max=160000,
            employment_type="FULL_TIME",
            status="OPEN"
        )
        self.client.force_authenticate(user=self.candidate)
        url = reverse('job_list')
        
        # Test query filter
        res = self.client.get(url, {"query": "Django"})
        self.assertEqual(res.status_code, 200)
        results = res.data.get("results", res.data)
        self.assertTrue(any(j["title"] == "Senior Django Backend Developer" for j in results))

        # Test location filter
        res = self.client.get(url, {"location": "Berlin"})
        self.assertEqual(res.status_code, 200)
        results = res.data.get("results", res.data)
        self.assertTrue(any("Berlin" in j["location"] for j in results))

        # Test salary min filter
        res = self.client.get(url, {"salary_min": "110000"})
        self.assertEqual(res.status_code, 200)
        results = res.data.get("results", res.data)
        self.assertTrue(any(float(j["salary_min"]) >= 110000 for j in results))


class JobLynePaginationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter_user = CustomUser.objects.create_user(
            email="pagination_rec@example.com",
            password="Password123",
            account_type="RECRUITER",
            is_verified=True,
            is_active=True
        )
        self.recruiter = Recruiters.objects.create(user=self.recruiter_user, agency_name="Paginated agency")
        
        # Create multiple jobs
        for i in range(15):
            Jobs.objects.create(
                recruiter=self.recruiter,
                title=f"Paginated Job {i}",
                description="Testing pagination",
                status="OPEN"
            )

    def test_job_list_pagination_envelope_shape(self):
        self.client.force_authenticate(user=self.recruiter_user)
        url = reverse('job_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        # Check standard envelope structure: counts, next, previous, results
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)
        self.assertEqual(response.data["count"], 15)

    def test_recruiter_dashboard_pagination_envelope_shape(self):
        self.client.force_authenticate(user=self.recruiter_user)
        url = reverse('recruiter_dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)
        # Results should contain statistics and candidates
        results = response.data["results"]
        self.assertIn("statistics", results)
        self.assertIn("candidates", results)
