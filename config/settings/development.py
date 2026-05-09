# development.py contains settings specific to your local machine only
# this file is never used in production

from .base import *  # import everything from base.py first
                     # the * means "bring in all settings from base"

from decouple import config  # read values from .env file

# DEBUG True means Django shows detailed error pages when something breaks
# NEVER set this to True in production - it exposes your code
DEBUG = True

# ALLOWED_HOSTS is the list of domains that can access this Django app
# During development we only allow localhost
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Database configuration for local development
# We use PostgreSQL locally to match what production will use
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # tell Django to use PostgreSQL
        'NAME': config('DB_NAME'),                  # database name from .env
        'USER': config('DB_USER'),                  # database username from .env
        'PASSWORD': config('DB_PASSWORD'),           # database password from .env
        'HOST': config('DB_HOST', default='localhost'), # where PostgreSQL is running
        'PORT': config('DB_PORT', default='5432'),      # default PostgreSQL port
    }
}