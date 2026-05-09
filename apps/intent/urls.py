from django.urls import path  # imports path function
from .views import UserIntentView  # imports our view

urlpatterns = [
    path('', UserIntentView.as_view(), name='user-intent'),  # GET, POST, PUT /api/intent/
]