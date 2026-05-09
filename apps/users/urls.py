from django.urls import path  # imports path function to define URL patterns
from .views import RegisterView, ProfileView, PhotoUploadView, SendOTPView, VerifyOTPView  # imports our views

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # POST /api/users/register/
    path('profile/', ProfileView.as_view(), name='profile'),  # GET and PUT /api/users/profile/
    path('photos/', PhotoUploadView.as_view(), name='photo-upload'),  # POST /api/users/photos/
    path('photos/<int:photo_id>/', PhotoUploadView.as_view(), name='photo-delete'),  # DELETE /api/users/photos/1/
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),  # POST /api/users/send-otp/
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),  # POST /api/users/verify-otp/
]