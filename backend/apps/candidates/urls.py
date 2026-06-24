from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CandidateProfileView, ActionPlanView, SavedJobViewSet, CandidateComparisonView, RecordProfileViewView

router = DefaultRouter()
router.register(r'saved-jobs', SavedJobViewSet, basename='saved-job')

urlpatterns = [
    path('candidate/profile/', CandidateProfileView.as_view(), name='candidate_profile'),
    path('candidate/action-plan/', ActionPlanView.as_view(), name='action_plan'),
    path('candidate/compare/', CandidateComparisonView.as_view(), name='candidate_compare'),
    path('candidate/profile/<uuid:job_seeker_id>/view/', RecordProfileViewView.as_view(), name='record_profile_view'),
    path('', include(router.urls)),
]
