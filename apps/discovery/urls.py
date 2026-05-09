from django.urls import path  # imports path function
from .views import DailyPoolView, TriggerPoolView, SelectCandidateView, PassCandidateView, AdminTestView, AdminTestUserPoolView  # imports our views

urlpatterns = [
    path('pool/', DailyPoolView.as_view(), name='daily-pool'),  # GET /api/discovery/pool/
    path('trigger-pool/', TriggerPoolView.as_view(), name='trigger-pool'),  # POST /api/discovery/trigger-pool/
    path('select/<int:pool_entry_id>/', SelectCandidateView.as_view(), name='select-candidate'),  # POST /api/discovery/select/3/
    path('pass/<int:pool_entry_id>/', PassCandidateView.as_view(), name='pass-candidate'),  # POST /api/discovery/pass/3/

    path('admin-test/users/', AdminTestView.as_view()),
    path('admin-test/users/<int:user_id>/pool/', AdminTestUserPoolView.as_view()),
]