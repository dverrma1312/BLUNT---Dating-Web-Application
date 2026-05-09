from django.contrib import admin  # imports Django's admin module
from .models import PromptQuestion, PromptAnswer, Message  # imports our models

admin.site.register(PromptQuestion)  # registers PromptQuestion with default admin
admin.site.register(PromptAnswer)  # registers PromptAnswer with default admin
admin.site.register(Message)  # registers Message with default admin