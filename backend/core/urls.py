from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.auth_urls')),
    path('api/', include('apps.candidates.urls')),
    path('api/', include('apps.companies.urls')),
    path('api/', include('apps.jobs.urls')),
    path('api/', include('apps.commerce.urls')),
    path('api/', include('apps.communication.urls')),
]
