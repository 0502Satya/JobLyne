import uuid
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.db.models import OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

from apps.communication.models import (
    MessageThreads, ThreadParticipants, Messages, Notifications,
    NotificationPreferences, SavedSearches, NotificationTemplates
)
from apps.users.models import CustomUser
from apps.candidates.models import JobSeekers
from apps.companies.models import Recruiters, Companies
from apps.users.pagination import StandardPagination

def clean_attachment_url(url_val):
    if not url_val:
        return None
    url_val = str(url_val).strip()
    if url_val.lower().startswith(('javascript:', 'data:')):
        return None
    validator = URLValidator(schemes=['http', 'https', 'ftp', 'ftps'])
    try:
        validator(url_val)
        return url_val
    except ValidationError:
        return None

# --- Serializers ---

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplates
        fields = ['id', 'template_key', 'subject_template', 'body_template', 'channel']

class NotificationSerializer(serializers.ModelSerializer):
    template_key = serializers.CharField(source='template.template_key', read_only=True)
    subject = serializers.CharField(source='template.subject_template', read_only=True)
    body = serializers.CharField(source='template.body_template', read_only=True)

    class Meta:
        model = Notifications
        fields = [
            'id', 'channel', 'content', 'status', 
            'sent_at', 'read_at', 'template_key', 'subject', 'body'
        ]

class NotificationPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreferences
        fields = ['id', 'email_enabled', 'sms_enabled', 'push_enabled', 'marketing_enabled', 'updated_at']
        read_only_fields = ['id', 'updated_at']

class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearches
        fields = ['id', 'search_type', 'search_criteria', 'alert_enabled', 'created_at']
        read_only_fields = ['id', 'created_at']

# --- Views ---

class ThreadListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        my_thread_ids = ThreadParticipants.objects.filter(user=request.user).values_list('thread_id', flat=True)
        
        latest_msg_time = Messages.objects.filter(
            thread=OuterRef('pk')
        ).order_by('-sent_at').values('sent_at')[:1]

        threads = MessageThreads.objects.filter(
            id__in=my_thread_ids
        ).annotate(
            latest_msg_at=Coalesce(Subquery(latest_msg_time), 'created_at')
        ).prefetch_related(
            'thread_participants_thread__user',
            'messages_thread__sender'
        ).order_by('-latest_msg_at')

        other_user_ids = []
        thread_other_user_map = {}
        
        for thread in threads:
            other_part = None
            participants = list(thread.thread_participants_thread.all())
            for p in participants:
                if p.user != request.user:
                    other_part = p.user
                    break
            
            if not other_part and participants:
                other_part = participants[0].user
                
            if other_part:
                other_user_ids.append(other_part.id)
                thread_other_user_map[thread.id] = other_part

        seekers = {s.user_id: s for s in JobSeekers.objects.filter(user_id__in=other_user_ids)}
        recruiters = {r.user_id: r for r in Recruiters.objects.filter(user_id__in=other_user_ids)}
        companies = {u.id: u.company for u in CustomUser.objects.filter(id__in=other_user_ids).select_related('company') if u.company}

        thread_list_data = []
        for thread in threads:
            other_user = thread_other_user_map.get(thread.id)
            other_participant_data = {
                "id": str(request.user.id),
                "email": request.user.email,
                "account_type": request.user.account_type or "CANDIDATE",
                "name": request.user.email,
                "headline": "You",
                "avatar": request.user.profile_photo_url or ""
            }

            if other_user:
                other_participant_data = {
                    "id": str(other_user.id),
                    "email": other_user.email,
                    "account_type": other_user.account_type or "CANDIDATE",
                    "name": other_user.email,
                    "headline": "User",
                    "avatar": other_user.profile_photo_url or ""
                }

                if other_user.account_type == 'CANDIDATE':
                    seeker = seekers.get(other_user.id)
                    if seeker:
                        other_participant_data["name"] = seeker.full_name or other_user.email
                        other_participant_data["headline"] = seeker.headline or "Job Seeker"
                elif other_user.account_type == 'RECRUITER':
                    recruiter = recruiters.get(other_user.id)
                    if recruiter:
                        other_participant_data["name"] = recruiter.agency_name or "Recruiter"
                        other_participant_data["headline"] = "Recruiter Agent"
                elif other_user.account_type == 'COMPANY':
                    comp = companies.get(other_user.id)
                    if comp:
                        other_participant_data["name"] = comp.name or "Company Admin"
                        other_participant_data["headline"] = comp.industry or "Company"

            msgs = list(thread.messages_thread.all())
            latest_msg = msgs[-1] if msgs else None
            unread_count = sum(1 for m in msgs if not m.is_read and m.sender != request.user)

            thread_list_data.append({
                "id": str(thread.id),
                "thread_type": thread.thread_type,
                "other_participant": other_participant_data,
                "last_message": {
                    "content": latest_msg.content if latest_msg else "",
                    "sent_at": latest_msg.sent_at if latest_msg else thread.created_at,
                    "sender_id": str(latest_msg.sender_id) if latest_msg else None
                },
                "unread_count": unread_count
            })

        return Response(thread_list_data)

    def post(self, request):
        participant_id = request.data.get('participant_id')
        if not participant_id:
            return Response({"error": "participant_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            other_user = CustomUser.objects.get(id=participant_id)
        except (CustomUser.DoesNotExist, ValidationError):
            return Response({"error": "User does not exist."}, status=status.HTTP_444_NOT_FOUND if False else status.HTTP_404_NOT_FOUND)

        if other_user == request.user:
            return Response({"error": "Cannot create a message thread with yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a direct thread already exists between these users
        common_threads = MessageThreads.objects.filter(
            thread_participants_thread__user=request.user
        ).filter(
            thread_participants_thread__user=other_user
        ).filter(thread_type='direct')

        existing_thread = common_threads.first()
        if existing_thread:
            return Response({
                "id": str(existing_thread.id),
                "thread_type": existing_thread.thread_type,
                "message": "Thread already exists."
            }, status=status.HTTP_200_OK)

        with transaction.atomic():
            thread = MessageThreads.objects.create(
                thread_type='direct',
                created_at=timezone.now()
            )
            ThreadParticipants.objects.create(thread=thread, user=request.user)
            ThreadParticipants.objects.create(thread=thread, user=other_user)

        return Response({
            "id": str(thread.id),
            "thread_type": thread.thread_type,
            "message": "Thread created successfully."
        }, status=status.HTTP_201_CREATED)


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, thread_id):
        # Verify user is participant in this thread
        is_participant = ThreadParticipants.objects.filter(thread_id=thread_id, user=request.user).exists()
        if not is_participant:
            raise PermissionDenied("You do not have access to this thread.")

        messages = Messages.objects.filter(thread_id=thread_id).order_by('sent_at')
        
        paginator = StandardPagination()
        page = paginator.paginate_queryset(messages, request)
        target_messages = page if page is not None else messages

        messages_data = []
        for m in target_messages:
            messages_data.append({
                "id": str(m.id),
                "sender_id": str(m.sender_id),
                "sender_email": m.sender.email if m.sender else "System",
                "content": m.content,
                "attachment_url": m.attachment_url,
                "is_read": m.is_read,
                "sent_at": m.sent_at
            })

        if page is not None:
            return paginator.get_paginated_response(messages_data)
        return Response(messages_data)

    def post(self, request, thread_id):
        is_participant = ThreadParticipants.objects.filter(thread_id=thread_id, user=request.user).exists()
        if not is_participant:
            raise PermissionDenied("You do not have access to this thread.")

        content = request.data.get('content', '').strip()
        attachment_url = clean_attachment_url(request.data.get('attachment_url'))

        if not content and not attachment_url:
            return Response({"error": "Cannot send empty message."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            msg = Messages.objects.create(
                thread_id=thread_id,
                sender=request.user,
                content=content,
                attachment_url=attachment_url,
                sent_at=timezone.now()
            )

        return Response({
            "id": str(msg.id),
            "sender_id": str(msg.sender_id),
            "content": msg.content,
            "attachment_url": msg.attachment_url,
            "sent_at": msg.sent_at
        }, status=status.HTTP_201_CREATED)


class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thread_id):
        # Verify user is participant in this thread
        is_participant = ThreadParticipants.objects.filter(thread_id=thread_id, user=request.user).exists()
        if not is_participant:
            raise PermissionDenied("You do not have access to this thread.")

        with transaction.atomic():
            Messages.objects.filter(
                thread_id=thread_id, 
                is_read=False
            ).exclude(
                sender=request.user
            ).update(is_read=True)

        return Response({"message": "Thread marked as read."}, status=status.HTTP_200_OK)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notifications.objects.filter(user=request.user).select_related('template').order_by('-sent_at')
        
        paginator = StandardPagination()
        page = paginator.paginate_queryset(notifications, request)
        target_notifications = page if page is not None else notifications

        serializer = NotificationSerializer(target_notifications, many=True)
        
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return Response(serializer.data)

    def post(self, request):
        Notifications.objects.filter(user=request.user, status='UNREAD').update(
            status='READ',
            read_at=timezone.now()
        )
        return Response({"message": "All notifications marked as read."})


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notif = Notifications.objects.get(pk=pk)
            if notif.user != request.user:
                raise PermissionDenied("You do not have permission to modify this notification.")
            notif.status = 'READ'
            notif.read_at = timezone.now()
            notif.save()
            return Response({"status": "READ"})
        except Notifications.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)


class NotificationPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pref, _ = NotificationPreferences.objects.get_or_create(
            user=request.user,
            defaults={
                "email_enabled": True,
                "sms_enabled": True,
                "push_enabled": True,
                "marketing_enabled": True
            }
        )
        serializer = NotificationPreferencesSerializer(pref)
        return Response(serializer.data)

    def patch(self, request):
        pref, _ = NotificationPreferences.objects.get_or_create(
            user=request.user,
            defaults={
                "email_enabled": True,
                "sms_enabled": True,
                "push_enabled": True,
                "marketing_enabled": True
            }
        )
        serializer = NotificationPreferencesSerializer(pref, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SavedSearchesViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedSearchSerializer

    def get_queryset(self):
        return SavedSearches.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
