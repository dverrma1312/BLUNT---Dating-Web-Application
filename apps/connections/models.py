from django.db import models  # imports Django model base classes
from apps.users.models import User  # imports our User model
from django.utils import timezone  # imports timezone for expiry time

class Match(models.Model):
    # stores a mutual match between two users
    # created only when both users select each other

    STATUS_CHOICES = [
        ('active', 'Active'),      # match is live, both users can interact
        ('expired', 'Expired'),    # 24 hours passed with no action
        ('rejected', 'Rejected'),  # one user rejected the match
    ]

    user_a = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_a')  # first user in the match
    user_b = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_b')  # second user in the match
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')  # current status of the match
    created_at = models.DateTimeField(auto_now_add=True)  # when match was created
    expires_at = models.DateTimeField()  # 24 hours from creation

    def save(self, *args, **kwargs):
        # automatically set expiry to 24 hours from now when match is created
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)  # expires in 24 hours
        super().save(*args, **kwargs)  # call Django's default save method

    def is_expired(self):
        # checks if match has expired
        return timezone.now() > self.expires_at  # expired if current time is past expiry time

    def __str__(self):
        return f"{self.user_a.name} ↔ {self.user_b.name} — {self.status}"  # how match appears in admin panel


class Rejection(models.Model):
    # stores rejection details when a user rejects a match
    # reason is shown anonymously to the rejected user

    match = models.OneToOneField(Match, on_delete=models.CASCADE, related_name='rejection')  # one rejection per match
    rejected_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rejections_made')  # user who rejected
    rejected_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rejections_received')  # user who was rejected
    reason = models.CharField(max_length=100)  # mandatory rejection reason — max 100 chars
    created_at = models.DateTimeField(auto_now_add=True)  # when rejection happened

    def __str__(self):
        return f"{self.rejected_by.name} rejected in match {self.match.id}"  # how rejection appears in admin panel