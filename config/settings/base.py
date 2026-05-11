# base.py contains settings that are common across all environments
# (development, production etc.) - shared foundation for the entire app

from pathlib import Path  # Path helps us build file paths that work on any OS
from decouple import config  # config() reads values from our .env file
from celery.schedules import crontab  # imports crontab for scheduling
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Build paths inside the project like this: BASE_DIR / 'subfolder'
# BASE_DIR points to the root of our project (the blunt folder)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECRET_KEY is used by Django to encrypt sessions, tokens etc.
# We read it from .env so it's never hardcoded in code
SECRET_KEY = config('SECRET_KEY')

# Applications installed in our project
# Every Django app we create has to be listed here
INSTALLED_APPS = [
    'django.contrib.admin',        # Django's built-in admin panel
    'django.contrib.auth',         # Django's built-in authentication system
    'django.contrib.contenttypes', # Tracks all models in the project
    'django.contrib.sessions',     # Handles user sessions
    'django.contrib.messages',     # Handles flash messages
    'django.contrib.staticfiles',  # Handles static files like CSS and JS

    # Third party apps
    'jazzmin', 
    'rest_framework',              # Django REST Framework for building APIs
    'apps.users',                        # Our custom apps app for managing user-created apps
    'apps.intent', 
    'apps.discovery',  
    'django_celery_beat', 
    'apps.connections',
    'apps.conversation',
    'corsheaders',
    'channels',
    'django_ratelimit'
]

# Middleware is code that runs on every request and response
# Think of it as a pipeline every request passes through
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # add this
    'django.contrib.sessions.middleware.SessionMiddleware',      # Manages sessions
    'django.middleware.common.CommonMiddleware',                 # Common request handling
    'django.middleware.csrf.CsrfViewMiddleware',                 # Protects against CSRF attacks
    'django.contrib.auth.middleware.AuthenticationMiddleware',   # Attaches user to request
    'django.contrib.messages.middleware.MessageMiddleware',      # Enables flash messages
    'django.middleware.clickjacking.XFrameOptionsMiddleware',    # Prevents clickjacking
]

# ROOT_URLCONF tells Django where to find the main URL configuration
ROOT_URLCONF = 'config.urls'

# TEMPLATES tells Django how to render HTML templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates', # Use Django's template engine
        'DIRS': [],                  # Extra directories to look for templates
        'APP_DIRS': True,            # Look for templates inside each app's templates folder
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',    # Adds debug variable to templates
                'django.template.context_processors.request',  # Adds request object to templates
                'django.contrib.auth.context_processors.auth', # Adds user object to templates
                'django.contrib.messages.context_processors.messages', # Adds messages to templates
            ],
        },
    },
]

# WSGI is the interface between Django and the web server
WSGI_APPLICATION = 'config.wsgi.application'

# Password validation rules
# These check that passwords are strong enough when users register
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'}, # Password cant be similar to username
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},           # Password must be at least 8 chars
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},          # Password cant be too common
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},         # Password cant be all numbers
]

# Internationalization settings
LANGUAGE_CODE = 'en-us'  # Default language
TIME_ZONE = 'Asia/Kolkata'  # Indian timezone since our users are in India
USE_I18N = True             # Enable Django's translation system
USE_TZ = True               # Store all dates in UTC internally, convert to IST when displaying

# Static files are CSS, JavaScript, images used by the frontend
STATIC_URL = '/static/'

# Media files are user uploaded files like profile photos
MEDIA_URL = '/media/'                           # URL prefix for media files
MEDIA_ROOT = BASE_DIR / 'media'                 # Folder where uploaded files are stored locally

# Default primary key type for all models
# We use BigAutoField which supports very large numbers of records
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.User'  # tells Django to use our custom User model instead of the default one

# Django REST Framework global settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication', # Use JWT tokens for auth
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated', # All endpoints require login by default
    ),
}

from datetime import timedelta  # imports timedelta to set token expiry times

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # access token expires after 1 day
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  # refresh token expires after 7 days
    'ROTATE_REFRESH_TOKENS': True,  # issue a new refresh token every time it is used
    'BLACKLIST_AFTER_ROTATION': False,  # don't blacklist old refresh tokens for now
    'AUTH_HEADER_TYPES': ('Bearer',),  # token must be sent as "Bearer <token>" in headers
}

# Celery settings
CELERY_BROKER_URL = 'redis://localhost:6379/0'  # Redis as message broker
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'  # Redis to store task results
CELERY_TIMEZONE = 'Asia/Kolkata'  # use Indian timezone for scheduled tasks

CELERY_BEAT_SCHEDULE = {
    'generate-daily-pools': {
        'task': 'apps.discovery.tasks.generate_daily_pools',  # task to run
        'schedule': crontab(hour=8, minute=0),  # runs every day at 8am
    },
    'expire-matches': {
        'task': 'apps.connections.tasks.expire_matches',  # task to run
        'schedule': crontab(hour=0, minute=0),  # runs every day at midnight
    },
}


# allow requests from React frontend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://frontend.vercel.app',
]

CORS_ALLOW_CREDENTIALS = True

# Django Channels — uses Redis as the message broker for WebSockets
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],  # Redis running locally
        },
    },
}
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


cloudinary.config(
    cloud_name=config('CLOUDINARY_CLOUD_NAME'),
    api_key=config('CLOUDINARY_API_KEY'),
    api_secret=config('CLOUDINARY_API_SECRET'),
)