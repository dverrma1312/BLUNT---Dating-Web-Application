from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/intent/', include('apps.intent.urls')),  # intent URLs
    path('api/discovery/', include('apps.discovery.urls')),
    path('api/conversation/', include('apps.conversation.urls')),
    path('api/connections/', include('apps.connections.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)