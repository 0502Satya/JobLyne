import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

def verify_google_token(token):
    """
    Verifies a Google token (ID token) and returns user information.
    Restricts authorization strictly to audience-validated ID tokens.
    """
    try:
        client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
        return {
            'email': idinfo.get('email'),
            'first_name': idinfo.get('given_name'),
            'last_name': idinfo.get('family_name'),
            'picture': idinfo.get('picture'),
            'provider': 'google',
            'uid': idinfo.get('sub')
        }
    except Exception:
        return None

def verify_linkedin_token(access_token):
    """
    Verifies a LinkedIn access token and returns user information.
    Uses the 'me' and 'emailAddress' endpoints.
    """
    try:
        # Get basic profile info
        profile_res = requests.get(
            'https://api.linkedin.com/v2/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        profile_data = profile_res.json()

        # Get email address
        email_res = requests.get(
            'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        email_data = email_res.json()

        if profile_res.status_code != 200 or email_res.status_code != 200:
            return None

        email = email_data['elements'][0]['handle~']['emailAddress']
        
        return {
            'email': email,
            'first_name': profile_data.get('localizedFirstName'),
            'last_name': profile_data.get('localizedLastName'),
            'provider': 'linkedin',
            'uid': profile_data.get('id')
        }
    except Exception:
        return None
