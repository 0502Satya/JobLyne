import os
import sys
import django

# Setup django environment
sys.path.append('c:\\Users\\abcom\\Desktop\\Project\\JobLyne\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    user = User.objects.get(email='test_candidate@example.com')
    user.is_active = True
    user.is_verified = True
    user.save()
    print("User test_candidate@example.com activated and verified successfully!")
except User.DoesNotExist:
    print("User test_candidate@example.com not found.")
