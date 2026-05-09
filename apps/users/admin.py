from django.contrib import admin  # imports Django's admin module
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin  # imports Django's default UserAdmin as a base
from .models import User, UserPhoto  # imports our custom models

class UserPhotoInline(admin.TabularInline):  # shows photos inside the user admin page
    model = UserPhoto  # which model to show inline
    extra = 1  # show 1 empty photo slot by default

class UserAdmin(BaseUserAdmin):
    # what columns to show in the user list page
    list_display = ['phone_number', 'name', 'gender', 'city', 'category', 'is_verified', 'is_profile_complete', 'is_approved']
    
    # which fields to use for searching users
    search_fields = ['phone_number', 'name', 'city']
    
    # filter options on the right side
    list_filter = ['gender', 'category', 'is_verified', 'is_profile_complete', 'is_approved']
    
    # show photos inside user detail page
    inlines = [UserPhotoInline]
    
    # override default fieldsets since we don't have username
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal Info', {'fields': ('name', 'gender', 'city', 'description', 'category')}),
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
    actions = ['approve_users', 'reject_users']

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

    ordering = ['phone_number']  # default ordering in admin list

admin.site.register(User, UserAdmin)   # registers User model with our custom admin
admin.site.register(UserPhoto)         # registers UserPhoto model with default admin