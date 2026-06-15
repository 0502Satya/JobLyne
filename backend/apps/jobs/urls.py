from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobListView, JobDetailView, ApplicationViewSet, CloneJobView, GenerateJDView

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('jobs/', JobListView.as_view(), name='job_list'),
    path('jobs/<uuid:pk>/', JobDetailView.as_view(), name='job_detail'),
    path('jobs/<uuid:pk>/clone/', CloneJobView.as_view(), name='clone_job'),
    path('jobs/generate-jd/', GenerateJDView.as_view(), name='generate_jd'),
    path('applications/stats/', ApplicationViewSet.as_view({'get': 'get_stats'}), name='application_stats'),
    path('', include(router.urls)),
]
