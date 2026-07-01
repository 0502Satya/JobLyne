from django.urls import path
from .admin_views import (
    AdminLoginView, AdminStatsView, AdminCompanyView, AdminCompanyDetailView,
    AdminCandidateView, AdminCandidateDetailView, AdminJobView, AdminJobDetailView,
    AdminManagementView, AdminAuditLogsView, AdminSupportReportsView
)

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin_login'),
    path('stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('companies/', AdminCompanyView.as_view(), name='admin_companies'),
    path('companies/<uuid:company_id>/', AdminCompanyDetailView.as_view(), name='admin_company_detail'),
    path('candidates/', AdminCandidateView.as_view(), name='admin_candidates'),
    path('candidates/<uuid:candidate_id>/', AdminCandidateDetailView.as_view(), name='admin_candidate_detail'),
    path('jobs/', AdminJobView.as_view(), name='admin_jobs'),
    path('jobs/<uuid:job_id>/', AdminJobDetailView.as_view(), name='admin_job_detail'),
    path('admins/', AdminManagementView.as_view(), name='admin_management'),
    path('logs/', AdminAuditLogsView.as_view(), name='admin_audit_logs'),
    path('reports/', AdminSupportReportsView.as_view(), name='admin_reports'),
]
