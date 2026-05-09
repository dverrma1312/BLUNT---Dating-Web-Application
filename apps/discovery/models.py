from django.db import models  # imports Django model base classes
from django.utils import timezone  # imports timezone for date
from apps.users.models import User  # imports User model

class DailyPool(models.Model):
    # stores the 10 profiles shown to each user each day
    # one row per viewer-candidate pair per day

    viewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pool_as_viewer')  # user who sees the profiles
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pool_as_candidate')  # user being shown
    date = models.DateField(default=timezone.now)  # which day this pool entry is for
    was_selected = models.BooleanField(default=False)  # viewer selected this candidate
    was_passed = models.BooleanField(default=False)  # viewer passed this candidate
    created_at = models.DateTimeField(auto_now_add=True)  # when this pool entry was created

    class Meta:
        unique_together = ['viewer', 'candidate', 'date']  # same pair cannot appear twice on same day

    def __str__(self):
        return f"{self.viewer.name} → {self.candidate.name} on {self.date}"