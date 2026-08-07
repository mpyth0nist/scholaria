from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.db import connections
from django.db.utils import OperationalError

def health_check(request):
    health = {"status": "ok", "services": {"database": "ok"}}
    try:
        # Check database connection
        connections['default'].cursor()
    except OperationalError:
        health["status"] = "error"
        health["services"]["database"] = "down"
        return JsonResponse(health, status=503)
    return JsonResponse(health)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/quizzes/', include('quizzes.urls')),
    path('api/llm/', include('llm.urls')),
    path('health/', health_check, name='health_check'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
