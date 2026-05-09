import os  # imports os module to set environment variables
from celery import Celery  # imports Celery class

# set default Django settings module for Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('blunt')  # create Celery app named blunt

# read Celery config from Django settings
# namespace='CELERY' means all Celery settings in settings.py start with CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# automatically find and load tasks.py from all installed apps
app.autodiscover_tasks()