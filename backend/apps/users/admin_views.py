import random
import string
import uuid
import datetime
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import (
    CustomUser, AdminRoles, Permissions, RolePermissions, UserRoles, AuditLogs, SupportReport
)
from apps.companies.models import Companies, Recruiters
from apps.candidates.models import JobSeekers
from apps.jobs.models import Jobs
from apps.users.pagination import StandardPagination

# Helper to generate JWT tokens for admin
def get_admin_tokens(user, role_name):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = 'ADMIN'
    refresh['admin_role'] = role_name
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# Helper to seed Roles & Permissions if they don't exist
def seed_roles_and_permissions():
    if AdminRoles.objects.count() > 0:
        return
        
    permissions_list = [
        ('view_companies', 'Can view registration info of companies'),
        ('view_candidates', 'Can view profiles of job seekers'),
        ('approve_reject_companies', 'Can change company verification status'),
        ('suspend_ban_users', 'Can suspend or delete candidate accounts'),
        ('manage_job_postings', 'Can remove or flag job postings'),
        ('manage_admins', 'Can add/remove other administrative roles'),
        ('view_analytics_reports', 'Can view dashboard and download stats'),
        ('manage_platform_settings', 'Can edit feature flags and email templates'),
    ]
    
    perm_objs = {}
    for code, desc in permissions_list:
        obj, _ = Permissions.objects.get_or_create(name=code, description=desc)
        perm_objs[code] = obj
        
    roles_list = [
        ('super_admin', 'Full access to edit portal configurations and admin privileges'),
        ('verification_officer', 'Restricted to reviewing and approving workspace credentials'),
        ('support_admin', 'Can review reports, tickets, and user listings'),
        ('content_moderator', 'Can remove, approve, or edit active job openings'),
    ]
    
    role_objs = {}
    for code, desc in roles_list:
        obj, _ = AdminRoles.objects.get_or_create(name=code, description=desc)
        role_objs[code] = obj
        
    # Assign permissions
    # 1. Super Admin gets all
    for p_obj in perm_objs.values():
        RolePermissions.objects.get_or_create(role=role_objs['super_admin'], permission=p_obj)
        
    # 2. Verification Officer gets company verification
    RolePermissions.objects.get_or_create(role=role_objs['verification_officer'], permission=perm_objs['view_companies'])
    RolePermissions.objects.get_or_create(role=role_objs['verification_officer'], permission=perm_objs['approve_reject_companies'])
    RolePermissions.objects.get_or_create(role=role_objs['verification_officer'], permission=perm_objs['view_analytics_reports'])
    
    # 3. Support Admin gets view permissions
    RolePermissions.objects.get_or_create(role=role_objs['support_admin'], permission=perm_objs['view_companies'])
    RolePermissions.objects.get_or_create(role=role_objs['support_admin'], permission=perm_objs['view_candidates'])
    RolePermissions.objects.get_or_create(role=role_objs['support_admin'], permission=perm_objs['view_analytics_reports'])
    
    # 4. Content Moderator gets jobs
    RolePermissions.objects.get_or_create(role=role_objs['content_moderator'], permission=perm_objs['manage_job_postings'])
    RolePermissions.objects.get_or_create(role=role_objs['content_moderator'], permission=perm_objs['view_companies'])
    RolePermissions.objects.get_or_create(role=role_objs['content_moderator'], permission=perm_objs['view_candidates'])

# Helper to check permissions
def check_admin_permission(user, permission_name):
    if not user.is_staff:
        return False
    try:
        user_role = UserRoles.objects.filter(user=user).first()
        if not user_role:
            # Default to super_admin if staff user but role is missing in lookup
            return True
        if user_role.role.name == 'super_admin':
            return True
        has_perm = RolePermissions.objects.filter(role=user_role.role, permission__name=permission_name).exists()
        return has_perm
    except Exception:
        return False

