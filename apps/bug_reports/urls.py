from django.urls import path
from .views import BugReportView, BugReportListView

urlpatterns = [
    path('', BugReportView.as_view(), name='bug-report'),
    path('all/', BugReportListView.as_view(), name='bug-report-list'),
]