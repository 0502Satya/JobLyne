from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import (
    UserSignupSerializer, UserResponseSerializer, 
    CompanySignupSerializer, CompanyProfileSerializer,
    CandidateProfileSerializer, SocialAuthSerializer,
    RecruiterSignupSerializer, VerifyOTPSerializer
)
from .models import Companies, AdvertiserAccounts, JobSeekers, CustomUser, Recruiters, EmailVerificationOTP
from .social_auth_utils import verify_google_token, verify_linkedin_token
from .utils import send_otp_email
import random
import string

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    # Add custom claims
    refresh['role'] = user.account_type
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class SignupView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'signup'

    def post(self, request, *args, **kwargs):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate OTP
            otp_code = ''.join(random.choices(string.digits, k=6))
            EmailVerificationOTP.objects.create(user=user, otp_code=otp_code)
            
            # Send OTP email
            send_otp_email(user.email, otp_code)
            
            user_data = UserResponseSerializer(user).data
            
            return Response({
                'message': 'User registered. Please verify your email with the OTP sent.',
                'user': user_data,
                'requires_verification': True
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate user
        user = authenticate(request, email=email, password=password)

        if user is not None:
            if not user.is_active:
                return Response({'error': 'This account is inactive.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            tokens = get_tokens_for_user(user)
            user_data = UserResponseSerializer(user).data
            
            return Response({
                'message': 'Login successful.',
                'user': user_data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class CompanySignupView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'signup'

    def post(self, request, *args, **kwargs):
        serializer = CompanySignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate OTP
            otp_code = ''.join(random.choices(string.digits, k=6))
            EmailVerificationOTP.objects.create(user=user, otp_code=otp_code)
            
            # Send OTP email
            send_otp_email(user.email, otp_code)
            
            user_data = UserResponseSerializer(user).data
            
            return Response({
                'message': 'Company and admin registered. Please verify your email with the OTP sent.',
                'user': user_data,
                'requires_verification': True
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecruiterSignupView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'signup'
    def post(self, request, *args, **kwargs):
        serializer = RecruiterSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate OTP
            otp_code = ''.join(random.choices(string.digits, k=6))
            EmailVerificationOTP.objects.create(user=user, otp_code=otp_code)
            
            # Send OTP email
            send_otp_email(user.email, otp_code)
            
            user_data = UserResponseSerializer(user).data
            
            return Response({
                'message': 'Recruiter registered. Please verify your email with the OTP sent.',
                'user': user_data,
                'requires_verification': True
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_company(self, user):
        try:
            # Find company linked to this user
            adv_account = AdvertiserAccounts.objects.get(user=user)
            return adv_account.company
        except AdvertiserAccounts.DoesNotExist:
            return None

    def get(self, request):
        company = self.get_company(request.user)
        if not company:
            return Response({"error": "No company associated with this user."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CompanyProfileSerializer(company)
        return Response(serializer.data)

    def patch(self, request):
        company = self.get_company(request.user)
        if not company:
            return Response({"error": "No company associated with this user."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CompanyProfileSerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CandidateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_job_seeker(self, user):
        try:
            return JobSeekers.objects.get(user=user)
        except JobSeekers.DoesNotExist:
            return None

    def get(self, request):
        job_seeker = self.get_job_seeker(request.user)
        if not job_seeker:
            return Response({"error": "No profile found for this user."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CandidateProfileSerializer(job_seeker)
        return Response(serializer.data)

    def patch(self, request):
        job_seeker = self.get_job_seeker(request.user)
        if not job_seeker:
            return Response({"error": "No profile found for this user."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CandidateProfileSerializer(job_seeker, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SocialLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = SocialAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        provider = serializer.validated_data['provider']
        token = serializer.validated_data['token']
        
        user_info = None
        if provider == 'google':
            user_info = verify_google_token(token)
        elif provider == 'linkedin':
            user_info = verify_linkedin_token(token)

        if not user_info:
            return Response({'error': 'Invalid social token or provider error.'}, status=status.HTTP_400_BAD_REQUEST)

        email = user_info['email']
        
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                'account_type': 'CANDIDATE',
                'is_active': True,
                'is_verified': True,
            }
        )

        if created:
            user.set_unusable_password()
            user.save()
        else:
            # If user exists, ensure they are verified (social verified)
            if not user.is_verified:
                user.is_verified = True
                user.save()

        if created:
            # Create JobSeeker profile
            full_name = f"{user_info.get('first_name', '')} {user_info.get('last_name', '')}".strip()
            JobSeekers.objects.create(
                user=user,
                full_name=full_name or "Candidate"
            )
        
        tokens = get_tokens_for_user(user)
        user_data = UserResponseSerializer(user).data
        
        return Response({
            'message': 'Social login successful.',
            'user': user_data,
            'tokens': tokens,
            'is_new_user': created
        }, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'otp'

    def post(self, request, *args, **kwargs):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid OTP or email.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_record = EmailVerificationOTP.objects.filter(user=user).latest('created_at')
        except EmailVerificationOTP.DoesNotExist:
            return Response({'error': 'No active OTP found for this email.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check lockout
        if otp_record.attempts >= 5:
            return Response({'error': 'This OTP is locked due to too many failed attempts. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for expiry (e.g., 10 minutes)
        from django.utils import timezone
        if (timezone.now() - otp_record.created_at).total_seconds() > 600:
            return Response({'error': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the code matches
        if otp_record.otp_code != otp_code:
            otp_record.attempts += 1
            otp_record.save()
            remaining = 5 - otp_record.attempts
            if remaining <= 0:
                return Response({'error': 'Too many failed attempts. This OTP has been locked. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': f'Invalid OTP code. {remaining} attempts remaining.'}, status=status.HTTP_400_BAD_REQUEST)

        # Success
        user.is_verified = True
        user.is_active = True
        user.save()
        
        # Cleanup OTPs for this user
        EmailVerificationOTP.objects.filter(user=user).delete()
        
        tokens = get_tokens_for_user(user)
        user_data = UserResponseSerializer(user).data
        
        return Response({
            'message': 'Email verified successfully.',
            'user': user_data,
            'tokens': tokens
        }, status=status.HTTP_200_OK)
