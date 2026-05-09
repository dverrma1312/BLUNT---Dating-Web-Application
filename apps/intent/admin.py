from django.contrib import admin  # imports Django's admin module
from .models import UserIntent  # imports our UserIntent model

admin.site.register(UserIntent)  # registers UserIntent model with default admin