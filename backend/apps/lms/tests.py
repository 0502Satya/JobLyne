from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.lms.models import Trainers, Courses

User = get_user_model()

class LMSTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="trainer@test.com",
            password="testpassword123",
            account_type="RECRUITER"
        )

    def test_trainer_creation(self):
        trainer = Trainers.objects.create(
            user=self.user,
            bio="Experienced Software Instructor",
            expertise={"languages": ["Python", "JS"]},
            approval_status="APPROVED"
        )
        self.assertEqual(trainer.user, self.user)
        self.assertEqual(trainer.bio, "Experienced Software Instructor")
        self.assertEqual(trainer.approval_status, "APPROVED")

    def test_course_creation(self):
        trainer = Trainers.objects.create(
            user=self.user,
            bio="Instructor",
            approval_status="APPROVED"
        )
        course = Courses.objects.create(
            trainer=trainer,
            title="Django Advanced Course",
            description="Deep dive into Django internals.",
            price=99.99,
            currency="USD",
            is_free=False,
            language="English",
            certificate_available=True,
            approval_status="APPROVED"
        )
        self.assertEqual(course.trainer, trainer)
        self.assertEqual(course.title, "Django Advanced Course")
        self.assertEqual(float(course.price), 99.99)