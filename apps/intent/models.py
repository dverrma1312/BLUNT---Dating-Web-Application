from django.db import models  # imports Django's model base classes
from apps.users.models import User  # imports our User model

CATEGORY_CHOICES = [
    ('hookup', 'Hookup'),
    ('hangout', 'Hangout'),
    ('smokeup', 'Smoke Up'),
    ('coffee', 'Coffee & Chill'),
]

class UserIntent(models.Model):
    # stores a user's intent — carries over until they change it
    # one intent per user, always

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='intent')  # one intent per user, deletes if user is deleted
    what_are_you_doing = models.TextField(blank=True)  # free text, optional
    looking_for = models.CharField(max_length=10, choices=CATEGORY_CHOICES)  # their current category — used for matching
    updated_at = models.DateTimeField(auto_now=True)  # automatically updates every time intent is saved

    def __str__(self):
        return f"{self.user.name} — {self.looking_for}"