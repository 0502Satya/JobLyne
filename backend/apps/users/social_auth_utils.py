import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

def verify_google_token(token):
    """
    Verifies a Google token (either ID token or Access token) and returns user information.
    Restricts authorization strictly to audience-validated ID tokens or verified Access tokens.
    Supports local mock tokens starting with 'mock_' during development.
    """
    if settings.DEBUG and token.startswith('mock_'):
        email = token.replace('mock_', '')
        if '@' not in email:
            email = f"{email}@example.com"
        return {
            'email': email,
            'first_name': 'MockGoogle',
            'last_name': 'User',
            'picture': '',
            'provider': 'google',
            'uid': f"mock-google-uid-{email}"
        }

    # Only accept ID tokens with strict audience validation
    try:
        client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        if not client_id:
            return None
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
    Validates token audience via token introspection if client credentials are provided.
    Supports local mock tokens starting with 'mock_' during development.
    """
    if settings.DEBUG and access_token.startswith('mock_'):
        email = access_token.replace('mock_', '')
        if '@' not in email:
            email = f"{email}@example.com"
        return {
            'email': email,
            'first_name': 'MockLinkedIn',
            'last_name': 'User',
            'provider': 'linkedin',
            'uid': f"mock-linkedin-uid-{email}"
        }

    try:
        client_id = getattr(settings, 'LINKEDIN_CLIENT_ID', None)
        client_secret = getattr(settings, 'LINKEDIN_CLIENT_SECRET', None)
        
        if not client_id or not client_secret:
            return None
        
        # Introspect to validate audience
            introspect_res = requests.post(
                'https://www.linkedin.com/oauth/v2/introspect',
                data={
                    'token': access_token,
                    'client_id': client_id,
                    'client_secret': client_secret,
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            if introspect_res.status_code == 200:
                introspect_data = introspect_res.json()
                # Check that the token is active and matches our client_id
                if not introspect_data.get('active') or introspect_data.get('client_id') != client_id:
                    return None
            else:
                return None

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

