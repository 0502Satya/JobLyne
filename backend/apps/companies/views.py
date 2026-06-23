import uuid
import hashlib
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone

from apps.candidates.models import JobSeekers, CandidateShortlists
from apps.jobs.models import Jobs, Applications, ApplicationStatusHistory
from apps.companies.models import Companies, Recruiters
from apps.commerce.models import AdvertiserAccounts
from apps.companies.serializers import CompanyProfileSerializer, RecruiterProfileSerializer
from apps.users.pagination import StandardPagination
from django.db import IntegrityError, transaction

def get_or_create_recruiter(user, agency_name):
    try:
        return Recruiters.objects.get(user=user)
    except Recruiters.DoesNotExist:
        try:
            with transaction.atomic():
                recruiter, _ = Recruiters.objects.get_or_create(
                    user=user,
                    defaults={"agency_name": agency_name}
                )
                return recruiter
        except IntegrityError:
            return Recruiters.objects.get(user=user)

def get_gradient_for_id(seeker_id: str) -> str:
    """
    Returns a stable, premium gradient string derived from a hash of the seeker's ID.
    """
    gradients = [
        "bg-gradient-to-tr from-[#3b82f6] to-[#06b6d4]", # Blue-Cyan
        "bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899]", # Purple-Pink
        "bg-gradient-to-tr from-[#f59e0b] to-[#ef4444]", # Amber-Red
        "bg-gradient-to-tr from-[#10b981] to-[#059669]"  # Emerald-Green
    ]
    hash_val = int(hashlib.md5(seeker_id.encode()).hexdigest(), 16)
    return gradients[hash_val % len(gradients)]

class CompanyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_company(self, user):
        if getattr(user, 'company', None):
            return user.company
        try:
            adv_account = AdvertiserAccounts.objects.get(user=user)
            return adv_account.company
        except AdvertiserAccounts.DoesNotExist:
            return None

    def get(self, request):
        if request.user.account_type != 'COMPANY':
            raise PermissionDenied("Only company accounts can access this endpoint.")
        company = self.get_company(request.user)
        if not company:
            return Response({"error": "No company associated with this user."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CompanyProfileSerializer(company)
        return Response(serializer.data)

    def patch(self, request):
        if request.user.account_type != 'COMPANY':
            raise PermissionDenied("Only company accounts can access this endpoint.")
        if request.user.team_role not in ['ADMIN', 'HIRING_MANAGER']:
            return Response({"error": "You do not have permission to modify company profile details (Admins/Managers only)."}, status=status.HTTP_403_FORBIDDEN)
        company = self.get_company(request.user)
        if not company:
            return Response({"error": "No company associated with this user."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CompanyProfileSerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

import re
from django.db.models import Q

def parse_boolean_query(query_str):
    if not query_str:
        return Q()
    
    tokens = re.findall(r'\(|\)|[^\s()]+', query_str)
    
    def get_term_q(term):
        return Q(
            Q(full_name__icontains=term) |
            Q(headline__icontains=term) |
            Q(summary__icontains=term) |
            Q(job_seeker_skills_job_seeker__skill__name__icontains=term)
        )

    try:
        processed_tokens = []
        operators = {'AND', 'OR', 'NOT'}
        for i, token in enumerate(tokens):
            if i > 0 and token not in operators and tokens[i-1] not in operators:
                processed_tokens.append('AND')
            processed_tokens.append(token)
            
        output_queue = []
        operator_stack = []
        
        for token in processed_tokens:
            if token == 'NOT':
                while operator_stack and operator_stack[-1] == 'NOT':
                    output_queue.append(operator_stack.pop())
                operator_stack.append(token)
            elif token == 'AND':
                while operator_stack and operator_stack[-1] in {'NOT', 'AND'}:
                    output_queue.append(operator_stack.pop())
                operator_stack.append(token)
            elif token == 'OR':
                while operator_stack and operator_stack[-1] in {'NOT', 'AND', 'OR'}:
                    output_queue.append(operator_stack.pop())
                operator_stack.append(token)
            elif token == '(':
                operator_stack.append(token)
            elif token == ')':
                while operator_stack and operator_stack[-1] != '(':
                    output_queue.append(operator_stack.pop())
                if operator_stack and operator_stack[-1] == '(':
                    operator_stack.pop()
            else:
                output_queue.append(get_term_q(token))
                
        while operator_stack:
            output_queue.append(operator_stack.pop())
            
        eval_stack = []
        for item in output_queue:
            if item == 'NOT':
                if eval_stack:
                    operand = eval_stack.pop()
                    eval_stack.append(~operand)
            elif item == 'AND':
                if len(eval_stack) >= 2:
                    op2 = eval_stack.pop()
                    op1 = eval_stack.pop()
                    eval_stack.append(op1 & op2)
            elif item == 'OR':
                if len(eval_stack) >= 2:
                    op2 = eval_stack.pop()
                    op1 = eval_stack.pop()
                    eval_stack.append(op1 | op2)
            else:
                eval_stack.append(item)
                
        if eval_stack:
            return eval_stack[0]
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error parsing boolean query '{query_str}': {str(e)}", exc_info=True)
        
    return get_term_q(query_str)

class RecruiterDashboardDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.account_type not in ['RECRUITER', 'COMPANY']:
            return Response({"error": "Access denied. Corporate accounts only."}, status=status.HTTP_403_FORBIDDEN)

        agency_default = "Corporate Talent Sourcing" if request.user.account_type == 'COMPANY' else "Recruiter Agency"
        fname = getattr(request.user, 'first_name', '') or ''
        lname = getattr(request.user, 'last_name', '') or ''
        agency_name = f"{fname} {lname}".strip() or agency_default
        recruiter = get_or_create_recruiter(request.user, agency_name)

        query = request.query_params.get('query', '')
        seekers = JobSeekers.objects.filter(
            is_open_to_opportunities=True
        ).prefetch_related(
            'job_seeker_skills_job_seeker__skill'
        ).order_by('-created_at')

        if query:
            seekers = seekers.filter(parse_boolean_query(query)).distinct()

        total_candidates = seekers.count()
        
        recruiter_jobs = list(Jobs.objects.filter(recruiter=recruiter).prefetch_related('job_skills_job__skill'))
        recruiter_job_ids = [j.id for j in recruiter_jobs]
        
        active_pipelines = Applications.objects.filter(job_id__in=recruiter_job_ids).exclude(status__iexact='PLACED').count()
        interviewing_stages = Applications.objects.filter(job_id__in=recruiter_job_ids, status__iexact='INTERVIEW').count()
        placements_made = Applications.objects.filter(job_id__in=recruiter_job_ids, status__iexact='PLACED').count()

        apps = Applications.objects.filter(job_id__in=recruiter_job_ids).select_related('job')
        seeker_apps = {app.job_seeker_id: app for app in apps}

        shortlists = set(
            CandidateShortlists.objects.filter(recruiter=recruiter).values_list('job_seeker_id', flat=True)
        )

        job_skills = set()
        for j in recruiter_jobs:
            for link in j.job_skills_job.all():
                if link.skill:
                    job_skills.add(link.skill.name.lower())

        from apps.companies.models import CreditAuditLogs
        unlocked_ids = set(
            CreditAuditLogs.objects.filter(
                user=request.user,
                action_type="UNLOCK_CANDIDATE"
            ).values_list('reference_id', flat=True)
        )

        paginator = StandardPagination()
        page = paginator.paginate_queryset(seekers, request)
        target_seekers = page if page is not None else seekers

        candidates_list = []
        for s in target_seekers:
            s_skills = [link.skill.name for link in s.job_seeker_skills_job_seeker.all() if link.skill]
            s_skills_lower = set(name.lower() for name in s_skills)

            if job_skills and s_skills_lower:
                overlap = job_skills.intersection(s_skills_lower)
                match_score = round((len(overlap) / len(job_skills)) * 100)
            else:
                match_score = 0

            app = seeker_apps.get(s.id)
            if app:
                db_status = (app.status or "").upper()
                if db_status == 'PENDING' or db_status == 'SOURCED':
                    pipeline_status = 'Sourced'
                elif db_status == 'INTERVIEW':
                    pipeline_status = 'Interviewing'
                elif db_status == 'OFFER':
                    pipeline_status = 'Offered'
                elif db_status == 'PLACED':
                    pipeline_status = 'Placed'
                else:
                    pipeline_status = 'Sourced'

                interview_status = 'Invited' if db_status == 'INTERVIEW' or app.interview_schedule else 'None'
            else:
                pipeline_status = 'Sourced'
                interview_status = 'None'

            is_locked = str(s.id) not in unlocked_ids
            candidates_list.append({
                "id": str(s.id),
                "user_id": str(s.user_id),
                "name": s.full_name or "Anonymous Candidate",
                "role": s.headline or "Software Professional",
                "avatarColor": get_gradient_for_id(str(s.id)),
                "matchScore": match_score,
                "skills": s_skills or ["Software Engineering"],
                "location": s.location or s.city or "Remote",
                "experience": f"{s.experience_years} years" if s.experience_years is not None else "3 years",
                "bio": s.summary or "Experienced professional eager to contribute to cutting-edge development workflows.",
                "status": pipeline_status,
                "isShortlisted": s.id in shortlists,
                "interviewStatus": interview_status,
                "isLocked": is_locked,
                "email": s.user.email if not is_locked else None,
                "phone": (s.phone or s.whatsapp_number) if not is_locked else None,
                "whatsapp": (s.whatsapp_number or s.phone) if not is_locked else None
            })

        response_data = {
            "statistics": {
                "total_candidates": total_candidates,
                "active_pipelines": active_pipelines,
                "interviewing_stages": interviewing_stages,
                "placements_made": placements_made
            },
            "candidates": candidates_list
        }

        if page is not None:
            return paginator.get_paginated_response(response_data)
        return Response(response_data)

class RecruiterCandidateActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.account_type not in ['RECRUITER', 'COMPANY']:
            return Response({"error": "Access denied. Corporate accounts only."}, status=status.HTTP_403_FORBIDDEN)

        agency_default = "Corporate Talent Sourcing" if request.user.account_type == 'COMPANY' else "Recruiter Agency"
        fname = getattr(request.user, 'first_name', '') or ''
        lname = getattr(request.user, 'last_name', '') or ''
        agency_name = f"{fname} {lname}".strip() or agency_default
        recruiter = get_or_create_recruiter(request.user, agency_name)

        candidate_id = request.data.get('candidate_id')
        action = request.data.get('action')

        if not candidate_id or not action:
            return Response({"error": "Both candidate_id and action are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            seeker = JobSeekers.objects.get(id=candidate_id)
        except JobSeekers.DoesNotExist:
            return Response({"error": "Candidate not found."}, status=status.HTTP_404_NOT_FOUND)

        job = Jobs.objects.filter(recruiter=recruiter).exclude(title="Elite Sourced Opening").first()

        if not job and action in ['invite', 'advance', 'schedule_interview', 'toggle_shortlist']:
            return Response(
                {"error": "You must post at least one job before taking pipeline actions on candidates."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if action == 'invite':
            app, created = Applications.objects.get_or_create(
                job=job,
                recruiter=recruiter,
                job_seeker=seeker,
                defaults={"status": "PENDING"}
            )
            prev_status = 'PENDING' if created else app.status
            app.status = 'INTERVIEW'
            app.interview_schedule = timezone.now() + timezone.timedelta(days=2)
            app.save()

            ApplicationStatusHistory.objects.create(
                application=app,
                previous_status=prev_status,
                new_status='INTERVIEW',
                changed_by_user=request.user,
                changed_at=timezone.now(),
                reason="Candidate invited to apply by recruiter."
            )
            return Response({"message": "Candidate invited successfully.", "status": "Interviewing"})

        elif action == 'advance':
            app, created = Applications.objects.get_or_create(
                job=job,
                recruiter=recruiter,
                job_seeker=seeker,
                defaults={"status": "PENDING"}
            )
            prev_status = 'PENDING' if created else app.status
            db_status = (app.status or "").upper()

            if db_status == 'PENDING' or db_status == 'SOURCED':
                next_status = 'INTERVIEW'
            elif db_status == 'INTERVIEW':
                next_status = 'OFFER'
            elif db_status == 'OFFER':
                next_status = 'PLACED'
            else:
                next_status = 'PENDING'

            app.status = next_status
            app.save()

            ApplicationStatusHistory.objects.create(
                application=app,
                previous_status=prev_status,
                new_status=next_status,
                changed_by_user=request.user,
                changed_at=timezone.now(),
                reason="Application advanced in recruiter pipeline."
            )
            return Response({"message": f"Candidate advanced to {next_status}.", "status": next_status})

        elif action == 'toggle_shortlist':
            shortlist_qs = CandidateShortlists.objects.filter(recruiter=recruiter, job_seeker=seeker)
            if shortlist_qs.exists():
                shortlist_qs.delete()
                is_shortlisted = False
                msg = "Profile removed from shortlist."
            else:
                CandidateShortlists.objects.create(
                    recruiter=recruiter,
                    job_seeker=seeker,
                    job=job
                )
                is_shortlisted = True
                msg = "Profile added to shortlist."

            return Response({"message": msg, "isShortlisted": is_shortlisted})

        elif action == 'schedule_interview':
            app, _ = Applications.objects.get_or_create(
                job=job,
                recruiter=recruiter,
                job_seeker=seeker,
                defaults={"status": "INTERVIEW"}
            )
            schedule_time = request.data.get('interview_schedule')
            if not schedule_time:
                schedule_time = timezone.now() + timezone.timedelta(days=1)
            
            app.interview_schedule = schedule_time
            app.status = 'INTERVIEW'
            app.save()

            from apps.communication.models import CalendarEvents
            CalendarEvents.objects.create(
                application=app,
                candidate=seeker.user,
                organizer=request.user,
                scheduled_time=schedule_time,
                meeting_link=f"https://meet.google.com/mock-{uuid.uuid4().hex[:8]}",
                rsvp_status='PENDING'
            )

            return Response({"message": "Interview scheduled successfully.", "interview_schedule": app.interview_schedule})

        elif action == 'unlock':
            from apps.commerce.models import CreditBalances, CreditTypes, CreditTransactions
            from apps.companies.models import CreditAuditLogs
            from django.db import transaction

            credit_type, _ = CreditTypes.objects.get_or_create(
                name="Talent Sourcing Credit",
                defaults={"description": "Used to unlock candidate contact details", "is_active": True}
            )

            credit_balance, created = CreditBalances.objects.get_or_create(
                user=request.user,
                credit_type=credit_type,
                defaults={
                    "available_credits": 5,
                    "reserved_credits": 0
                }
            )

            if credit_balance.available_credits < 1:
                return Response(
                    {"error": "Insufficient talent credits! Please top up your balance in the Billing Center."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                credit_balance.available_credits -= 1
                credit_balance.save()

                CreditTransactions.objects.create(
                    user=request.user,
                    credit_type=credit_type,
                    transaction_type="deduction",
                    amount=-1,
                    reference_type="unlock_candidate",
                    reference_id=seeker.id
                )

                CreditAuditLogs.objects.create(
                    user=request.user,
                    action_type="UNLOCK_CANDIDATE",
                    credits_deducted=1,
                    reference_id=str(seeker.id)
                )

            return Response({
                "message": "Candidate profile contact details successfully unlocked.",
                "isLocked": False,
                "email": seeker.user.email,
                "phone": seeker.phone or seeker.whatsapp_number or "",
                "whatsapp": seeker.whatsapp_number or seeker.phone or "",
                "available_credits": credit_balance.available_credits
            })

        else:
            return Response({"error": f"Invalid action: {action}"}, status=status.HTTP_400_BAD_REQUEST)

from apps.companies.models import CompanyTeamInvitations
from django.contrib.auth import get_user_model
from django.db import transaction
User = get_user_model()

class CompanyTeamListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.account_type != 'COMPANY' or not request.user.company:
            return Response({"error": "Access denied. Company members only."}, status=status.HTTP_403_FORBIDDEN)
        
        team_members = User.objects.filter(company=request.user.company)
        members_data = []
        for m in team_members:
            members_data.append({
                "id": str(m.id),
                "email": m.email,
                "first_name": getattr(m, 'first_name', '') or '',
                "last_name": getattr(m, 'last_name', '') or '',
                "team_role": m.team_role or 'VIEWER',
                "is_active": m.is_active
            })
        return Response(members_data)

    def delete(self, request, member_id=None):
        if request.user.account_type != 'COMPANY' or not request.user.company:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.team_role not in ['ADMIN', 'HIRING_MANAGER']:
            return Response({"error": "Only admins and hiring managers can manage team members."}, status=status.HTTP_403_FORBIDDEN)

        mid = member_id or request.data.get('member_id')
        if not mid:
            return Response({"error": "member_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = User.objects.get(id=mid, company=request.user.company)
        except User.DoesNotExist:
            return Response({"error": "Member not found in your company."}, status=status.HTTP_404_NOT_FOUND)

        if member.id == request.user.id:
            return Response({"error": "You cannot remove yourself from the company team."}, status=status.HTTP_400_BAD_REQUEST)

        # Dissociate the member from the company
        member.company = None
        member.team_role = None
        member.save()

        return Response({"message": "Team member removed successfully."})

class CompanyTeamInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.account_type != 'COMPANY' or not request.user.company:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        invites = CompanyTeamInvitations.objects.filter(company=request.user.company).order_by('-invited_at')
        invites_data = [{
            "id": str(i.id),
            "invited_email": i.invited_email,
            "role": i.role or 'VIEWER',
            "status": i.status or 'PENDING',
            "invited_at": i.invited_at
        } for i in invites]
        return Response(invites_data)

    def post(self, request):
        if request.user.account_type != 'COMPANY' or not request.user.company:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.team_role not in ['ADMIN', 'HIRING_MANAGER']:
            return Response({"error": "Only admins and hiring managers can send invitations."}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email')
        role = request.data.get('role', 'VIEWER')

        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        if role not in ['ADMIN', 'HIRING_MANAGER', 'INTERVIEWER', 'VIEWER']:
            return Response({"error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce corporate email domain match or at least block public domains
        public_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com']
        domain = email.split('@')[-1].lower().strip()
        if domain in public_domains:
            return Response({"error": "Invitations are restricted to corporate email domains."}, status=status.HTTP_400_BAD_REQUEST)

        # If user is already in another company
        existing_user = User.objects.filter(email=email).first()
        if existing_user and existing_user.company:
            return Response({"error": "User with this email is already a member of a company."}, status=status.HTTP_400_BAD_REQUEST)

        invited_at = timezone.now()
        expires_at = invited_at + timezone.timedelta(days=7)
        invite, created = CompanyTeamInvitations.objects.update_or_create(
            company=request.user.company,
            invited_email=email,
            defaults={
                'role': role,
                'status': 'PENDING',
                'invited_at': invited_at,
                'expires_at': expires_at
            }
        )

        from apps.users.utils import send_team_invite_email
        send_team_invite_email(email, request.user.company.name or "JobLyne Team", role)

        return Response({
            "message": "Team invitation sent successfully.",
            "invite": {
                "id": str(invite.id),
                "invited_email": invite.invited_email,
                "role": invite.role,
                "status": invite.status,
                "invited_at": invite.invited_at,
                "expires_at": invite.expires_at
            }
        })

class AcceptTeamInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Allow logged in user to accept a pending invitation for their email
        email = request.user.email
        invite = CompanyTeamInvitations.objects.filter(invited_email=email, status='PENDING').first()
        if not invite:
            return Response({"error": "No pending invitation found for your email address."}, status=status.HTTP_404_NOT_FOUND)

        if invite.expires_at and invite.expires_at < timezone.now():
            return Response({"error": "This invitation has expired. Please request a new invitation."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Update user company and role
            request.user.company = invite.company
            request.user.team_role = invite.role or 'VIEWER'
            request.user.account_type = 'COMPANY'
            request.user.save()

            # Mark invite as accepted
            invite.status = 'ACCEPTED'
            invite.save()

        return Response({
            "message": "Invitation accepted. Welcome to the team!",
            "company_name": invite.company.name,
            "role": invite.role
        })

class PublicCompanyProfileView(APIView):
    permission_classes = [] # Publicly accessible view

    def get(self, request, company_id):
        try:
            company = Companies.objects.get(id=company_id)
        except Companies.DoesNotExist:
            return Response({"error": "Company not found."}, status=status.HTTP_404_NOT_FOUND)
        
        from apps.companies.serializers import CompanyProfileSerializer
        from apps.jobs.models import Jobs
        from apps.jobs.serializers import JobSerializer
        
        company_serializer = CompanyProfileSerializer(company)
        
        jobs = Jobs.objects.filter(company=company, status='OPEN').select_related('company', 'location').prefetch_related('job_skills_job__skill').order_by('-posted_at')
        job_serializer = JobSerializer(jobs, many=True)
        
        response_data = {
            "profile": company_serializer.data,
            "jobs": job_serializer.data
        }
        return Response(response_data)

from apps.companies.serializers import RecruiterProfileSerializer

class RecruiterProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_recruiter(self, user):
        agency_default = "Recruiter Agency"
        fname = getattr(user, 'first_name', '') or ''
        lname = getattr(user, 'last_name', '') or ''
        agency_name = f"{fname} {lname}".strip() or agency_default
        recruiter = get_or_create_recruiter(user, agency_name)
        return recruiter

    def get(self, request):
        if request.user.account_type != 'RECRUITER':
            raise PermissionDenied("Only recruiter accounts can access this endpoint.")
        recruiter = self.get_recruiter(request.user)
        
        initial_data = {
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "phone": request.user.phone,
            "profile_photo_url": request.user.profile_photo_url,
            "email": request.user.email,
            "agency_name": recruiter.agency_name
        }
        serializer = RecruiterProfileSerializer(initial_data)
        return Response(serializer.data)

    def patch(self, request):
        if request.user.account_type != 'RECRUITER':
            raise PermissionDenied("Only recruiter accounts can access this endpoint.")
        recruiter = self.get_recruiter(request.user)
        
        serializer = RecruiterProfileSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            user = request.user
            if 'first_name' in serializer.validated_data:
                user.first_name = serializer.validated_data['first_name']
            if 'last_name' in serializer.validated_data:
                user.last_name = serializer.validated_data['last_name']
            if 'phone' in serializer.validated_data:
                user.phone = serializer.validated_data['phone']
            if 'profile_photo_url' in serializer.validated_data:
                user.profile_photo_url = serializer.validated_data['profile_photo_url']
            user.save()

            if 'agency_name' in serializer.validated_data:
                recruiter.agency_name = serializer.validated_data['agency_name']
                recruiter.save()

            response_data = {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "profile_photo_url": user.profile_photo_url,
                "email": user.email,
                "agency_name": recruiter.agency_name
            }
            return Response(response_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


import os
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core.mail import send_mail
from rest_framework.parsers import MultiPartParser, FormParser

class CompanyFileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        
        # Limit file size to 5MB
        if uploaded_file.size > 5 * 1024 * 1024:
            return Response({"error": "File size exceeds 5MB limit."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Limit file type to PDF, JPG, PNG
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
            return Response({"error": "Invalid file type. Only PDF, JPG, and PNG are allowed."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save to local media uploads
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        fs = FileSystemStorage(location=upload_dir, base_url=settings.MEDIA_URL + 'uploads/')
        filename = fs.save(f"{uuid.uuid4().hex}{ext}", uploaded_file)
        file_url = fs.url(filename)
        
        return Response({"file_url": file_url}, status=status.HTTP_201_CREATED)

class CompanySubmitVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get_company(self, user):
        if getattr(user, 'company', None):
            return user.company
        try:
            adv_account = AdvertiserAccounts.objects.get(user=user)
            return adv_account.company
        except AdvertiserAccounts.DoesNotExist:
            return None

    def post(self, request, *args, **kwargs):
        if request.user.account_type != 'COMPANY':
            raise PermissionDenied("Only company accounts can access this endpoint.")
            
        company = self.get_company(request.user)
        if not company:
            return Response({"error": "No company associated with this user."}, status=status.HTTP_404_NOT_FOUND)
        
        # Check required fields
        required_fields = [
            'legal_name', 'registration_number', 'tax_id', 
            'registered_address', 'official_email', 'phone_number', 
            'authorized_contact_name', 'authorized_contact_designation',
            'incorporation_doc_url', 'tax_doc_url'
        ]
        
        missing = []
        for field in required_fields:
            val = getattr(company, field)
            if not val or (isinstance(val, str) and not val.strip()):
                missing.append(field)
                
        if missing:
            return Response(
                {"error": f"Missing required verification fields or document uploads: {', '.join(missing)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Update verification status to pending
        company.verification_status = 'pending'
        company.save()
        
        # Send confirmation email to official_email
        try:
            subject = f"Company Verification Submitted — {company.legal_name}"
            message = f"Hi {company.authorized_contact_name},\n\nWe have received your company verification request for {company.legal_name}. Our admin team is currently reviewing your documents. We will notify you once the review is complete.\n\nBest regards,\nThe JobLyne Team"
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [company.official_email],
                fail_silently=True
            )
        except Exception:
            pass
            
        # Send notification to admin/backend team
        try:
            subject = f"[PENDING VERIFICATION] New Company Registration: {company.legal_name}"
            message = f"A new company verification request for '{company.legal_name}' (ID: {company.id}) has been submitted. Please review the documents in the admin dashboard.\n\nBest regards,\nThe JobLyne Team"
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.DEFAULT_FROM_EMAIL],
                fail_silently=True
            )
        except Exception:
            pass
            
        return Response({
            "message": "Company verification request submitted successfully.",
            "verification_status": "pending"
        }, status=status.HTTP_200_OK)

class AdminPendingCompaniesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
            
        companies = Companies.objects.filter(verification_status='pending').order_by('-created_at')
        serializer = CompanyProfileSerializer(companies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminVerifyActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, company_id, *args, **kwargs):
        if not request.user.is_staff:
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            company = Companies.objects.get(id=company_id)
        except Companies.DoesNotExist:
            return Response({"error": "Company not found."}, status=status.HTTP_404_NOT_FOUND)
            
        action = request.data.get('action') # 'approve' or 'reject'
        notes = request.data.get('notes', '')
        
        if action not in ['approve', 'reject']:
            return Response({"error": "Action must be 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)
            
        if action == 'approve':
            company.verification_status = 'verified'
            company.verified_badge = True
            company.verification_notes = notes or "Approved by administrator."
            company.save()
            
            # Send approval email
            try:
                subject = f"Company Verified! — {company.legal_name}"
                message = f"Hi {company.authorized_contact_name},\n\nWe are pleased to inform you that your company profile for {company.legal_name} has been verified! You can now publish job posts on JobLyne.\n\nBest regards,\nThe JobLyne Team"
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [company.official_email],
                    fail_silently=True
                )
            except Exception:
                pass
                
        elif action == 'reject':
            if not notes.strip():
                return Response({"error": "Reason/Notes are required for rejection."}, status=status.HTTP_400_BAD_REQUEST)
                
            company.verification_status = 'rejected'
            company.verified_badge = False
            company.verification_notes = notes
            company.save()
            
            # Send rejection email
            try:
                subject = f"Company Verification Rejected — {company.legal_name}"
                message = f"Hi {company.authorized_contact_name},\n\nUnfortunately, your company verification request for {company.legal_name} was rejected.\n\nReason: {notes}\n\nYou can log in, correct the profile details, and resubmit for verification.\n\nBest regards,\nThe JobLyne Team"
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [company.official_email],
                    fail_silently=True
                )
            except Exception:
                pass
                
        return Response({
            "message": f"Company registration {company.verification_status} successfully.",
            "verification_status": company.verification_status,
            "verified_badge": company.verified_badge
        }, status=status.HTTP_200_OK)

