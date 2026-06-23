from django.urls import path
from .views import (
    CompanyProfileView, RecruiterDashboardDataView, RecruiterCandidateActionView,
    CompanyTeamListView, CompanyTeamInviteView, AcceptTeamInvitationView,
    PublicCompanyProfileView, RecruiterProfileView,
    CompanyFileUploadView, CompanySubmitVerificationView,
    AdminPendingCompaniesView, AdminVerifyActionView
)

urlpatterns = [
    path('company/profile/', CompanyProfileView.as_view(), name='company_profile'),
    path('company/team/', CompanyTeamListView.as_view(), name='company_team_list'),
    path('company/team/<uuid:member_id>/', CompanyTeamListView.as_view(), name='company_team_remove'),
    path('company/team/invite/', CompanyTeamInviteView.as_view(), name='company_team_invite'),
    path('company/team/accept/', AcceptTeamInvitationView.as_view(), name='company_team_accept'),
    path('company/public/<uuid:company_id>/', PublicCompanyProfileView.as_view(), name='public_company_profile'),
    path('company/upload/', CompanyFileUploadView.as_view(), name='company_file_upload'),
    path('company/verify/submit/', CompanySubmitVerificationView.as_view(), name='company_submit_verification'),
    path('admin/companies/pending/', AdminPendingCompaniesView.as_view(), name='admin_pending_companies'),
    path('admin/companies/<uuid:company_id>/verify/', AdminVerifyActionView.as_view(), name='admin_verify_action'),
    path('recruiter/dashboard/', RecruiterDashboardDataView.as_view(), name='recruiter_dashboard'),
    path('recruiter/candidate-action/', RecruiterCandidateActionView.as_view(), name='recruiter_candidate_action'),
    path('recruiter/profile/', RecruiterProfileView.as_view(), name='recruiter_profile'),
]
