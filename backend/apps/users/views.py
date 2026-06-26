from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db import transaction
import hashlib
import random
import string
import uuid

from apps.users.serializers import (
    UserSignupSerializer, UserResponseSerializer, 
    CompanySignupSerializer, SocialAuthSerializer,
    RecruiterSignupSerializer, VerifyOTPSerializer,
    UserProfileSerializer
)
from apps.users.models import CustomUser, EmailVerificationOTP, PasswordResetToken
from apps.companies.models import Companies, Recruiters
from apps.candidates.models import JobSeekers
from apps.commerce.models import AdvertiserAccounts
from apps.users.social_auth_utils import verify_google_token, verify_linkedin_token
from apps.users.utils import send_otp_email, send_password_reset_email

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.account_type
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def hash_otp(otp_code: str) -> str:
    return hashlib.sha256(otp_code.encode()).hexdigest()

class SignupView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'signup'

    def post(self, request, *args, **kwargs):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            otp_code = ''.join(random.choices(string.digits, k=6))
            otp_hash = hash_otp(otp_code)
            EmailVerificationOTP.objects.create(user=user, otp_hash=otp_hash)
            
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

        try:
            user_obj = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            user_obj = None

        if user_obj and user_obj.failed_login_attempts and user_obj.failed_login_attempts >= 10:
            return Response({'error': 'Account is locked due to too many failed login attempts. Please contact support.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        user = authenticate(request, email=email, password=password)

        if user is not None:
            if not user.is_active:
                return Response({'error': 'This account is inactive.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if user.failed_login_attempts != 0:
                user.failed_login_attempts = 0
                user.save(update_fields=['failed_login_attempts'])
            
            tokens = get_tokens_for_user(user)
            user_data = UserResponseSerializer(user).data
            
            return Response({
                'message': 'Login successful.',
                'user': user_data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        else:
            if user_obj:
                attempts = user_obj.failed_login_attempts or 0
                user_obj.failed_login_attempts = attempts + 1
                user_obj.save(update_fields=['failed_login_attempts'])
                if user_obj.failed_login_attempts >= 10:
                    return Response({'error': 'Account is locked due to too many failed login attempts. Please contact support.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class CompanySignupView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'signup'

    def post(self, request, *args, **kwargs):
        serializer = CompanySignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            otp_code = ''.join(random.choices(string.digits, k=6))
            otp_hash = hash_otp(otp_code)
            EmailVerificationOTP.objects.create(user=user, otp_hash=otp_hash)
            
            send_otp_email(user.email, otp_code)
            user_data = UserResponseSerializer(user).data
            
            return Response({
                'message': 'Company registered. Please verify your email with the OTP sent.',
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
            
            otp_code = ''.join(random.choices(string.digits, k=6))
            otp_hash = hash_otp(otp_code)
            EmailVerificationOTP.objects.create(user=user, otp_hash=otp_hash)
            
            send_otp_email(user.email, otp_code)
            user_data = UserResponseSerializer(user).data
            
            return Response({
                'message': 'Recruiter registered. Please verify your email with the OTP sent.',
                'user': user_data,
                'requires_verification': True
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SocialLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'login'

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
            if not user.is_verified:
                user.is_verified = True
                user.save()

        if created:
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

        if otp_record.attempts >= 5:
            return Response({'error': 'This OTP is locked due to too many failed attempts. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if (timezone.now() - otp_record.created_at).total_seconds() > 600:
            return Response({'error': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_hash_attempt = hash_otp(otp_code)
        if otp_record.otp_hash != otp_hash_attempt:
            otp_record.attempts += 1
            otp_record.save()
            remaining = 5 - otp_record.attempts
            if remaining <= 0:
                return Response({'error': 'Too many failed attempts. This OTP has been locked. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': f'Invalid OTP code. {remaining} attempts remaining.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.is_active = True
        user.save()
        
        EmailVerificationOTP.objects.filter(user=user).delete()
        
        tokens = get_tokens_for_user(user)
        user_data = UserResponseSerializer(user).data
        
        return Response({
            'message': 'Email verified successfully.',
            'user': user_data,
            'tokens': tokens
        }, status=status.HTTP_200_OK)

class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_scope = 'token_refresh'

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'otp'

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'message': 'If the email exists, a new OTP has been sent.'}, status=status.HTTP_200_OK)

        if user.is_verified and user.is_active:
            return Response({'error': 'This email has already been verified.'}, status=status.HTTP_400_BAD_REQUEST)

        # Invalidate old OTPs
        EmailVerificationOTP.objects.filter(user=user).delete()

        # Generate new OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        otp_hash = hash_otp(otp_code)
        EmailVerificationOTP.objects.create(user=user, otp_hash=otp_hash)

        send_otp_email(user.email, otp_code)

        return Response({'message': 'If the email exists, a new OTP has been sent.'}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'otp'

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'message': 'If the email exists, a password reset link has been sent.'}, status=status.HTTP_200_OK)

        PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)

        reset_token = uuid.uuid4().hex
        expires_at = timezone.now() + timezone.timedelta(hours=1)
        PasswordResetToken.objects.create(
            user=user,
            token=reset_token,
            expires_at=expires_at
        )

        send_password_reset_email(user.email, reset_token)

        return Response({'message': 'If the email exists, a password reset link has been sent.'}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'otp'

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        password = request.data.get('password')

        if not token or not password:
            return Response({'error': 'Both token and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reset_token_obj = PasswordResetToken.objects.get(token=token, is_used=False)
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        if reset_token_obj.expires_at < timezone.now():
            reset_token_obj.is_used = True
            reset_token_obj.save()
            return Response({'error': 'Reset token has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user = reset_token_obj.user
            user.set_password(password)
            user.save()

            reset_token_obj.is_used = True
            reset_token_obj.save()

            PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)

        return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({'error': 'Both current and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(current_password):
            return Response({'error': 'Incorrect current password.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)


