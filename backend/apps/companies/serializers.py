from rest_framework import serializers
from apps.companies.models import Companies

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Companies
        fields = [
            'id', 'name', 'description', 'website', 'logo_url', 
            'cover_image_url', 'industry', 'culture', 'benefits', 
            'city', 'country', 'tax_id', 'verified_badge'
        ]
        read_only_fields = ['id', 'verified_badge']

class RecruiterProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=255, required=False, allow_blank=True)
    profile_photo_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    agency_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    email = serializers.EmailField(read_only=True)

