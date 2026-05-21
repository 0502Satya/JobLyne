from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.users.models import (
    CustomUser, JobSeekers, CandidateExperience, CandidateEducation, Skills, JobSeekerSkills
)
from apps.users.serializers import (
    UserSignupSerializer, CandidateProfileSerializer
)
from rest_framework.exceptions import ValidationError

User = get_user_model()

class JobLyneAuthSerializerTests(TestCase):
    def setUp(self):
        self.signup_data = {
            "email": "candidate_test@example.com",
            "password": "Password123",
            "password_confirm": "Password123",
            "account_type": "CANDIDATE",
            "first_name": "Test",
            "last_name": "User"
        }

    def test_user_signup_serializer_validation(self):
        serializer = UserSignupSerializer(data=self.signup_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        
        self.assertEqual(user.email, "candidate_test@example.com")
        self.assertFalse(user.is_verified)
        self.assertEqual(user.account_type, "CANDIDATE")
        
        # Verify JobSeeker profile is automatically created
        profile = JobSeekers.objects.get(user=user)
        self.assertEqual(profile.full_name, "Test User")

    def test_user_signup_password_mismatch(self):
        bad_data = self.signup_data.copy()
        bad_data["password_confirm"] = "Password124"
        serializer = UserSignupSerializer(data=bad_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password_confirm", serializer.errors)


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
