import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction

from ..models import (
    Companies, JobSeekers, Recruiters, AdvertiserAccounts
)

User = get_user_model()

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'password_confirm', 'account_type', 'marketing_consent', 'data_processing_consent', 'first_name', 'last_name')
        read_only_fields = ('id',)
        extra_kwargs = {
            'email': {'validators': []} # Remove UniqueValidator to handle unverified re-signup manually
        }

    def validate(self, attrs):
        email = attrs.get('email')
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        
        # Simple password validation (require letter and number)
        password = attrs.get('password')
        if not re.search(r'\d', password) or not re.search(r'[a-zA-Z]', password):
             raise serializers.ValidationError({"password": "Password must contain at least one letter and one number."})
             
        # Validate account_type matches choices
        valid_choices = [choice[0] for choice in User.ACCOUNT_TYPE_CHOICES]
        role = attrs.get('account_type')
        if role and role not in valid_choices:
             raise serializers.ValidationError({"account_type": f"Invalid role. Must be one of: {', '.join(valid_choices)}"})
             
        # Check if user exists but is verified
        existing_user = User.objects.filter(email=email).first()
        if existing_user and existing_user.is_verified:
            raise serializers.ValidationError({"email": "User with this email already exists and is verified."})
            
        return attrs

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        
        account_type = validated_data.get('account_type', 'CANDIDATE')
        
        # Use update_or_create logic for unverified users
        user, created = User.objects.update_or_create(
            email=email,
            defaults={
                'account_type': account_type,
                'marketing_consent': validated_data.get('marketing_consent', False),
                'data_processing_consent': validated_data.get('data_processing_consent', False),
                'is_active': False
            }
        )
        
        user.set_password(password)
        user.save()
        
        if account_type == 'CANDIDATE':
            full_name = f"{first_name} {last_name}".strip()
            JobSeekers.objects.update_or_create(
                user=user,
                defaults={'full_name': full_name}
            )
        elif account_type == 'RECRUITER':
            Recruiters.objects.update_or_create(
                user=user,
                defaults={'agency_name': f"{first_name} {last_name}".strip() or "Recruiter"}
            )
            
        return user


class RecruiterSignupSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True)
    company_name = serializers.CharField(max_length=255, required=True)
    designation = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        
        password = attrs.get('password')
        if not re.search(r'\d', password) or not re.search(r'[a-zA-Z]', password):
             raise serializers.ValidationError({"password": "Password must contain at least one letter and one number."})
             
        if User.objects.filter(email=attrs.get('email'), is_verified=True).exists():
            raise serializers.ValidationError({"email": "User with this email already exists and is verified."})
             
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            email = validated_data['email']
            # Use update_or_create logic for unverified users
            user, created = User.objects.update_or_create(
                email=email,
                defaults={
                    'account_type': 'RECRUITER',
                    'is_active': False
                }
            )
            user.set_password(validated_data['password'])
            user.save()
            
            # For recruiter, we map full_name components to first/last if possible
            names = validated_data['full_name'].split(' ', 1)
            first_name = names[0]
            last_name = names[1] if len(names) > 1 else ""
            
            user.first_name = first_name
            user.last_name = last_name
            user.save()

            # Create or update specialized recruiter/company records
            # Note: This is simplified matching the provided logic
            Recruiters.objects.update_or_create(
                user=user,
                defaults={'agency_name': validated_data['company_name']}
            )
            
        return user


class CompanySignupSerializer(serializers.Serializer):
    # Company Data
    company_name = serializers.CharField(max_length=255, required=True)
    tax_id = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    industry = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    size = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    website = serializers.URLField(max_length=255, required=False, allow_blank=True, allow_null=True)
    
    # User Admin Data
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        
        password = attrs.get('password')
        if not re.search(r'\d', password) or not re.search(r'[a-zA-Z]', password):
             raise serializers.ValidationError({"password": "Password must contain at least one letter and one number."})
             
        # Check if email is already taken and verified
        if User.objects.filter(email=attrs.get('email'), is_verified=True).exists():
            raise serializers.ValidationError({"email": "User with this email already exists and is verified."})
            
        # Check if company tax_id or name exists
        tax_id = attrs.get('tax_id')
        if tax_id and tax_id.strip() and Companies.objects.filter(tax_id=tax_id).exists():
            raise serializers.ValidationError({"tax_id": "Company with this tax ID already exists."})
             
        return attrs

    def create(self, validated_data):
        # We handle this manually in the view via transaction, but we can also do it here
        with transaction.atomic():
            company, _ = Companies.objects.update_or_create(
                name=validated_data['company_name'],
                defaults={
                    'industry': validated_data.get('industry', ''),
                    'website': validated_data.get('website', '')
                }
            )
            
            # Use update_or_create for unverified user
            user, created = User.objects.update_or_create(
                email=validated_data['email'],
                defaults={
                    'account_type': 'COMPANY',
                    'is_active': False
                }
            )
            user.set_password(validated_data['password'])
            user.save()
            
            Recruiters.objects.create(
                user=user,
                agency_name=company.name
            )
            
            # Link user to company for advertiser context (useful for organization discovery)
            AdvertiserAccounts.objects.update_or_create(
                user=user,
                company=company,
                defaults={'advertiser_type': 'COMPANY_ADMIN'}
            )
            
        return user


class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'account_type', 'is_verified', 'created_at')


class SocialAuthSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=['google', 'linkedin'])
    token = serializers.CharField()


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(max_length=6, required=True)
