from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone

from apps.users.models import CustomUser
from apps.communication.models import (
    NotificationTemplates, Notifications, SavedSearches, MessageThreads, ThreadParticipants, Messages
)

User = get_user_model()

class JobLyneNotificationAndSavedSearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email="notification_test@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        self.other_user = CustomUser.objects.create_user(
            email="notification_other@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        
        # Create a notification template
        self.template = NotificationTemplates.objects.create(
            template_key="job_match_alert",
            subject_template="New Job Match found!",
            body_template="A job matching your skills has been posted.",
            channel="EMAIL",
            is_active=True
        )
        
        # Create a notification for self.user
        self.notification = Notifications.objects.create(
            user=self.user,
            template=self.template,
            channel="EMAIL",
            status="UNREAD",
            sent_at=timezone.now()
        )

    def test_notification_list_retrieval(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('notification_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["subject"], "New Job Match found!")
        self.assertEqual(results[0]["status"], "UNREAD")

    def test_notification_mark_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('notification_mark_read', kwargs={"pk": self.notification.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "READ")
        
        self.notification.refresh_from_db()
        self.assertEqual(self.notification.status, "READ")
        self.assertIsNotNone(self.notification.read_at)

    def test_notification_mark_read_unauthorized(self):
        self.client.force_authenticate(user=self.other_user)
        url = reverse('notification_mark_read', kwargs={"pk": self.notification.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403)

    def test_notification_preferences_get_or_create(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('notification_preferences')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["email_enabled"])
        self.assertTrue(response.data["push_enabled"])

    def test_notification_preferences_update(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('notification_preferences')
        response = self.client.patch(url, {"email_enabled": False, "push_enabled": False})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["email_enabled"])
        self.assertFalse(response.data["push_enabled"])

    def test_saved_searches_crud(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('saved-search-list')
        
        # Create saved search
        data = {
            "search_type": "Senior Python Alert",
            "search_criteria": {"query": "Python", "location": "Austin"},
            "alert_enabled": True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        alert_id = response.data["id"]
        
        # List saved searches
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["search_type"], "Senior Python Alert")
        
        # Delete saved search
        detail_url = reverse('saved-search-detail', kwargs={"pk": alert_id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, 204)
        
        self.assertEqual(SavedSearches.objects.filter(user=self.user).count(), 0)


class JobLyneMessagingSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = CustomUser.objects.create_user(
            email="chat_user1@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        self.user2 = CustomUser.objects.create_user(
            email="chat_user2@example.com",
            password="Password123",
            account_type="RECRUITER",
            is_verified=True,
            is_active=True
        )
        self.user3 = CustomUser.objects.create_user(
            email="chat_user3@example.com",
            password="Password123",
            account_type="CANDIDATE",
            is_verified=True,
            is_active=True
        )
        
        # Create a thread between user1 and user2
        self.thread = MessageThreads.objects.create(thread_type='direct')
        ThreadParticipants.objects.create(thread=self.thread, user=self.user1)
        ThreadParticipants.objects.create(thread=self.thread, user=self.user2)
        
        # Create a message in the thread
        self.msg = Messages.objects.create(
            thread=self.thread,
            sender=self.user1,
            content="Hello there!"
        )

    def test_message_view_blocks_non_participants(self):
        # Authenticate user3 who is not a participant
        self.client.force_authenticate(user=self.user3)
        url = reverse('message_list', kwargs={"thread_id": self.thread.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_thread_list_excludes_unrelated_threads(self):
        # Authenticate user3, should see 0 threads
        self.client.force_authenticate(user=self.user3)
        url = reverse('thread_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

        # Authenticate user1, should see 1 thread
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_mark_thread_read_blocks_non_participants(self):
        self.client.force_authenticate(user=self.user3)
        url = reverse('mark_thread_read', kwargs={"thread_id": self.thread.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403)

    def test_create_thread_success(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('thread_list')
        response = self.client.post(url, {"participant_id": str(self.user3.id)})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["thread_type"], "direct")
        self.assertIn("id", response.data)

        # Check participants
        thread_id = response.data["id"]
        participants = ThreadParticipants.objects.filter(thread_id=thread_id).values_list('user_id', flat=True)
        self.assertEqual(len(participants), 2)
        self.assertIn(self.user1.id, participants)
        self.assertIn(self.user3.id, participants)

    def test_create_thread_duplicate_returns_existing(self):
        # Already has direct thread between user1 and user2
        self.client.force_authenticate(user=self.user1)
        url = reverse('thread_list')
        response = self.client.post(url, {"participant_id": str(self.user2.id)})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(self.thread.id))
        self.assertEqual(response.data["message"], "Thread already exists.")

    def test_create_thread_with_self_fails(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('thread_list')
        response = self.client.post(url, {"participant_id": str(self.user1.id)})
        self.assertEqual(response.status_code, 400)
        self.assertIn("yourself", response.data["error"])

    def test_create_thread_nonexistent_user_fails(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('thread_list')
        import uuid
        random_id = uuid.uuid4()
        response = self.client.post(url, {"participant_id": str(random_id)})
        self.assertEqual(response.status_code, 404)
        self.assertIn("does not exist", response.data["error"])