class HasAdminPermission(BasePermission):
    required_permission = None
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated or not request.user.is_staff:
            return False
        required_perm = getattr(view, 'required_permission', None)
        if not required_perm:
            return True
        return check_admin_permission(request.user, required_perm)

# Log an action
def log_audit_action(actor, action_type, target_type, target_id, old_val=None, new_val=None, reason=""):
    try:
        AuditLogs.objects.create(
            actor_user=actor,
            target_entity_type=target_type,
            target_entity_id=target_id if target_id else None,
            action=action_type,
            old_values=old_val or {},
            new_values=new_val or {"reason": reason},
            ip_address="127.0.0.1"
        )
    except Exception:
        pass


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        seed_roles_and_permissions()
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Please provide email and password'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = authenticate(request, email=email, password=password)
        if user is not None:
            if not user.is_staff:
                return Response({'error': 'Access denied. Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)
                
            # Resolve role
            user_role = UserRoles.objects.filter(user=user).first()
            role_name = 'super_admin'
            if user_role:
                role_name = user_role.role.name
            else:
                # auto-assign super_admin for staff users if none mapped
                s_admin = AdminRoles.objects.filter(name='super_admin').first()
                if s_admin:
                    UserRoles.objects.create(user=user, role=s_admin)
            
            # Fetch permissions list
            perms = []
            if role_name == 'super_admin':
                perms = [p.name for p in Permissions.objects.all()]
            elif user_role:
                perms = [rp.permission.name for rp in RolePermissions.objects.filter(role=user_role.role)]
                
            tokens = get_admin_tokens(user, role_name)
            
            return Response({
                'message': 'Admin login successful.',
                'tokens': tokens,
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'name': f"{user.first_name or ''} {user.last_name or ''}".strip() or "Administrator",
                    'role': role_name,
                    'permissions': perms
                }
            }, status=status.HTTP_200_OK)
        else:
            # Check if there are any users at all. If none, allow creating a default super admin for testing convenience
            if settings.DEBUG and CustomUser.objects.count() == 0:
                # Auto-seed a debug admin
                new_admin = CustomUser.objects.create_superuser(
                    email=email,
                    password=password,
                    first_name="Default",
                    last_name="SuperAdmin"
                )
                new_admin.is_staff = True
                new_admin.is_active = True
                new_admin.save()
                
                s_role, _ = AdminRoles.objects.get_or_create(name='super_admin')
                UserRoles.objects.create(user=new_admin, role=s_role)
                
                # Try authenticate again
                user = authenticate(request, email=email, password=password)
                if user:
                    tokens = get_admin_tokens(user, 'super_admin')
                    perms = [p.name for p in Permissions.objects.all()]
                    return Response({
                        'message': 'Admin created & login successful.',
                        'tokens': tokens,
                        'user': {
                            'id': str(user.id),
                            'email': user.email,
                            'name': "Default SuperAdmin",
                            'role': 'super_admin',
                            'permissions': perms
                        }
                    }, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid administrator credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class AdminStatsView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = 'view_analytics_reports'

    def get(self, request, *args, **kwargs):
        seed_roles_and_permissions()
        
        # Breakdown companies via single conditional aggregation query
        company_stats = Companies.objects.aggregate(
            total=Count('id'),
            verified=Count('id', filter=Q(verification_status='verified')),
            pending=Count('id', filter=Q(verification_status='pending')),
            rejected=Count('id', filter=Q(verification_status='rejected'))
        )
        total_companies = company_stats['total']
        verified_companies = company_stats['verified']
        pending_companies = company_stats['pending']
        rejected_companies = company_stats['rejected']
        
        # Candidates
        total_candidates = JobSeekers.objects.count()
        
        # New Signups today (within 24h)
        day_ago = timezone.now() - datetime.timedelta(days=1)
        new_companies_today = Companies.objects.filter(created_at__gte=day_ago).count()
        new_candidates_today = JobSeekers.objects.filter(created_at__gte=day_ago).count()
        
        # Active Jobs
        active_jobs = Jobs.objects.filter(status='OPEN').count()
        
        # Audit Logs
        recent_logs = []
        logs_query = AuditLogs.objects.order_by('-created_at')[:10]
        for log in logs_query:
            actor_name = "System"
            if log.actor_user:
                actor_name = f"{log.actor_user.first_name or ''} {log.actor_user.last_name or ''}".strip() or log.actor_user.email
            recent_logs.append({
                'id': str(log.id),
                'actor': actor_name,
                'action': log.action,
                'entity': log.target_entity_type,
                'entity_id': str(log.target_entity_id) if log.target_entity_id else '',
                'notes': log.new_values.get('reason', ''),
                'timestamp': log.created_at.isoformat() if log.created_at else ''
            })
            
        return Response({
            'companies': {
                'total': total_companies,
                'verified': verified_companies,
                'pending': pending_companies,
                'rejected': rejected_companies,
                'new_today': new_companies_today
            },
            'candidates': {
                'total': total_candidates,
                'new_today': new_candidates_today
            },
            'jobs': {
                'active': active_jobs
            },
            'logs': recent_logs
        }, status=status.HTTP_200_OK)


class AdminCompanyView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = 'view_companies'

    def get(self, request, *args, **kwargs):
        companies_query = Companies.objects.order_by('-created_at')
        
        # Filters
        status_filter = request.GET.get('status')
        industry_filter = request.GET.get('industry')
        search_q = request.GET.get('search')
        
        if status_filter:
            companies_query = companies_query.filter(verification_status=status_filter)
        if industry_filter:
            companies_query = companies_query.filter(industry__iexact=industry_filter)
        if search_q:
            companies_query = companies_query.filter(
                Q(name__icontains=search_q) | 
                Q(legal_name__icontains=search_q) |
                Q(official_email__icontains=search_q) |
                Q(registration_number__icontains=search_q)
            )
            
        paginator = StandardPagination()
        page = paginator.paginate_queryset(companies_query, request, view=self)
        target_queryset = page if page is not None else companies_query

        data = []
        for c in target_queryset:
            data.append({
                'id': str(c.id),
                'name': c.name or c.legal_name or "Unnamed Corp",
                'legal_name': c.legal_name,
                'official_email': c.official_email,
                'website': c.website,
                'industry': c.industry or "Technology",
                'company_size': c.company_size or "11-50",
                'registration_number': c.registration_number,
                'verification_status': c.verification_status,
                'created_at': c.created_at.isoformat() if c.created_at else ''
            })
            
        if page is not None:
            return paginator.get_paginated_response(data)
        return Response(data, status=status.HTTP_200_OK)


class AdminCompanyDetailView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = 'view_companies'

    def get(self, request, company_id, *args, **kwargs):
        try:
            c = Companies.objects.get(id=company_id)
        except Companies.DoesNotExist:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Get reviews or job counts
        job_count = Jobs.objects.filter(company=c).count()
        
        # Fetch audit records for this company
        company_logs = []
        logs_query = AuditLogs.objects.filter(target_entity_type='company', target_entity_id=c.id).order_by('-created_at')
        for log in logs_query:
            actor_name = "Admin"
            if log.actor_user:
                actor_name = f"{log.actor_user.first_name or ''} {log.actor_user.last_name or ''}".strip() or log.actor_user.email
            company_logs.append({
                'actor': actor_name,
                'action': log.action,
                'reason': log.new_values.get('reason', ''),
                'timestamp': log.created_at.isoformat() if log.created_at else ''
            })

        return Response({
            'id': str(c.id),
            'name': c.name,
            'legal_name': c.legal_name,
            'description': c.description,
            'website': c.website,
            'logo_url': c.logo_url,
            'cover_image_url': c.cover_image_url,
            'industry': c.industry,
            'company_size': c.company_size,
            'city': c.city,
            'country': c.country,
            'tax_id': c.tax_id,
            'cin_number': c.cin_number,
            'gstin_number': c.gstin_number,
            'registration_number': c.registration_number,
            'year_established': c.year_established,
            'registered_address': c.registered_address,
            'official_email': c.official_email,
            'phone_number': c.phone_number,
            'authorized_contact_name': c.authorized_contact_name,
            'authorized_contact_designation': c.authorized_contact_designation,
            'id_proof_url': c.id_proof_url,
            'incorporation_doc_url': c.incorporation_doc_url,
            'tax_doc_url': c.tax_doc_url,
            'address_proof_url': c.address_proof_url,
            'verification_status': c.verification_status,
            'verification_notes': c.verification_notes,
            'job_count': job_count,
            'logs': company_logs
        }, status=status.HTTP_200_OK)

    def post(self, request, company_id, *args, **kwargs):
        if not check_admin_permission(request.user, 'approve_reject_companies'):
            return Response({"error": "Verification admin permission required"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            company = Companies.objects.get(id=company_id)
        except Companies.DoesNotExist:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)
            
        action = request.data.get('action') # 'approve', 'reject', 'suspend', 'unsuspend', 'delete'
        notes = request.data.get('notes', '')
        
        if action == 'approve':
            old_status = company.verification_status
            company.verification_status = 'verified'
            company.verified_badge = True
            company.verification_notes = notes or "Approved by admin."
            company.save()
            
            log_audit_action(request.user, 'VERIFY_APPROVE', 'company', company.id, {'status': old_status}, {'status': 'verified'}, notes)
            
            # Email Notification
            try:
                send_mail(
                    "Company Verification Approved!",
                    f"Hi {company.authorized_contact_name or 'Hiring Manager'},\n\nWe are pleased to inform you that your workspace verification for {company.legal_name} has been approved!\n\nYou can now post active job listings on JobLyne.\n\nBest,\nThe JobLyne Team",
                    settings.DEFAULT_FROM_EMAIL,
                    [company.official_email],
                    fail_silently=True
                )
            except Exception:
                pass
                
        elif action == 'reject':
            if not notes.strip():
                return Response({"error": "Rejection notes are required."}, status=status.HTTP_400_BAD_REQUEST)
            old_status = company.verification_status
            company.verification_status = 'rejected'
            company.verified_badge = False
            company.verification_notes = notes
            company.save()
            
            log_audit_action(request.user, 'VERIFY_REJECT', 'company', company.id, {'status': old_status}, {'status': 'rejected'}, notes)
            
            # Email Notification
            try:
                send_mail(
                    "Company Verification Needs Corrections",
                    f"Hi {company.authorized_contact_name or 'Hiring Manager'},\n\nYour workspace verification request for {company.legal_name} was rejected.\n\nReason: {notes}\n\nPlease update your company profile details and resubmit verification.\n\nBest,\nThe JobLyne Team",
                    settings.DEFAULT_FROM_EMAIL,
                    [company.official_email],
                    fail_silently=True
                )
            except Exception:
                pass
                
        elif action == 'suspend':
            old_status = company.verification_status
            company.verification_status = 'rejected' # lock posts
            company.verified_badge = False
            company.save()
            log_audit_action(request.user, 'COMPANY_SUSPEND', 'company', company.id, {'status': old_status}, {'status': 'suspended'}, notes)
            
        elif action == 'unsuspend':
            company.verification_status = 'verified'
            company.verified_badge = True
            company.save()
            log_audit_action(request.user, 'COMPANY_UNSUSPEND', 'company', company.id, {}, {}, notes)
            
        elif action == 'delete':
            log_audit_action(request.user, 'COMPANY_DELETE', 'company', company.id, {'name': company.name}, {}, notes)
            # Delete recruiters and job postings
            Jobs.objects.filter(company=company).delete()
            Recruiters.objects.filter(company=company).delete()
            company.delete()
            return Response({"message": "Company deleted successfully"}, status=status.HTTP_200_OK)
            
        else:
            return Response({"error": "Invalid action trigger"}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            "message": f"Action {action} performed successfully",
            "verification_status": company.verification_status
        }, status=status.HTTP_200_OK)


class AdminCandidateView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = 'view_candidates'

    def get(self, request, *args, **kwargs):
        seekers = JobSeekers.objects.select_related('user').order_by('-created_at')
        
        search_q = request.GET.get('search')
        if search_q:
            seekers = seekers.filter(
                Q(full_name__icontains=search_q) |
                Q(user__email__icontains=search_q) |
                Q(phone__icontains=search_q)
            )
            
        paginator = StandardPagination()
        page = paginator.paginate_queryset(seekers, request, view=self)
        target_queryset = page if page is not None else seekers

        data = []
        for s in target_queryset:
            data.append({
                'id': str(s.id),
                'user_id': str(s.user.id),
                'name': s.full_name or f"{s.user.first_name or ''} {s.user.last_name or ''}".strip() or "Unnamed Candidate",
                'email': s.user.email,
                'phone': s.phone,
                'headline': s.headline,
                'profile_completeness': s.user.profile_completeness_score or 50,
                'is_active': s.user.is_active,
                'created_at': s.created_at.isoformat() if s.created_at else ''
            })
            
        if page is not None:
            return paginator.get_paginated_response(data)
        return Response(data, status=status.HTTP_200_OK)


class AdminCandidateDetailView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = 'view_candidates'

    def get(self, request, candidate_id, *args, **kwargs):
        try:
            s = JobSeekers.objects.get(id=candidate_id)
        except JobSeekers.DoesNotExist:
            return Response({"error": "Candidate profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Get audit details
        cand_logs = []
        logs_query = AuditLogs.objects.filter(target_entity_type='candidate', target_entity_id=s.id).order_by('-created_at')
        for log in logs_query:
            actor_name = "Admin"
            if log.actor_user:
                actor_name = f"{log.actor_user.first_name or ''} {log.actor_user.last_name or ''}".strip() or log.actor_user.email
            cand_logs.append({
                'actor': actor_name,
                'action': log.action,
                'reason': log.new_values.get('reason', ''),
                'timestamp': log.created_at.isoformat() if log.created_at else ''
            })

        return Response({
            'id': str(s.id),
            'user_id': str(s.user.id),
            'name': s.full_name or f"{s.user.first_name or ''} {s.user.last_name or ''}".strip(),
            'email': s.user.email,
            'phone': s.phone,
            'location': s.location,
            'headline': s.headline,
            'summary': s.summary,
            'resume_file_url': s.resume_file_url,
            'notice_period': s.notice_period,
            'current_company': s.current_company,
            'current_designation': s.current_designation,
            'is_active': s.user.is_active,
            'profile_completeness': s.user.profile_completeness_score or 50,
            'logs': cand_logs
        }, status=status.HTTP_200_OK)

    def post(self, request, candidate_id, *args, **kwargs):
        if not check_admin_permission(request.user, 'suspend_ban_users'):
            return Response({"error": "Moderator suspension privileges required"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            s = JobSeekers.objects.get(id=candidate_id)
        except JobSeekers.DoesNotExist:
            return Response({"error": "Candidate not found"}, status=status.HTTP_404_NOT_FOUND)
            
        action = request.data.get('action') # 'suspend', 'reactivate', 'delete'
        notes = request.data.get('notes', '')
        
        user = s.user
        
        if action == 'suspend':
            user.is_active = False
            user.save(update_fields=['is_active'])
            log_audit_action(request.user, 'CANDIDATE_SUSPEND', 'candidate', s.id, {'is_active': True}, {'is_active': False}, notes)
            
        elif action == 'reactivate':
            user.is_active = True
            user.save(update_fields=['is_active'])
            log_audit_action(request.user, 'CANDIDATE_REACTIVATE', 'candidate', s.id, {'is_active': False}, {'is_active': True}, notes)
            
        elif action == 'delete':
            log_audit_action(request.user, 'CANDIDATE_DELETE', 'candidate', s.id, {'email': user.email}, {}, notes)
            user.delete() # Cascade deletes job seeker profile
            return Response({"message": "Candidate user deleted successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid action trigger"}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            "message": f"Candidate status {action} successfully.",
            "is_active": user.is_active
        }, status=status.HTTP_200_OK)


class AdminJobView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = 'view_companies'

    def get(self, request, *args, **kwargs):
        jobs_query = Jobs.objects.select_related('company').order_by('-created_at')
        
        search_q = request.GET.get('search')
        status_filter = request.GET.get('status')
        
        if search_q:
            jobs_query = jobs_query.filter(
                Q(title__icontains=search_q) |
                Q(company__name__icontains=search_q)
            )
        if status_filter:
            jobs_query = jobs_query.filter(status=status_filter)
            
        paginator = StandardPagination()
        page = paginator.paginate_queryset(jobs_query, request, view=self)
        target_queryset = page if page is not None else jobs_query

        data = []
        for j in target_queryset:
            data.append({
                'id': str(j.id),
                'title': j.title,
                'company_name': j.company.name if j.company else "Unknown Company",
                'company_id': str(j.company.id) if j.company else '',
                'employment_type': j.employment_type or "Full-time",
                'salary_min': str(j.salary_min) if j.salary_min else 'N/A',
                'salary_max': str(j.salary_max) if j.salary_max else 'N/A',
                'status': j.status,
                'posted_at': j.posted_at.isoformat() if j.posted_at else ''
            })
            
        if page is not None:
            return paginator.get_paginated_response(data)
        return Response(data, status=status.HTTP_200_OK)


class AdminJobDetailView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = 'manage_job_postings'

    def post(self, request, job_id, *args, **kwargs):
        try:
            job = Jobs.objects.get(id=job_id)
        except Jobs.DoesNotExist:
            return Response({"error": "Job opening not found"}, status=status.HTTP_404_NOT_FOUND)
            
        action = request.data.get('action') # 'flag', 'remove'
        notes = request.data.get('notes', '')
        
        if action == 'flag':
            job.status = 'DRAFT' # Send to draft moderation status
            job.save()
            log_audit_action(request.user, 'JOB_FLAG', 'job', job.id, {}, {}, notes)
            
        elif action == 'remove':
            log_audit_action(request.user, 'JOB_REMOVE', 'job', job.id, {'title': job.title}, {}, notes)
            job.delete()
            return Response({"message": "Job posting removed successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid moderation action"}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            "message": f"Job status {action} successfully.",
            "status": job.status
        }, status=status.HTTP_200_OK)


class AdminManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not check_admin_permission(request.user, 'manage_admins'):
            return Response({"error": "Super Admin access required"}, status=status.HTTP_403_FORBIDDEN)
            
        admins = CustomUser.objects.filter(is_staff=True).order_by('-created_at')
        
        data = []
        for a in admins:
            user_role = UserRoles.objects.filter(user=a).first()
            role_name = user_role.role.name if user_role else 'super_admin'
            data.append({
                'id': str(a.id),
                'email': a.email,
                'name': f"{a.first_name or ''} {a.last_name or ''}".strip() or "Admin User",
                'role': role_name,
                'is_active': a.is_active,
                'last_login': a.last_login.isoformat() if a.last_login else ''
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        if not check_admin_permission(request.user, 'manage_admins'):
            return Response({"error": "Super Admin access required"}, status=status.HTTP_403_FORBIDDEN)
            
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role_name = request.data.get('role', 'support_admin') # default
        
        if not email or not password:
            return Response({"error": "Email and password are required for admin profiles"}, status=status.HTTP_400_BAD_REQUEST)
            
        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Create staff user
            new_admin = CustomUser.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            new_admin.is_staff = True
            new_admin.is_active = True
            new_admin.save()
            
            # Map role
            s_role, _ = AdminRoles.objects.get_or_create(name=role_name)
            UserRoles.objects.create(user=new_admin, role=s_role)
            
            log_audit_action(request.user, 'ADMIN_CREATE', 'user', new_admin.id, {}, {'email': email, 'role': role_name}, "Invited new administrator profile.")
            
            return Response({
                "message": "Teammate administrator created successfully",
                "admin": {
                    "id": str(new_admin.id),
                    "email": new_admin.email,
                    "role": role_name
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminAuditLogsView(APIView):
    permission_classes = [HasAdminPermission]

    def get(self, request, *args, **kwargs):
        logs_query = AuditLogs.objects.order_by('-created_at')[:100] # Cap to 100
        
        data = []
        for log in logs_query:
            actor_name = "System"
            if log.actor_user:
                actor_name = f"{log.actor_user.first_name or ''} {log.actor_user.last_name or ''}".strip() or log.actor_user.email
            data.append({
                'id': str(log.id),
                'actor': actor_name,
                'action': log.action,
                'entity': log.target_entity_type,
                'entity_id': str(log.target_entity_id) if log.target_entity_id else '',
                'notes': log.new_values.get('reason', ''),
                'timestamp': log.created_at.isoformat() if log.created_at else ''
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminSupportReportsView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = 'view_companies'

    def get(self, request, *args, **kwargs):
            
        # Seed mock support complaints if table is empty
        if SupportReport.objects.count() == 0:
            mock_reports = [
                {
                    'subject': 'Fake job posting report',
                    'description': 'This company is promoting a remote data entry job that redirects to external payment portals.',
                    'target_type': 'job',
                    'target_id': Jobs.objects.first().id if Jobs.objects.exists() else uuid.uuid4()
                },
                {
                    'subject': 'Unresponsive recruiter contact',
                    'description': 'The hiring contact has not replied to messages and external links listed are broken.',
                    'target_type': 'company',
                    'target_id': Companies.objects.first().id if Companies.objects.exists() else uuid.uuid4()
                }
            ]
            for r in mock_reports:
                SupportReport.objects.create(
                    subject=r['subject'],
                    description=r['description'],
                    target_type=r['target_type'],
                    target_id=r['target_id']
                )

        reports = SupportReport.objects.order_by('-created_at')
        data = []
        for rep in reports:
            reporter_name = "Anonymous"
            if rep.reporter:
                reporter_name = rep.reporter.email
            assigned_name = "Unassigned"
            if rep.assigned_to:
                assigned_name = rep.assigned_to.email
            data.append({
                'id': str(rep.id),
                'reporter': reporter_name,
                'target_type': rep.target_type,
                'target_id': str(rep.target_id),
                'subject': rep.subject,
                'description': rep.description,
                'status': rep.status,
                'assigned_to': assigned_name,
                'created_at': rep.created_at.isoformat() if rep.created_at else ''
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({"error": "Admin credentials required"}, status=status.HTTP_403_FORBIDDEN)
            
        report_id = request.data.get('report_id')
        action = request.data.get('action') # 'resolve', 'assign'
        
        try:
            rep = SupportReport.objects.get(id=report_id)
        except SupportReport.DoesNotExist:
            return Response({"error": "Report ticket not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if action == 'resolve':
            rep.status = 'resolved'
            rep.save()
            log_audit_action(request.user, 'REPORT_RESOLVE', 'report', rep.id, {}, {}, "Resolved report ticket.")
        elif action == 'assign':
            rep.assigned_to = request.user
            rep.save()
            log_audit_action(request.user, 'REPORT_ASSIGN', 'report', rep.id, {}, {}, "Assigned ticket to admin.")
            
        return Response({"message": "Report status updated successfully", "status": rep.status}, status=status.HTTP_200_OK)
