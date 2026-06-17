from django.urls import path
from .views import (
    SignupView, VerifyOTPView, LoginView, SocialLoginView,
    RecruiterSignupView, CompanySignupView, ThrottledTokenRefreshView,
    UserProfileView, ResendOTPView
)

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend_otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('social/login/', SocialLoginView.as_view(), name='social_login'),
    path('token/refresh/', ThrottledTokenRefreshView.as_view(), name='token_refresh'),
    path('recruiter/signup/', RecruiterSignupView.as_view(), name='recruiter_signup'),
    path('company/signup/', CompanySignupView.as_view(), name='company_signup'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
