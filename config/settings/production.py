from .base import *
from decouple import config

DEBUG = False

SECRET_KEY = config('PRODUCTION_SECRET_KEY')

ALLOWED_HOSTS = ['blunt-dating-web-application-production.up.railway.app']  # update after Railway deployment

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('PROD_DB_NAME'),
        'USER': config('PROD_DB_USER'),
        'PASSWORD': config('PROD_DB_PASSWORD'),
        'HOST': config('PROD_DB_HOST'),
        'PORT': config('PROD_DB_PORT', default='5432'),
    }
}

CORS_ALLOWED_ORIGINS = [
    'https://frontend-hv47.vercel.app',
    'https://frontend-ftqziglkm-hv47.vercel.app',  # preview URL too
]

# Redis for production — Railway Redis URL
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [config('REDIS_URL')],
        },
    },
}

# Cloudinary already configured in base.py
# Static files
STATIC_ROOT = BASE_DIR / 'staticfiles'

# force HTTPS
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True


CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': config('REDIS_URL'),
    }
}