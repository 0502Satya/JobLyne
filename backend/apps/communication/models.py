import uuid
from django.db import models

class SearchQueries(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='search_queries_user')
    query_text = models.CharField(max_length=255, null=True, blank=True)
    filters = models.JSONField(null=True, blank=True)
    result_count = models.IntegerField(null=True, blank=True)
    searched_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'search_queries'

class SavedSearches(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='saved_searches_user')
    search_type = models.CharField(max_length=255, null=True, blank=True)
    search_criteria = models.JSONField(null=True, blank=True)
    alert_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'saved_searches'

class SearchResultClicks(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    search_query = models.ForeignKey('SearchQueries', on_delete=models.CASCADE, null=True, blank=True, related_name='search_result_clicks_search_query')
    entity_type = models.CharField(max_length=255, null=True, blank=True)
    entity_id = models.UUIDField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'search_result_clicks'

class NotificationPreferences(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='notification_preferences_user')
    email_enabled = models.BooleanField(default=False)
    sms_enabled = models.BooleanField(default=False)
    push_enabled = models.BooleanField(default=False)
    marketing_enabled = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'notification_preferences'

class NotificationTemplates(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template_key = models.CharField(max_length=255, null=True, blank=True)
    subject_template = models.TextField(null=True, blank=True)
    body_template = models.TextField(null=True, blank=True)
    channel = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'notification_templates'

class Notifications(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications_user')
    template = models.ForeignKey('NotificationTemplates', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications_template')
    channel = models.CharField(max_length=255, null=True, blank=True)
    content = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'notifications'

class MessageThreads(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread_type = models.CharField(max_length=255, null=True, blank=True)
    reference_entity_type = models.CharField(max_length=255, null=True, blank=True)
    reference_entity_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'message_threads'

class ThreadParticipants(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey('MessageThreads', on_delete=models.CASCADE, null=True, blank=True, related_name='thread_participants_thread')
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='thread_participants_user')
    role = models.CharField(max_length=255, null=True, blank=True)
    joined_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'thread_participants'
        unique_together = [['thread', 'user']]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['thread']),
        ]

class Messages(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey('MessageThreads', on_delete=models.CASCADE, null=True, blank=True, related_name='messages_thread')
    sender = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='messages_sender')
    message_type = models.CharField(max_length=255, null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    attachment_url = models.URLField(max_length=500, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'messages'
        indexes = [
            models.Index(fields=['thread', 'sent_at']),
            models.Index(fields=['thread', 'is_read']),
        ]

class InterviewNotifications(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey('jobs.Applications', on_delete=models.CASCADE, null=True, blank=True, related_name='interview_notifications_application')
    recruiter = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='interview_notifications_recruiter')
    job_seeker = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='interview_notifications_job_seeker')
    scheduled_time = models.DateTimeField(null=True, blank=True)
    meeting_link = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'interview_notifications'

class CommunicationDeliveryLogs(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification = models.ForeignKey('Notifications', on_delete=models.CASCADE, null=True, blank=True, related_name='communication_delivery_logs_notification')
    provider_name = models.CharField(max_length=255, null=True, blank=True)
    provider_message_id = models.CharField(max_length=255, null=True, blank=True)
    delivery_status = models.CharField(max_length=255, null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'communication_delivery_logs'

class CalendarEvents(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey('jobs.Applications', on_delete=models.CASCADE, null=True, blank=True, related_name='calendar_events')
    candidate = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='candidate_calendar_events')
    organizer = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='organized_calendar_events')
    scheduled_time = models.DateTimeField()
    meeting_link = models.TextField(null=True, blank=True)
    rsvp_status = models.CharField(max_length=50, default='PENDING') # PENDING, ACCEPTED, DECLINED
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'calendar_events'

