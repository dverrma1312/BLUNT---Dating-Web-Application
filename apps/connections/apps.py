from django.apps import AppConfig  # imports AppConfig base class from Django

class ConnectionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # sets default primary key type
    name = 'apps.connections'  # tells Django this app lives inside the apps folder