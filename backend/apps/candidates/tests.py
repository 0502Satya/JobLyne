from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.candidates.models import JobSeekers, JobSeekerSkills
from apps.users.models import CustomUser
from apps.candidates.serializers import CandidateProfileSerializer

User = get_user_model()

class JobLyneCandidateProfileTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="candidate_profile_test@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True
        )
        self.profile, _ = JobSeekers.objects.get_or_create(
            user=self.user,
            defaults={"full_name": "Profile Test User"}
        )

    def test_candidate_profile_serializer_fields(self):
        serializer = CandidateProfileSerializer(self.profile)
        data = serializer.data
        self.assertEqual(data["full_name"], "Profile Test User")
        self.assertEqual(data["completeness"], 0)  # No other details set yet

    def test_candidate_profile_nested_upsert(self):
        experience_data = [
            {
                "title": "Software Engineer",
                "company": "JobLyne Tech",
                "start_date": "2024-01-01",
                "current": True,
                "description": "Building awesome features"
            }
        ]
        
        # We need mock request context in serializer for self.context['request'].data.get('skills')
        class DummyRequest:
            def __init__(self):
                self.data = {"skills": ["Python", "Django"]}
                
        serializer = CandidateProfileSerializer(
            instance=self.profile,
            data={"experience": experience_data, "full_name": "Updated Name"},
            partial=True,
            context={"request": DummyRequest()}
        )
        
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_profile = serializer.save()
        
        self.assertEqual(updated_profile.full_name, "Updated Name")
        
        # Assert experience is saved and mapped properly
        experiences = updated_profile.candidate_experience_job_seeker.all()
        self.assertEqual(experiences.count(), 1)
        exp = experiences.first()
        self.assertEqual(exp.designation, "Software Engineer")
        self.assertEqual(exp.company_name, "JobLyne Tech")
        self.assertTrue(exp.is_current)
        
        # Assert skills are created and linked properly
        skills = JobSeekerSkills.objects.filter(job_seeker=updated_profile)
        self.assertEqual(skills.count(), 2)
        skill_names = set(skills.values_list('skill__name', flat=True))
        self.assertEqual(skill_names, {"Python", "Django"})

        serializer = CandidateProfileSerializer(
            instance=updated_profile,
            data={
                "experience": [
                    {
                        "id": str(exp.id),
                        "title": "Senior Software Engineer",
                        "company": "JobLyne Tech",
                        "start_date": "2024-01-01",
                        "current": True,
                        "description": "Leading platform features"
                    }
                ]
            },
            partial=True,
            context={"request": DummyRequest()}
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        self.assertEqual(updated_profile.candidate_experience_job_seeker.count(), 1)
        exp.refresh_from_db()
        self.assertEqual(exp.designation, "Senior Software Engineer")


class JobLyneRoleGuardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.candidate_user = CustomUser.objects.create_user(
            email="candidate_guard@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        self.recruiter_user = CustomUser.objects.create_user(
            email="recruiter_guard@example.com",
            password="Password123",
            account_type="RECRUITER",
            is_verified=True,
            is_active=True
        )
        # Create profile for candidate so they don't get 404
        JobSeekers.objects.get_or_create(user=self.candidate_user, defaults={"full_name": "Candidate Guard User"})
        self.url = reverse('candidate_profile')

    def test_candidate_access_profile_allowed(self):
        self.client.force_authenticate(user=self.candidate_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_non_candidate_access_profile_forbidden(self):
        self.client.force_authenticate(user=self.recruiter_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_non_company_cannot_access_company_profile(self):
        # Authenticate candidate, who is not a COMPANY
        self.client.force_authenticate(user=self.candidate_user)
        response = self.client.get(reverse('company_profile'))
        self.assertEqual(response.status_code, 403)
        response_patch = self.client.patch(reverse('company_profile'), {"company_name": "New Name"})
        self.assertEqual(response_patch.status_code, 403)


class JobLyneProfileViewTrackingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Candidate setup
        self.candidate_user = CustomUser.objects.create_user(
            email="candidate_test@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        self.candidate = JobSeekers.objects.create(
            user=self.candidate_user,
            full_name="Candidate Analytic User",
            profile_view_count=0
        )

        # Company setup
        from apps.companies.models import Companies
        self.company = Companies.objects.create(
            name="Test Employer Corp",
            verification_status="verified"
        )
        self.company_user = CustomUser.objects.create_user(
            email="employer@example.com",
            password="Password123",
            account_type="COMPANY",
            company=self.company,
            is_verified=True,
            is_active=True
        )

    def test_record_profile_view_success(self):
        self.client.force_authenticate(user=self.company_user)
        payload = {
            "candidateId": str(self.candidate.id),
            "companyId": str(self.company.id)
        }
        url = reverse('record_profile_view')
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["incremented"])
        
        self.candidate.refresh_from_db()
        self.assertEqual(self.candidate.profile_view_count, 1)

    def test_record_profile_view_duplicate_prevention(self):
        self.client.force_authenticate(user=self.company_user)
        payload = {
            "candidateId": str(self.candidate.id),
            "companyId": str(self.company.id)
        }
        url = reverse('record_profile_view')
        
        # First view
        res1 = self.client.post(url, payload, format='json')
        self.assertEqual(res1.status_code, 200)
        self.assertTrue(res1.data["incremented"])

        # Second view (within 24 hours)
        res2 = self.client.post(url, payload, format='json')
        self.assertEqual(res2.status_code, 200)
        self.assertFalse(res2.data["incremented"])
        
        self.candidate.refresh_from_db()
        self.assertEqual(self.candidate.profile_view_count, 1)

    def test_record_profile_view_after_24_hours(self):
        from apps.candidates.models import CandidateProfileViews
        from django.utils import timezone
        
        # Create a record that was viewed 25 hours ago
        past_time = timezone.now() - timezone.timedelta(hours=25)
        view_rec = CandidateProfileViews.objects.create(
            job_seeker=self.candidate,
            company=self.company,
            viewer=self.company_user
        )
        # Manually force past dates to mock last_viewed_at
        CandidateProfileViews.objects.filter(id=view_rec.id).update(
            viewed_at=past_time,
            last_viewed_at=past_time
        )
        self.candidate.profile_view_count = 1
        self.candidate.save()

        # View again
        self.client.force_authenticate(user=self.company_user)
        payload = {
            "candidateId": str(self.candidate.id),
            "companyId": str(self.company.id)
        }
        url = reverse('record_profile_view')
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["incremented"])
        
        self.candidate.refresh_from_db()
        self.assertEqual(self.candidate.profile_view_count, 2)

    def test_candidate_analytics_endpoint(self):
        self.client.force_authenticate(user=self.candidate_user)
        url = reverse('candidate_profile_analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["totalViews"], 0)
        self.assertEqual(len(response.data["recentCompanies"]), 0)

