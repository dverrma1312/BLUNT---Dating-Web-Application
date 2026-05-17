from django.contrib import admin
from .models import BugReport


@admin.register(BugReport)
class BugReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'page', 'description', 'created_at', 'resolved']
    list_filter = ['resolved', 'created_at']
    search_fields = ['description', 'page', 'user__name', 'user__phone_number']
    ordering = ['-created_at']
    readonly_fields = ['user', 'page', 'description', 'created_at']