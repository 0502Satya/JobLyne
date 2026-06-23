from rest_framework import serializers
from apps.companies.models import Companies

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Companies
        fields = [
            'id', 'name', 'description', 'website', 'logo_url', 
            'cover_image_url', 'industry', 'culture', 'benefits', 
            'city', 'country', 'tax_id', 'verified_badge',
            
            # Legal & Verification Fields
            'legal_name', 'registration_number', 'company_type', 
            'year_established', 'registered_address', 'official_email', 
            'phone_number', 'authorized_contact_name', 'authorized_contact_designation', 
            'id_proof_url', 'incorporation_doc_url', 'tax_doc_url', 'address_proof_url', 
            'verification_status', 'verification_notes',
            
            # Public Profile Extra Fields
            'company_size', 'headquarters_location', 'additional_locations', 
            'tagline', 'social_links',
            
            # Hiring Info Extra Fields
            'hiring_departments', 'hiring_contact_email', 'perks_benefits', 'culture_tags',
            
            # Settings
            'profile_visibility', 'allow_candidate_messages'
        ]
        read_only_fields = ['id', 'verified_badge', 'verification_status', 'verification_notes']

    def validate_official_email(self, value):
        if value:
            public_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com']
            domain = value.split('@')[-1].lower().strip()
            if domain in public_domains:
                raise serializers.ValidationError("Registration is only permitted with a corporate email address (public email domains like Gmail, Yahoo, etc. are not allowed).")
        return value

class RecruiterProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=255, required=False, allow_blank=True)
    profile_photo_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    agency_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    email = serializers.EmailField(read_only=True)

