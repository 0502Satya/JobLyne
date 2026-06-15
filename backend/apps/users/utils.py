from django.core.mail import send_mail
from django.conf import settings
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def send_otp_email(user_email, otp_code):
    """
    Sends an OTP verification email to the user.
    """
    subject = f'{otp_code} is your JobLyne verification code'
    message = f"""
Hi,

Welcome to JobLyne! To complete your registration, please use the following verification code:

{otp_code}

This code will expire shortly. If you did not request this, please ignore this email.

Best regards,
The JobLyne Team
"""
    html_message = f"""
<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 10px;">
    <h2 style="color: #135bec; text-align: center;">JobLyne</h2>
    <hr style="border: 0; border-top: 1px solid #e1e4e8; margin: 20px 0;">
    <p>Hi,</p>
    <p>Welcome to JobLyne! To complete your registration, please use the following verification code:</p>
    <div style="background-color: #f0f4ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #135bec; border-radius: 5px; margin: 20px 0;">
        {otp_code}
    </div>
    <p>This code will expire shortly. If you did not request this, please ignore this email.</p>
    <hr style="border: 0; border-top: 1px solid #e1e4e8; margin: 20px 0;">
    <p style="font-size: 12px; color: #6a737d; text-align: center;">
        &copy; {datetime.now().year} JobLyne. All rights reserved.
    </p>
</div>
"""
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
            html_message=html_message
        )
        logger.info(f"OTP email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending OTP email to {user_email}: {str(e)}")
        print(f"--- FAILED TO SEND EMAIL TO {user_email}. OTP: {otp_code} ---")
        print(f"Error details: {str(e)}")
        return False
