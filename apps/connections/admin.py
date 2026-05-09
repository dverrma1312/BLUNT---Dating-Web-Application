from django.contrib import admin  # imports Django's admin module
from .models import Match, Rejection  # imports our models

class MatchAdmin(admin.ModelAdmin):
    # what columns to show in the match list page
    list_display = ['user_a', 'user_b', 'status', 'created_at', 'expires_at']
    
    # filter options on the right side
    list_filter = ['status']
    
    # which fields to use for searching
    search_fields = ['user_a__name', 'user_b__name']

class RejectionAdmin(admin.ModelAdmin):
    # what columns to show in the rejection list page
    list_display = ['match', 'rejected_by', 'rejected_user', 'reason', 'created_at']
    
    # which fields to use for searching
    search_fields = ['rejected_by__name', 'rejected_user__name']

admin.site.register(Match, MatchAdmin)  # registers Match model with our custom admin
admin.site.register(Rejection, RejectionAdmin)  # registers Rejection model with our custom admin