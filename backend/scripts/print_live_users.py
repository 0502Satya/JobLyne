import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import CustomUser

def print_users():
    users = CustomUser.objects.all().order_by('-created_at')
    print("\n================ LIVE USERS IN DATABASE ================")
    print(f"Total Users: {users.count()}")
    print("--------------------------------------------------------")
    for user in users:
        name = f"{user.first_name or ''} {user.last_name or ''}".strip() or "N/A"
        print(f"Email: {user.email:<30} | Name: {name:<20} | Role: {user.account_type:<10} | Verified: {user.is_verified}")
    print("========================================================\n")

if __name__ == "__main__":
    print_users()
