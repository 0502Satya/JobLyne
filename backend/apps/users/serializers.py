import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction

from apps.companies.models import Companies, Recruiters
from apps.candidates.models import JobSeekers

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
            'email': {'validators': []}
        }

    def validate(self, attrs):
        email = attrs.get('email')
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        
        password = attrs.get('password')
        if not re.search(r'\d', password) or not re.search(r'[a-zA-Z]', password):
             raise serializers.ValidationError({"password": "Password must contain at least one letter and one number."})
             
        valid_choices = [choice[0] for choice in User.ACCOUNT_TYPE_CHOICES]
        role = attrs.get('account_type')
        if role and role not in valid_choices:
             raise serializers.ValidationError({"account_type": f"Invalid role. Must be one of: {', '.join(valid_choices)}"})
             
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
        
        user, created = User.objects.update_or_create(
            email=email,
            defaults={
                'account_type': account_type,
                'first_name': first_name,
                'last_name': last_name,
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
            names = validated_data['full_name'].split(' ', 1)
            first_name = names[0]
            last_name = names[1] if len(names) > 1 else ""

            user, created = User.objects.update_or_create(
                email=email,
                defaults={
                    'account_type': 'RECRUITER',
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_active': False
                }
            )
            user.set_password(validated_data['password'])
            user.save()

            Recruiters.objects.update_or_create(
                user=user,
                defaults={'agency_name': validated_data['company_name']}
            )
            
        return user

class CompanySignupSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255, required=True)
    tax_id = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    industry = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    size = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    website = serializers.URLField(max_length=255, required=False, allow_blank=True, allow_null=True)
    cin_number = serializers.CharField(max_length=50, required=True)
    gstin_number = serializers.CharField(max_length=50, required=True)
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        
        password = attrs.get('password')
        if not re.search(r'\d', password) or not re.search(r'[a-zA-Z]', password):
             raise serializers.ValidationError({"password": "Password must contain at least one letter and one number."})
             
        email = attrs.get('email')
        if User.objects.filter(email=email, is_verified=True).exists():
            raise serializers.ValidationError({"email": "User with this email already exists and is verified."})
            
        # Block common public email domains
        public_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com']
        email_domain = email.split('@')[-1].lower().strip()
        if email_domain in public_domains:
            raise serializers.ValidationError({"email": "Registration is only permitted with a corporate email address (public email domains like Gmail, Yahoo, etc., are not allowed)."})
            
        tax_id = attrs.get('tax_id')
        if tax_id and tax_id.strip() and Companies.objects.filter(tax_id=tax_id).exists():
            raise serializers.ValidationError({"tax_id": "Company with this tax ID already exists."})
             
        # Validate CIN format
        cin = attrs.get('cin_number')
        cin_regex = r'^[ULul]\d{5}[A-Za-z]{2}\d{4}[A-Za-z]{3}\d{6}$'
        if not re.match(cin_regex, cin):
            raise serializers.ValidationError({"cin_number": "Invalid CIN format. Standard 21-digit alphanumeric CIN expected (e.g. U12345MH2026PTC123456)."})

        # Validate GSTIN format
        gstin = attrs.get('gstin_number')
        gstin_regex = r'^\d{2}[A-Za-z]{5}\d{4}[A-Za-z]{1}\d{1}[Zz]{1}[A-Za-z\d]{1}$'
        if not re.match(gstin_regex, gstin):
            raise serializers.ValidationError({"gstin_number": "Invalid GSTIN format. Standard 15-digit GSTIN expected (e.g. 27AAAAA1111A1Z1)."})

        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            company, _ = Companies.objects.update_or_create(
                cin_number=validated_data['cin_number'],
                defaults={
                    'name': validated_data['company_name'],
                    'industry': validated_data.get('industry', ''),
                    'website': validated_data.get('website', ''),
                    'tax_id': validated_data.get('tax_id') or '',
                    'gstin_number': validated_data['gstin_number']
                }
            )
            
            user, created = User.objects.update_or_create(
                email=validated_data['email'],
                defaults={
                    'account_type': 'COMPANY',
                    'is_active': False,
                    'company': company,
                    'team_role': 'ADMIN'
                }
            )
            user.set_password(validated_data['password'])
            user.save()
            
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

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'profile_photo_url', 'account_type', 'team_role')
        read_only_fields = ('id', 'email', 'account_type', 'team_role')

