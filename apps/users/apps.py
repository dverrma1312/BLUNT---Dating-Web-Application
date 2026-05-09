from django.apps import AppConfig  # imports AppConfig base class from Django


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # sets default primary key type to BigAutoField
    name = 'apps.users'  # tells Django this app lives inside the apps folder