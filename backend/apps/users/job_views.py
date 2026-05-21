from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Jobs, JobSeekers, JobSeekerSkills, CustomUser
from .serializers import JobSerializer

from rest_framework.pagination import PageNumberPagination

class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class JobListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('query', '')
        location = request.query_params.get('location', '')
        experience = request.query_params.get('experience', None)
        salary_min = request.query_params.get('salary_min', None)
        salary_max = request.query_params.get('salary_max', None)
        employment_type = request.query_params.get('employment_type', '')
        
        # Optimize queries with select_related to eliminate N+1 database hits
        jobs = Jobs.objects.all().select_related('company', 'location', 'job_category', 'industry').order_by('-posted_at')
        
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

        # Apply DRF pagination
        paginator = JobPagination()
        page = paginator.paginate_queryset(jobs, request)
        
        if page is not None:
            serializer = JobSerializer(page, many=True)
            response_data = serializer.data
        else:
            serializer = JobSerializer(jobs, many=True)
            response_data = serializer.data
        
        # Add match score logic if user is a candidate
        if request.user.is_authenticated and request.user.account_type == 'CANDIDATE':
            try:
                job_seeker = JobSeekers.objects.get(user=request.user)
                from .models import SavedJobs
                saved_job_ids = set(SavedJobs.objects.filter(job_seeker=job_seeker).values_list('job_id', flat=True))
                candidate_skills = set(JobSeekerSkills.objects.filter(job_seeker=job_seeker).values_list('skill__name', flat=True))
                
                for job_data in response_data:
                    # Check if saved
                    import uuid
                    job_uuid = uuid.UUID(job_data['id'])
                    job_data['is_saved'] = job_uuid in saved_job_ids
                    
                    # Simple match score calculation
                    score = 0
                    requirements = (job_data.get('requirements') or "").lower()
                    for skill in candidate_skills:
                        if skill.lower() in requirements:
                            score += 20
                    
                    job_data['match_score'] = min(score + 60, 99) # Base 60% + skills
            except JobSeekers.DoesNotExist:
                pass

        if page is not None:
            return paginator.get_paginated_response(response_data)
        return Response(response_data)

class JobDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            job = Jobs.objects.get(pk=pk)
            serializer = JobSerializer(job)
            data = serializer.data
            
            # Check if applied/saved
            if request.user.account_type == 'CANDIDATE':
                from .models import Applications, SavedJobs, JobSeekers
                try:
                    job_seeker = JobSeekers.objects.get(user=request.user)
                    data['has_applied'] = Applications.objects.filter(job=job, job_seeker=job_seeker).exists()
                    data['is_saved'] = SavedJobs.objects.filter(job=job, job_seeker=job_seeker).exists()
                except JobSeekers.DoesNotExist:
                    data['has_applied'] = False
                    data['is_saved'] = False
            
            return Response(data)
        except Jobs.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
