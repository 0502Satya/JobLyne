from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ThreadListView, MessageListView, MarkReadView,
    NotificationListView, NotificationMarkReadView, NotificationPreferencesView,
    SavedSearchesViewSet
)

router = DefaultRouter()
router.register(r'saved-searches', SavedSearchesViewSet, basename='saved-search')

urlpatterns = [
    path('messages/threads/', ThreadListView.as_view(), name='thread_list'),
    path('messages/threads/<uuid:thread_id>/messages/', MessageListView.as_view(), name='message_list'),
    path('messages/threads/<uuid:thread_id>/read/', MarkReadView.as_view(), name='mark_thread_read'),
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/<uuid:pk>/read/', NotificationMarkReadView.as_view(), name='notification_mark_read'),
    path('notifications/preferences/', NotificationPreferencesView.as_view(), name='notification_preferences'),
    path('', include(router.urls)),
]
