from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
import datetime
from django.utils import timezone

from apps.candidates.models import SavedJobs, JobSeekers, JobSeekerSkills, CandidateProfileViews
from apps.jobs.models import Jobs, Applications
from apps.jobs.serializers import JobSerializer
from apps.candidates.serializers import CandidateProfileSerializer
from apps.candidates.utils import calculate_profile_completeness
from apps.users.permissions import IsCandidate
from apps.companies.models import Companies, CompanyRecruiterRelations

class CandidateProfileView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_job_seeker(self, user):
        try:
            return JobSeekers.objects.select_related('user').prefetch_related(
                'candidate_experience_job_seeker',
                'candidate_education_job_seeker',
                'candidate_certifications_job_seeker',
                'candidate_projects_job_seeker',
                'candidate_languages_job_seeker',
                'candidate_portfolio_links_job_seeker',
                'job_seeker_skills_job_seeker__skill'
            ).get(user=user)
        except JobSeekers.DoesNotExist:
            return None

    def get(self, request):
        job_seeker = self.get_job_seeker(request.user)
        if not job_seeker:
            return Response({"error": "No profile found for this user."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CandidateProfileSerializer(job_seeker, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        job_seeker = self.get_job_seeker(request.user)
        if not job_seeker:
            return Response({"error": "No profile found for this user."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CandidateProfileSerializer(job_seeker, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SavedJobViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            job_seeker = JobSeekers.objects.get(user=self.request.user)
            return SavedJobs.objects.filter(job_seeker=job_seeker).select_related('job', 'job__company')
        except JobSeekers.DoesNotExist:
            return SavedJobs.objects.none()
        
    def list(self, request):
        import uuid
        queryset = self.get_queryset()
        jobs = [sj.job for sj in queryset]
        serializer = JobSerializer(jobs, many=True)
        response_data = serializer.data
        
        if request.user.is_authenticated and request.user.account_type == 'CANDIDATE':
            try:
                job_seeker = JobSeekers.objects.get(user=request.user)
                applied_job_ids = set(Applications.objects.filter(job_seeker=job_seeker).values_list('job_id', flat=True))
                for job_data in response_data:
                    job_uuid = uuid.UUID(job_data['id'])
                    job_data['is_saved'] = True
                    job_data['has_applied'] = job_uuid in applied_job_ids
            except JobSeekers.DoesNotExist:
                for job_data in response_data:
                    job_data['is_saved'] = True
                    job_data['has_applied'] = False
        else:
            for job_data in response_data:
                job_data['is_saved'] = False
                job_data['has_applied'] = False
                
        return Response(response_data)

    def create(self, request):
        job_id = request.data.get('job')
        try:
            job_seeker = JobSeekers.objects.get(user=request.user)
            job = Jobs.objects.get(id=job_id)
            
            saved_job, created = SavedJobs.objects.get_or_create(
                job_seeker=job_seeker,
                job=job
            )
            if not created:
                return Response({"message": "Job already saved"}, status=status.HTTP_200_OK)
            return Response({"message": "Job saved successfully"}, status=status.HTTP_201_CREATED)
        except (JobSeekers.DoesNotExist, Jobs.DoesNotExist):
            return Response({"error": "Invalid job or user"}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            job_seeker = JobSeekers.objects.get(user=request.user)
            SavedJobs.objects.filter(job_seeker=job_seeker, job_id=pk).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except JobSeekers.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class ActionPlanView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            job_seeker = JobSeekers.objects.get(user=request.user)
        except JobSeekers.DoesNotExist:
            return Response({"error": "Job seeker profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        completeness = calculate_profile_completeness(request.user)
        application_count = Applications.objects.filter(job_seeker=job_seeker).count()
        skill_count = JobSeekerSkills.objects.filter(job_seeker=job_seeker).count()
        
        actions = []
        
        if completeness < 100:
            actions.append({
                "id": "complete_profile",
                "title": "Complete your profile",
                "description": f"Your profile is {completeness}% complete. Add more details to stand out.",
                "icon": "person_add",
                "link": "/dashboard/profile"
            })
            
        if skill_count < 3:
            actions.append({
                "id": "add_skills",
                "title": "Add more skills",
                "description": "Candidates with 5+ skills are 2x more likely to be noticed.",
                "icon": "bolt",
                "link": "/dashboard/profile"
            })
            
        if application_count == 0:
            actions.append({
                "id": "first_application",
                "title": "Apply to your first job",
                "description": "Start your journey by applying to recommended roles.",
                "icon": "rocket_launch",
                "link": "/dashboard"
            })
        else:
            actions.append({
                "id": "track_applications",
                "title": "Track your applications",
                "description": f"You have {application_count} active applications. Check their status.",
                "icon": "fact_check",
                "link": "/dashboard/applications"
            })
            
        return Response(actions)

class CandidateComparisonView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.account_type not in ['COMPANY', 'RECRUITER']:
            raise PermissionDenied("Only corporate accounts can compare candidates.")

        candidate_ids_str = request.query_params.get('candidate_ids', '')
        if not candidate_ids_str:
            return Response({"error": "candidate_ids parameter is required (comma-separated UUIDs)."}, status=status.HTTP_400_BAD_REQUEST)

        candidate_ids = [cid.strip() for cid in candidate_ids_str.split(',') if cid.strip()]
        if not candidate_ids:
            return Response({"error": "No valid candidate IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        seekers = JobSeekers.objects.filter(id__in=candidate_ids).prefetch_related(
            'candidate_experience_job_seeker',
            'candidate_education_job_seeker',
            'candidate_certifications_job_seeker',
            'candidate_projects_job_seeker',
            'job_seeker_skills_job_seeker__skill'
        )

        serializer = CandidateProfileSerializer(seekers, many=True)
        data = serializer.data

        from apps.companies.models import CreditAuditLogs
        unlocked_ids = set(
            CreditAuditLogs.objects.filter(
                user=request.user,
                action_type="UNLOCK_CANDIDATE"
            ).values_list('reference_id', flat=True)
        )

        for candidate_data in data:
            candidate_id = candidate_data.get('id')
            if candidate_id not in unlocked_ids:
                candidate_data['phone'] = None
                candidate_data['whatsapp_number'] = None

        return Response(data)


def get_company_for_user(user):
    if user.account_type == 'COMPANY':
        return user.company
    elif user.account_type == 'RECRUITER':
        relation = CompanyRecruiterRelations.objects.filter(recruiter__user=user).select_related('company').first()
        if relation:
            return relation.company
    return None


class RecordProfileViewView(APIView):
    """Called when a recruiter/company opens a candidate's profile page.
    POST /api/profile/view/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.account_type not in ['RECRUITER', 'COMPANY']:
            return Response({"error": "Only recruiters and companies can record profile views."}, status=status.HTTP_403_FORBIDDEN)

        candidate_id = request.data.get('candidateId')
        company_id = request.data.get('companyId')
        job_id = request.data.get('jobId')

        if not candidate_id:
            return Response({"error": "candidateId is required."}, status=status.HTTP_400_BAD_REQUEST)

        company = get_company_for_user(request.user)
        if not company:
            return Response({"error": "Authenticated user is not associated with any company profile."}, status=status.HTTP_403_FORBIDDEN)

        if company_id and str(company.id) != str(company_id):
            return Response({"error": "Unauthorized action on behalf of this company."}, status=status.HTTP_403_FORBIDDEN)

        try:
            candidate = JobSeekers.objects.get(id=candidate_id)
        except JobSeekers.DoesNotExist:
            return Response({"error": "Candidate not found."}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        should_increment = False

        view_record = CandidateProfileViews.objects.filter(
            job_seeker=candidate,
            company=company
        ).first()

        if not view_record:
            CandidateProfileViews.objects.create(
                job_seeker=candidate,
                company=company,
                job_id=job_id,
                viewer=request.user
            )
            should_increment = True
        else:
            last_view = view_record.last_viewed_at or view_record.viewed_at
            time_diff = now - last_view
            if time_diff.total_seconds() > 24 * 3600:
                view_record.job_id = job_id
                view_record.viewer = request.user
                view_record.save()
                should_increment = True

        if should_increment:
            candidate.profile_view_count = (candidate.profile_view_count or 0) + 1
            candidate.save(update_fields=['profile_view_count'])

        return Response({"message": "Profile view recorded successfully.", "incremented": should_increment}, status=status.HTTP_200_OK)


class CandidateAnalyticsView(APIView):
    """Provides view analytics for a candidate's own dashboard.
    GET /api/candidate/profile-analytics/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.account_type != 'CANDIDATE':
            return Response({"error": "Only candidates can access profile analytics."}, status=status.HTTP_403_FORBIDDEN)

        try:
            job_seeker = JobSeekers.objects.get(user=request.user)
        except JobSeekers.DoesNotExist:
            return Response({"error": "Candidate profile not found."}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        seven_days_ago = now - datetime.timedelta(days=7)
        thirty_days_ago = now - datetime.timedelta(days=30)

        total_views = job_seeker.profile_view_count or 0
        weekly_views = CandidateProfileViews.objects.filter(
            job_seeker=job_seeker,
            viewed_at__gte=seven_days_ago
        ).count()
        monthly_views = CandidateProfileViews.objects.filter(
            job_seeker=job_seeker,
            viewed_at__gte=thirty_days_ago
        ).count()

        latest_view = CandidateProfileViews.objects.filter(job_seeker=job_seeker).order_by('-viewed_at').first()
        last_viewed = (latest_view.last_viewed_at or latest_view.viewed_at).isoformat() if latest_view else None

        recent_views = CandidateProfileViews.objects.filter(
            job_seeker=job_seeker,
            company__isnull=False
        ).select_related('company').order_by('-viewed_at')[:15]

        seen_companies = []
        recent_companies = []
        for rv in recent_views:
            company_name = rv.company.name
            if company_name and company_name not in seen_companies:
                seen_companies.append(company_name)
                recent_companies.append(company_name)
            if len(recent_companies) >= 5:
                break

        return Response({
            "totalViews": total_views,
            "weeklyViews": weekly_views,
            "monthlyViews": monthly_views,
            "lastViewed": last_viewed,
            "recentCompanies": recent_companies
        }, status=status.HTTP_200_OK)
