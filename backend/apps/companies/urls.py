from django.urls import path
from .views import (
    CompanyProfileView, RecruiterDashboardDataView, RecruiterCandidateActionView,
    CompanyTeamListView, CompanyTeamInviteView, AcceptTeamInvitationView,
    PublicCompanyProfileView, RecruiterProfileView
)

urlpatterns = [
    path('company/profile/', CompanyProfileView.as_view(), name='company_profile'),
    path('company/team/', CompanyTeamListView.as_view(), name='company_team_list'),
    path('company/team/invite/', CompanyTeamInviteView.as_view(), name='company_team_invite'),
    path('company/team/accept/', AcceptTeamInvitationView.as_view(), name='company_team_accept'),
    path('company/public/<uuid:company_id>/', PublicCompanyProfileView.as_view(), name='public_company_profile'),
    path('recruiter/dashboard/', RecruiterDashboardDataView.as_view(), name='recruiter_dashboard'),
    path('recruiter/candidate-action/', RecruiterCandidateActionView.as_view(), name='recruiter_candidate_action'),
    path('recruiter/profile/', RecruiterProfileView.as_view(), name='recruiter_profile'),
]
