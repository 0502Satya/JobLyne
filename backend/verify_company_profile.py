import urllib.request
import json
import time
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import CustomUser

BASE_URL = "http://127.0.0.1:8000/api/auth/"

def post_json(url, data, token=None):
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    jsondata = json.dumps(data).encode('utf-8')
    try:
        response = urllib.request.urlopen(req, jsondata)
        return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return None

def get_json(url, token):
    req = urllib.request.Request(url)
    req.add_header('Authorization', f'Bearer {token}')
    try:
        response = urllib.request.urlopen(req)
        return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return None

def patch_json(url, data, token):
    req = urllib.request.Request(url, method='PATCH')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Authorization', f'Bearer {token}')
    jsondata = json.dumps(data).encode('utf-8')
    try:
        response = urllib.request.urlopen(req, jsondata)
        return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return None

# 1. Register
ts = int(time.time())
email = f"company_admin_{ts}@example.com"
print(f"--- Registering {email} ---")
reg_data = {
    "email": email,
    "password": "Password123",
    "password_confirm": "Password123",
    "company_name": f"Test Company {ts}",
    "industry": "Software",
    "website": "http://test.com"
}
reg_res = post_json(BASE_URL + "company/signup/", reg_data)
if not reg_res:
    print("Registration failed.")
    exit(1)
print("Registration successful.")

# Activate user directly via ORM since they are registered and inactive by default
try:
    user = CustomUser.objects.get(email=email)
    user.is_verified = True
    user.is_active = True
    user.save()
    print("User successfully verified and activated via ORM.")
except CustomUser.DoesNotExist:
    print(f"Error: User with email {email} was not found in the database.")
    exit(1)

# 2. Login
print("\n--- Logging in ---")
login_data = {
    "email": email,
    "password": "Password123"
}
login_res = post_json(BASE_URL + "login/", login_data)
if not login_res:
    exit(1)

token = login_res['tokens']['access']
print("Login successful.")

# 3. Get Profile
print("\n--- Getting Profile ---")
profile = get_json(BASE_URL + "company/profile/", token)
print("Profile:", json.dumps(profile, indent=2))

# 4. Patch Profile
print("\n--- Updating Profile ---")
update_data = {
    "description": "Updated description for the company.",
    "city": "Remote",
    "country": "Internet"
}
updated_profile = patch_json(BASE_URL + "company/profile/", update_data, token)
print("Updated Profile:", json.dumps(updated_profile, indent=2))
