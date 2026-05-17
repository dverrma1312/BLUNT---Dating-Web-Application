from django.contrib import admin  # imports Django's admin module
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin  # imports Django's default UserAdmin as a base
from .models import User, UserPhoto  # imports our custom models

class UserPhotoInline(admin.TabularInline):  # shows photos inside the user admin page
    model = UserPhoto  # which model to show inline
    extra = 1  # show 1 empty photo slot by default

class UserAdmin(BaseUserAdmin):
    # what columns to show in the user list page
    list_display = ['phone_number', 'name', 'instagram_handle', 'gender', 'city', 'category', 'is_verified', 'is_profile_complete', 'is_approved']

    # which fields to use for searching users
    search_fields = ['phone_number', 'name', 'instagram_handle', 'city']

    # filter options on the right side
    list_filter = ['gender', 'category', 'is_verified', 'is_profile_complete', 'is_approved']

    # show photos inside user detail page
    inlines = [UserPhotoInline]

    # override default fieldsets since we don't have username
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal Info', {'fields': ('name', 'instagram_handle', 'gender', 'city', 'description', 'category')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'is_profile_complete', 'is_approved')}),
    )
    
    # fields shown when creating a new user from admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'name', 'gender', 'city', 'category', 'password1', 'password2'),
        }),
    )

    # allow admin to approve multiple users at once from the list page
    actions = ['approve_users', 'reject_users', 'regenerate_daily_pool']

    def approve_users(self, request, queryset):
        # bulk approve selected users
        queryset.update(is_approved=True)  # set is_approved to True for all selected users
        self.message_user(request, f'{queryset.count()} users approved successfully.')  # show success message
    approve_users.short_description = 'Approve selected users'  # label shown in admin dropdown

    def reject_users(self, request, queryset):
        # bulk reject selected users
        queryset.update(is_approved=False)  # set is_approved to False for all selected users
        self.message_user(request, f'{queryset.count()} users rejected successfully.')  # show success message
    reject_users.short_description = 'Reject selected users'  # label shown in admin dropdown

    def regenerate_daily_pool(self, request, queryset):
        import random
        from django.utils import timezone
        from apps.discovery.models import DailyPool, UserPreference
        from apps.intent.models import UserIntent

        today = timezone.now().date()
        count = 0

        def apply_preference_filters(qs, preference):
            if not preference:
                return qs
            today = timezone.now().date()
            max_age_date = today.replace(year=today.year - preference.age_min)
            min_age_date = today.replace(year=today.year - preference.age_max)
            qs = qs.filter(dob__lte=min_age_date, dob__gte=max_age_date)
            if preference.city:
                qs = qs.filter(city__icontains=preference.city)
            if preference.drinks is not None:
                qs = qs.filter(alcohol=preference.drinks)
            if preference.smokes is not None:
                qs = qs.filter(smoke=preference.smokes)
            if preference.weed is not None:
                qs = qs.filter(weed=preference.weed)
            return qs

        for user in queryset:
            try:
                user_intent = user.intent
            except UserIntent.DoesNotExist:
                continue

            # Delete existing pool for today
            DailyPool.objects.filter(viewer=user, date=today).delete()

            # Get preference
            try:
                preference = user.discovery_preference
            except UserPreference.DoesNotExist:
                preference = None

            opposite_gender = 'F' if user.gender == 'M' else 'M'

            seen_candidates = DailyPool.objects.filter(
                viewer=user, date=today
            ).values_list('candidate_id', flat=True)

            base_candidates = User.objects.filter(
                gender=opposite_gender,
                is_active=True,
                is_verified=True,
                is_profile_complete=True,
                is_approved=True,
            ).exclude(id=user.id).exclude(id__in=seen_candidates)

            filtered_candidates = apply_preference_filters(base_candidates, preference)

            strict_matches = filtered_candidates.filter(
                intent__looking_for=user_intent.looking_for,
            ).order_by('id')

            strict_list = list(strict_matches)
            random.shuffle(strict_list)
            pool = strict_list[:10]

            if len(pool) < 10:
                remaining = 10 - len(pool)
                already_in_pool = [u.id for u in pool]
                loose_matches = filtered_candidates.exclude(
                    id__in=already_in_pool
                ).exclude(intent__looking_for=user_intent.looking_for)
                loose_list = list(loose_matches)
                random.shuffle(loose_list)
                pool += loose_list[:remaining]

            for candidate in pool:
                DailyPool.objects.create(
                    viewer=user,
                    candidate=candidate,
                    date=today,
                )
            count += 1

        self.message_user(request, f'Daily pool regenerated for {count} users.')
    regenerate_daily_pool.short_description = 'Regenerate daily pool for selected users'

    ordering = ['phone_number']  # default ordering in admin list

admin.site.register(User, UserAdmin)   # registers User model with our custom admin
admin.site.register(UserPhoto)         # registers UserPhoto model with default admin