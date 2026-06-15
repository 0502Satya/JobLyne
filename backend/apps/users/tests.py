from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta

from apps.users.models import CustomUser, EmailVerificationOTP
from apps.users.serializers import CompanySignupSerializer, RecruiterSignupSerializer, UserSignupSerializer
from apps.candidates.models import JobSeekers
from apps.companies.models import Companies, Recruiters

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
        self.assertEqual(user.first_name, "Test")
        self.assertEqual(user.last_name, "User")
        
        # Verify JobSeeker profile is automatically created
        profile = JobSeekers.objects.get(user=user)
        self.assertEqual(profile.full_name, "Test User")

    def test_user_signup_password_mismatch(self):
        bad_data = self.signup_data.copy()
        bad_data["password_confirm"] = "Password124"
        serializer = UserSignupSerializer(data=bad_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password_confirm", serializer.errors)

    def test_recruiter_signup_persists_name_fields(self):
        serializer = RecruiterSignupSerializer(data={
            "full_name": "Riya Sharma",
            "email": "riya@agencycorp.com",
            "password": "Password123",
            "password_confirm": "Password123",
            "company_name": "Agency Corp",
            "designation": "Talent Partner"
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        recruiter = Recruiters.objects.get(user=user)
        self.assertEqual(user.first_name, "Riya")
        self.assertEqual(user.last_name, "Sharma")
        self.assertEqual(recruiter.agency_name, "Agency Corp")

    def test_company_signup_accepts_and_stores_tax_id(self):
        serializer = CompanySignupSerializer(data={
            "company_name": "Taxed Talent Pvt Ltd",
            "tax_id": "TAX-123",
            "industry": "Recruiting",
            "website": "https://taxedtalent.example",
            "cin_number": "U12345MH2026PTC123456",
            "gstin_number": "27AAAAA1111A1Z1",
            "email": "admin@taxedtalent.example",
            "password": "Password123",
            "password_confirm": "Password123"
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        company = Companies.objects.get(name="Taxed Talent Pvt Ltd")
        self.assertEqual(company.tax_id, "TAX-123")
        self.assertEqual(user.company, company)
        self.assertEqual(user.team_role, "ADMIN")


class JobLyneOTPVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email="otp_test@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_active=False,
            is_verified=False
        )
        self.otp_code = "123456"
        from apps.users.views import hash_otp
        self.otp_hash = hash_otp(self.otp_code)
        self.otp_record = EmailVerificationOTP.objects.create(
            user=self.user,
            otp_hash=self.otp_hash
        )
        self.url = reverse('verify_otp')

    def test_otp_lockout_on_fifth_attempt(self):
        # We perform 4 bad attempts
        for i in range(4):
            response = self.client.post(self.url, {"email": self.user.email, "otp_code": "999999"})
            self.assertEqual(response.status_code, 400)
            self.assertIn("attempts remaining", response.data["error"])
        
        # 5th attempt - should lock out
        response = self.client.post(self.url, {"email": self.user.email, "otp_code": "999999"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("locked", response.data["error"])

        # 6th attempt - should remain locked
        response = self.client.post(self.url, {"email": self.user.email, "otp_code": "999999"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("locked", response.data["error"])

    def test_successful_otp_verification(self):
        response = self.client.post(self.url, {"email": self.user.email, "otp_code": self.otp_code})
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)
        self.assertTrue(self.user.is_active)

    def test_otp_expired_after_10_minutes(self):
        from apps.users.views import hash_otp
        self.otp_record.delete()
        
        otp = EmailVerificationOTP.objects.create(user=self.user, otp_hash=hash_otp('123456'))
        otp.created_at = timezone.now() - timedelta(minutes=11)
        otp.save(update_fields=['created_at'])
        
        response = self.client.post(self.url, {"email": self.user.email, "otp_code": "123456"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("expired", response.data["error"].lower())


class JobLyneSocialAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('social_login')

    def test_social_login_invalid_token(self):
        # Verify 400 response is returned for an invalid token
        response = self.client.post(self.url, {
            "provider": "google",
            "token": "invalid_or_expired_token_12345"
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)


class JobLyneUserProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email="profile_test@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        self.url = reverse('user_profile')

    def test_user_profile_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_get_user_profile_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "profile_test@example.com")

    def test_patch_user_profile_success(self):
        self.client.force_authenticate(user=self.user)
        patch_data = {
            "first_name": "Alice",
            "last_name": "Smith",
            "phone": "+9876543210",
            "profile_photo_url": "https://example.com/alice.jpg"
        }
        response = self.client.patch(self.url, patch_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["first_name"], "Alice")
        self.assertEqual(response.data["last_name"], "Smith")
        self.assertEqual(response.data["phone"], "+9876543210")
        self.assertEqual(response.data["profile_photo_url"], "https://example.com/alice.jpg")

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Alice")
        self.assertEqual(self.user.last_name, "Smith")
        self.assertEqual(self.user.phone, "+9876543210")
        self.assertEqual(self.user.profile_photo_url, "https://example.com/alice.jpg")

