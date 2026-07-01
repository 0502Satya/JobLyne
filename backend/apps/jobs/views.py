import uuid
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.utils import timezone
from django.db import transaction

from apps.jobs.models import Jobs, JobSkills, Applications
from apps.candidates.models import JobSeekers, JobSeekerSkills, SavedJobs, CandidateShortlists, CandidateProfileViews
from apps.companies.models import Recruiters, Companies
from apps.taxonomy.models import Skills
from apps.jobs.serializers import JobSerializer, ApplicationSerializer
from apps.users.permissions import IsCorporate

class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class JobListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsCorporate()]

    def get(self, request):
        query = request.query_params.get('query', '')
        location = request.query_params.get('location', '')
        experience = request.query_params.get('experience', None)
        salary_min = request.query_params.get('salary_min', None)
        salary_max = request.query_params.get('salary_max', None)
        employment_type = request.query_params.get('employment_type', '')
        
        jobs = Jobs.objects.all().select_related('company', 'location', 'job_category', 'industry').prefetch_related('job_skills_job__skill').order_by('-posted_at')
        
        my_jobs = request.query_params.get('my_jobs', '')
        if my_jobs == 'true':
            if request.user.is_authenticated and request.user.account_type == 'COMPANY':
                if request.user.company:
                    jobs = jobs.filter(company=request.user.company)
                else:
                    jobs = jobs.none()
            elif request.user.is_authenticated and request.user.account_type == 'RECRUITER':
                try:
                    recruiter = Recruiters.objects.get(user=request.user)
                    jobs = jobs.filter(recruiter=recruiter)
                except Recruiters.DoesNotExist:
                    jobs = jobs.none()
            else:
                jobs = jobs.none()
        
        if query:
            jobs = jobs.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query) |
                Q(company__name__icontains=query)
            )
            
        if location:
            jobs = jobs.filter(location__city__icontains=location)

        if experience is not None:
            try:
                exp_int = int(experience)
                jobs = jobs.filter(experience_required__lte=exp_int)
            except ValueError:
                pass

        if salary_min is not None:
            try:
                min_val = float(salary_min)
                jobs = jobs.filter(salary_max__gte=min_val)
            except ValueError:
                pass

        if salary_max is not None:
            try:
                max_val = float(salary_max)
                jobs = jobs.filter(salary_min__lte=max_val)
            except ValueError:
                pass

        if employment_type:
            jobs = jobs.filter(employment_type__icontains=employment_type)

        paginator = JobPagination()
        page = paginator.paginate_queryset(jobs, request)
        
        if page is not None:
            serializer = JobSerializer(page, many=True)
            response_data = serializer.data
        else:
            serializer = JobSerializer(jobs, many=True)
            response_data = serializer.data
        
        if request.user.is_authenticated and request.user.account_type == 'CANDIDATE':
            try:
                job_seeker = JobSeekers.objects.get(user=request.user)
                saved_job_ids = set(SavedJobs.objects.filter(job_seeker=job_seeker).values_list('job_id', flat=True))
                applied_job_ids = set(Applications.objects.filter(job_seeker=job_seeker).values_list('job_id', flat=True))
                candidate_skills = set(JobSeekerSkills.objects.filter(job_seeker=job_seeker).values_list('skill__name', flat=True))
                
                for job_data in response_data:
                    job_uuid = uuid.UUID(job_data['id'])
                    job_data['is_saved'] = job_uuid in saved_job_ids
                    job_data['has_applied'] = job_uuid in applied_job_ids
                    
                    job_skills = set(name.lower() for name in job_data.get('skills', []))
                    cand_skills = set(name.lower() for name in candidate_skills)
                    
                    if job_skills:
                        intersect = job_skills.intersection(cand_skills)
                        match_ratio = (len(intersect) / len(job_skills)) * 100
                    else:
                        desc_and_req = ((job_data.get('requirements') or "") + " " + (job_data.get('description') or "")).lower()
                        if cand_skills:
                            matches = sum(1 for skill in cand_skills if skill in desc_and_req)
                            match_ratio = (matches / min(len(cand_skills), 3)) * 100
                        else:
                            match_ratio = 0
                    
                    job_data['match_score'] = min(max(round(match_ratio), 0), 100)
            except JobSeekers.DoesNotExist:
                for job_data in response_data:
                    job_data['is_saved'] = False
                    job_data['has_applied'] = False
                    job_data['match_score'] = 60
        else:
            for job_data in response_data:
                job_data['is_saved'] = False
                job_data['has_applied'] = False
                job_data['match_score'] = 60

        if page is not None:
            return paginator.get_paginated_response(response_data)
        return Response(response_data)

    def post(self, request):
        title = request.data.get('title')
        description = request.data.get('description', '')
        requirements = request.data.get('requirements', '')
        raw_location = request.data.get('location', '')
        employment_type = request.data.get('employment_type', 'Full-time')
        experience_required = request.data.get('experience_required')
        salary_min = request.data.get('salary_min')
        salary_max = request.data.get('salary_max')
        currency = request.data.get('currency', 'USD')
        skills_list = request.data.get('skills', [])

        if not title:
            return Response({"error": "Job title is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            exp_val = int(experience_required) if experience_required is not None else None
        except (ValueError, TypeError):
            exp_val = None

        try:
            s_min = float(salary_min) if salary_min is not None else None
        except (ValueError, TypeError):
            s_min = None

        try:
            s_max = float(salary_max) if salary_max is not None else None
        except (ValueError, TypeError):
            s_max = None

        with transaction.atomic():
            company = None
            recruiter = None

            if request.user.account_type == 'COMPANY':
                company = request.user.company
                if not company:
                    return Response(
                        {"error": "No company profile associated with this company user. Please complete company profile onboarding first."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if company.verification_status != 'verified':
                    return Response(
                        {"error": "Your company profile is not verified yet. Job posting is gated until admin review is complete."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            elif request.user.account_type == 'RECRUITER':
                try:
                    recruiter = Recruiters.objects.get(user=request.user)
                    company, _ = Companies.objects.get_or_create(
                        name=recruiter.agency_name or "Recruiting Agency",
                        defaults={"industry": "Staffing"}
                    )
                except Recruiters.DoesNotExist:
                    recruiter = Recruiters.objects.create(
                        user=request.user,
                        agency_name="Staffing Solutions"
                    )
                    company, _ = Companies.objects.get_or_create(
                        name="Staffing Solutions",
                        defaults={"industry": "Staffing"}
                    )

            job = Jobs.objects.create(
                company=company,
                recruiter=recruiter,
                title=title,
                description=description,
                requirements=requirements,
                raw_location=raw_location,
                employment_type=employment_type,
                experience_required=exp_val,
                salary_min=s_min,
                salary_max=s_max,
                currency=currency,
                status='OPEN',
                posted_at=timezone.now()
            )

            if skills_list:
                for skill_name in skills_list:
                    if skill_name:
                        clean_name = skill_name.strip()
                        skill = Skills.objects.filter(name__iexact=clean_name).first()
                        if not skill:
                            skill = Skills.objects.create(name=clean_name)
                        JobSkills.objects.create(job=job, skill=skill, is_required=True)

        serializer = JobSerializer(job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class JobDetailView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk):
        try:
            job = Jobs.objects.select_related('company', 'location', 'job_category', 'industry').prefetch_related('job_skills_job__skill').get(pk=pk)
            serializer = JobSerializer(job)
            data = serializer.data
            
            if request.user.is_authenticated and request.user.account_type == 'CANDIDATE':
                try:
                    job_seeker = JobSeekers.objects.get(user=request.user)
                    data['has_applied'] = Applications.objects.filter(job=job, job_seeker=job_seeker).exists()
                    data['is_saved'] = SavedJobs.objects.filter(job=job, job_seeker=job_seeker).exists()
                except JobSeekers.DoesNotExist:
                    data['has_applied'] = False
                    data['is_saved'] = False
            else:
                data['has_applied'] = False
                data['is_saved'] = False
            
            return Response(data)
        except Jobs.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            job = Jobs.objects.get(pk=pk)
        except Jobs.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        is_authorized = False
        if request.user.account_type == 'COMPANY':
            if request.user.company and job.company == request.user.company:
                is_authorized = True
        elif request.user.account_type == 'RECRUITER':
            try:
                recruiter = Recruiters.objects.get(user=request.user)
                if job.recruiter == recruiter:
                    is_authorized = True
            except Recruiters.DoesNotExist:
                pass

        if not is_authorized and not request.user.is_staff:
            return Response({"error": "You do not have permission to modify this job."}, status=status.HTTP_403_FORBIDDEN)

        status_val = request.data.get('status')
        if status_val:
            status_upper = status_val.upper()
            if status_upper in ['ACTIVE', 'OPEN']:
                job.status = 'OPEN'
            elif status_upper in ['DRAFT']:
                job.status = 'DRAFT'
            elif status_upper in ['CLOSED']:
                job.status = 'CLOSED'
            else:
                job.status = status_val

        title = request.data.get('title')
        if title:
            job.title = title

        description = request.data.get('description')
        if description is not None:
            job.description = description

        requirements = request.data.get('requirements')
        if requirements is not None:
            job.requirements = requirements

        location = request.data.get('location')
        if location is not None:
            job.raw_location = location

        job.save()
        serializer = JobSerializer(job)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            job = Jobs.objects.get(pk=pk)
        except Jobs.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        is_authorized = False
        if request.user.account_type == 'COMPANY':
            if request.user.company and job.company == request.user.company:
                is_authorized = True
        elif request.user.account_type == 'RECRUITER':
            try:
                recruiter = Recruiters.objects.get(user=request.user)
                if job.recruiter == recruiter:
                    is_authorized = True
            except Recruiters.DoesNotExist:
                pass

        if not is_authorized and not request.user.is_staff:
            return Response({"error": "You do not have permission to delete this job."}, status=status.HTTP_403_FORBIDDEN)

        job.delete()
        return Response({"success": "Job deleted successfully"}, status=status.HTTP_200_OK)

class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.account_type == 'CANDIDATE':
            return Applications.objects.filter(job_seeker__user=user).select_related('job', 'job__company').order_by('-applied_at')
        elif user.account_type == 'COMPANY' and user.company:
            return Applications.objects.filter(job__company=user.company).select_related('job', 'job_seeker', 'job_seeker__user').order_by('-applied_at')
        elif user.account_type == 'RECRUITER':
            try:
                recruiter = Recruiters.objects.get(user=user)
                return Applications.objects.filter(recruiter=recruiter).select_related('job', 'job_seeker', 'job_seeker__user').order_by('-applied_at')
            except Recruiters.DoesNotExist:
                return Applications.objects.none()
        return Applications.objects.none()

    def create(self, request, *args, **kwargs):
        job_id = request.data.get('job')
        if not job_id:
            return Response({"error": "Job ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            job = Jobs.objects.get(id=job_id)
            job_seeker = JobSeekers.objects.get(user=request.user)
            
            if Applications.objects.filter(job=job, job_seeker=job_seeker).exists():
                return Response({"error": "You have already applied for this job."}, status=status.HTTP_400_BAD_REQUEST)
            
            application = Applications.objects.create(
                job=job,
                job_seeker=job_seeker,
                status='PENDING'
            )

            serializer = self.get_serializer(application)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Jobs.DoesNotExist:
            return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
        except JobSeekers.DoesNotExist:
            return Response({"error": "Candidate profile not found."}, status=status.HTTP_404_NOT_FOUND)

    def get_stats(self, request):
        if request.user.account_type != 'CANDIDATE':
            return Response({"error": "Only candidates can access stats."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            from datetime import timedelta
            job_seeker = JobSeekers.objects.get(user=request.user)
            total_applications = Applications.objects.filter(job_seeker=job_seeker).count()
            
            # Real profile views from the candidate_profile_views table
            now = timezone.now()
            seven_days_ago = now - timedelta(days=7)
            fourteen_days_ago = now - timedelta(days=14)
            
            profile_views = CandidateProfileViews.objects.filter(job_seeker=job_seeker).count()
            views_this_week = CandidateProfileViews.objects.filter(job_seeker=job_seeker, viewed_at__gte=seven_days_ago).count()
            views_last_week = CandidateProfileViews.objects.filter(job_seeker=job_seeker, viewed_at__range=(fourteen_days_ago, seven_days_ago)).count()
            
            # Calculate week-over-week growth percentage
            if views_last_week == 0:
                profile_views_change = 100 if views_this_week > 0 else 0
            else:
                profile_views_change = int(((views_this_week - views_last_week) / views_last_week) * 100)
            
            # Count of pending review applications
            pending_applications = Applications.objects.filter(job_seeker=job_seeker, status='PENDING').count()
            
            # Number of interview phase applications
            interviews = Applications.objects.filter(job_seeker=job_seeker, status='INTERVIEW').count()
            
            # Next upcoming interview details
            next_interview_app = Applications.objects.filter(
                job_seeker=job_seeker, 
                status='INTERVIEW', 
                interview_schedule__isnull=False,
                interview_schedule__gte=timezone.now()
            ).order_by('interview_schedule').first()
            
            next_interview_time = None
            if next_interview_app:
                next_interview_time = next_interview_app.interview_schedule.isoformat()
            
            return Response({
                "applications": total_applications,
                "pending_applications": pending_applications,
                "profile_views": profile_views,
                "profile_views_change": profile_views_change,
                "interviews": interviews,
                "next_interview_time": next_interview_time
            })
        except JobSeekers.DoesNotExist:
             return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='bulk-status-update')
    def bulk_status_update(self, request):
        user = request.user
        if user.account_type not in ['COMPANY', 'RECRUITER']:
            return Response({"error": "Access denied. Corporate accounts only."}, status=status.HTTP_403_FORBIDDEN)
        
        application_ids = request.data.get('application_ids', [])
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')

        if not application_ids or not new_status:
            return Response({"error": "Both application_ids and status are required."}, status=status.HTTP_400_BAD_REQUEST)

        if new_status not in ['PENDING', 'INTERVIEW', 'OFFER', 'PLACED', 'REJECTED']:
            return Response({"error": f"Invalid status: {new_status}."}, status=status.HTTP_400_BAD_REQUEST)

        applications = Applications.objects.filter(id__in=application_ids).select_related('job__company', 'recruiter__user')
        updated_count = 0
        for app in applications:
            is_owner = False
            if user.account_type == 'COMPANY' and user.company and app.job.company == user.company:
                is_owner = True
            elif user.account_type == 'RECRUITER' and app.recruiter and app.recruiter.user == user:
                is_owner = True

            if is_owner:
                prev_status = app.status
                app.status = new_status
                app.save()

                from apps.jobs.models import ApplicationStatusHistory
                ApplicationStatusHistory.objects.create(
                    application=app,
                    previous_status=prev_status,
                    new_status=new_status,
                    changed_by_user=user,
                    changed_at=timezone.now(),
                    reason=reason or f"Bulk status update to {new_status}."
                )
                updated_count += 1

        return Response({"message": f"Successfully updated {updated_count} applications to {new_status}."})

    @action(detail=True, methods=['post'], url_path='schedule-interview')
    def schedule_interview(self, request, pk=None):
        user = request.user
        if user.account_type not in ['COMPANY', 'RECRUITER']:
            return Response({"error": "Access denied. Corporate accounts only."}, status=status.HTTP_403_FORBIDDEN)

        application = self.get_object()
        is_owner = False
        if user.account_type == 'COMPANY' and user.company and application.job.company == user.company:
            is_owner = True
        elif user.account_type == 'RECRUITER' and application.recruiter and application.recruiter.user == user:
            is_owner = True

        if not is_owner:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        interview_time = request.data.get('interview_schedule')
        if not interview_time:
            return Response({"error": "interview_schedule date-time is required."}, status=status.HTTP_400_BAD_REQUEST)

        prev_status = application.status
        application.interview_schedule = interview_time
        application.status = 'INTERVIEW'
        application.save()

        from apps.jobs.models import ApplicationStatusHistory
        ApplicationStatusHistory.objects.create(
            application=application,
            previous_status=prev_status,
            new_status='INTERVIEW',
            changed_by_user=user,
            changed_at=timezone.now(),
            reason="Interview scheduled."
        )

        from apps.communication.models import CalendarEvents
        CalendarEvents.objects.create(
            application=application,
            candidate=application.job_seeker.user,
            organizer=user,
            scheduled_time=interview_time,
            meeting_link=f"https://meet.google.com/mock-{uuid.uuid4().hex[:8]}",
            rsvp_status='PENDING'
        )

        return Response({
            "message": "Interview scheduled successfully.",
            "interview_schedule": application.interview_schedule
        })

class CloneJobView(APIView):
    permission_classes = [IsAuthenticated, IsCorporate]

    def post(self, request, pk):
        try:
            job = Jobs.objects.get(pk=pk)
        except Jobs.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        is_authorized = False
        if request.user.account_type == 'COMPANY':
            if request.user.company and job.company == request.user.company:
                is_authorized = True
        elif request.user.account_type == 'RECRUITER':
            try:
                recruiter = Recruiters.objects.get(user=request.user)
                if job.recruiter == recruiter:
                    is_authorized = True
            except Recruiters.DoesNotExist:
                pass

        if not is_authorized and not request.user.is_staff:
            return Response({"error": "You do not have permission to clone this job."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            new_job = Jobs.objects.create(
                company=job.company,
                recruiter=job.recruiter,
                title=f"Copy of {job.title}",
                description=job.description,
                requirements=job.requirements,
                raw_location=job.raw_location,
                location=job.location,
                job_category=job.job_category,
                industry=job.industry,
                employment_type=job.employment_type,
                experience_required=job.experience_required,
                salary_min=job.salary_min,
                salary_max=job.salary_max,
                currency=job.currency,
                status='DRAFT',
                posted_at=timezone.now()
            )

            from apps.jobs.models import JobSkills
            skills = JobSkills.objects.filter(job=job)
            for s in skills:
                JobSkills.objects.create(
                    job=new_job,
                    skill=s.skill,
                    is_required=s.is_required
                )

        serializer = JobSerializer(new_job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class GenerateJDView(APIView):
    permission_classes = [IsAuthenticated, IsCorporate]

    def post(self, request):

        title = request.data.get('title', 'Software Engineer')
        skills = request.data.get('skills', [])
        location = request.data.get('location', 'Remote')
        experience = request.data.get('experience_required', 3)

        skills_str = ", ".join(skills) if skills else "relevant technology stacks"

        description = (
            f"We are seeking a talented {title} to join our high-performing team. "
            f"In this role, you will design, develop, and deploy scalable services, collaborating closely with product managers and other engineers.\n\n"
            f"Key Responsibilities:\n"
            f"- Build and maintain secure, reliable, and high-performance applications.\n"
            f"- Drive technical decisions and contribute to design systems and codebase architecture.\n"
            f"- Write clean, well-tested, and documented code.\n"
            f"- Work in an agile environment with focus on remote-first alignment.\n\n"
            f"Work Location: {location}\n"
        )

        requirements = (
            f"- Minimum {experience} years of professional software development experience.\n"
            f"- Strong proficiency working with {skills_str}.\n"
            f"- Experience with database design, API design, and version control tools (e.g. Git).\n"
            f"- Excellent problem-solving skills and communication capabilities.\n"
            f"- Bachelor's or Master's degree in Computer Science, or equivalent practical experience."
        )

        return Response({
            "title": title,
            "description": description,
            "requirements": requirements,
            "skills": skills
        }, status=status.HTTP_200_OK)

