import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import CustomUserManager

class CustomUser(AbstractBaseUser, PermissionsMixin):
    ACCOUNT_TYPE_CHOICES = (
        ('CANDIDATE', 'Candidate'),
        ('COMPANY', 'Company'),
        ('RECRUITER', 'Recruiter'),
    )
    TEAM_ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('HIRING_MANAGER', 'Hiring Manager'),
        ('INTERVIEWER', 'Interviewer'),
        ('VIEWER', 'Viewer'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    account_type = models.CharField(max_length=255, choices=ACCOUNT_TYPE_CHOICES, null=True, blank=True)
    company = models.ForeignKey('companies.Companies', on_delete=models.SET_NULL, null=True, blank=True, related_name='users_company')
    team_role = models.CharField(max_length=50, choices=TEAM_ROLE_CHOICES, null=True, blank=True)
    phone = models.CharField(max_length=255, null=True, blank=True)
    phone_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    profile_photo_url = models.URLField(max_length=500, null=True, blank=True)
    profile_completeness_score = models.IntegerField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True, db_column='last_login_at')
    last_active = models.DateTimeField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0, null=True, blank=True)
    last_failed_login_at = models.DateTimeField(null=True, blank=True)
    marketing_consent = models.BooleanField(default=False)
    data_processing_consent = models.BooleanField(default=False)
    data_export_requested = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['account_type']),
            models.Index(fields=['is_active']),
        ]

class UserSessions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='user_sessions_user')
    refresh_token = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.CharField(max_length=255, null=True, blank=True)
    user_agent = models.CharField(max_length=255, null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'user_sessions'

class UserConsents(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='user_consents_user')
    consent_type = models.CharField(max_length=255, null=True, blank=True)
    granted = models.BooleanField(default=False)
    ip_address = models.CharField(max_length=255, null=True, blank=True)
    granted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_consents'

class DeletionRequests(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='deletion_requests_user')
    request_reason = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    requested_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'deletion_requests'

class AdminRoles(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'admin_roles'

class Permissions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'permissions'

class RolePermissions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.ForeignKey('AdminRoles', on_delete=models.CASCADE, null=True, blank=True, related_name='role_permissions_role')
    permission = models.ForeignKey('Permissions', on_delete=models.CASCADE, null=True, blank=True, related_name='role_permissions_permission')

    class Meta:
        db_table = 'role_permissions'

class UserRoles(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='user_roles_user')
    role = models.ForeignKey('AdminRoles', on_delete=models.CASCADE, null=True, blank=True, related_name='user_roles_role')

    class Meta:
        db_table = 'user_roles'

class AuditLogs(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor_user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='audit_logs_actor_user')
    target_entity_type = models.CharField(max_length=255, null=True, blank=True)
    target_entity_id = models.UUIDField(null=True, blank=True)
    action = models.CharField(max_length=255, null=True, blank=True)
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    ip_address = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'audit_logs'

class EmailVerificationOTP(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='otp_codes')
    otp_hash = models.CharField(max_length=64, default="")
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'email_verification_otps'


class PasswordResetToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'password_reset_tokens'


class SupportReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_sent')
    target_type = models.CharField(max_length=50) # 'company', 'candidate', 'job'
    target_id = models.UUIDField()
    subject = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, default='unresolved') # 'resolved', 'unresolved'
    assigned_to = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_reports')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'support_reports'

