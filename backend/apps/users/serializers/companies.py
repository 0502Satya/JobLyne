from rest_framework import serializers
from ..models import Companies

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Companies
        fields = [
            'id', 'name', 'description', 'website', 'logo_url', 
            'cover_image_url', 'industry', 'culture', 'benefits', 
            'city', 'country', 'verified_badge'
        ]
        read_only_fields = ['id', 'verified_badge']
