from django.apps import AppConfig  # imports AppConfig base class from Django

class ConversationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # sets default primary key type
    name = 'apps.conversation'  # tells Django this app lives inside the apps folder