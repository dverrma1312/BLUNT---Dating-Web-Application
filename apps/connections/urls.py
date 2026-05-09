from django.urls import path  # imports path function
from .views import RejectMatchView, MyRejectionsView, MatchListView  # imports our views

urlpatterns = [
    path('matches/', MatchListView.as_view(), name='match-list'),  # GET /api/connections/matches/
    path('match/<int:match_id>/reject/', RejectMatchView.as_view(), name='reject-match'),  # POST /api/connections/match/1/reject/
    path('rejections/', MyRejectionsView.as_view(), name='my-rejections'),  # GET /api/connections/rejections/
]