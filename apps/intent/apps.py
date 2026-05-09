from django.apps import AppConfig

class IntentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.intent'  # tells Django this app lives inside the apps folder