from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Applications, JobSeekers, Jobs
from .serializers import ApplicationSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        if self.request.user.account_type == 'CANDIDATE':
            return Applications.objects.filter(job_seeker__user=self.request.user).order_by('-applied_at')
        return Applications.objects.none()

    def create(self, request, *args, **kwargs):
        job_id = request.data.get('job')
        if not job_id:
            return Response({"error": "Job ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            job = Jobs.objects.get(id=job_id)
            job_seeker = JobSeekers.objects.get(user=request.user)
            
            # Check if already applied
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
            return Response({"error": "Only candidates can access stats."}, status=status.HTTP_403_FOR_PERMISSION_DENIED)
        
        try:
            job_seeker = JobSeekers.objects.get(user=request.user)
            total_applications = Applications.objects.filter(job_seeker=job_seeker).count()
            # Placeholder for profile views (can be implemented with an AuditLog or similar)
            profile_views = 0 
            # Interviews
            interviews = Applications.objects.filter(job_seeker=job_seeker, status='INTERVIEW').count()
            
            return Response({
                "applications": total_applications,
                "profile_views": profile_views,
                "interviews": interviews
            })
        except JobSeekers.DoesNotExist:
             return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
