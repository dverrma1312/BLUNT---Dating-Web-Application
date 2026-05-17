from django.contrib import admin
from .models import UserPreference, DailyPool


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'age_min', 'age_max', 'city', 'drinks', 'smokes', 'weed', 'updated_at']
    list_filter = ['drinks', 'smokes', 'weed']
    search_fields = ['user__name', 'user__phone_number']


@admin.register(DailyPool)
class DailyPoolAdmin(admin.ModelAdmin):
    list_display = ['viewer', 'candidate', 'date', 'was_selected', 'was_passed']
    list_filter = ['date', 'was_selected', 'was_passed']
    search_fields = ['viewer__name', 'candidate__name']
