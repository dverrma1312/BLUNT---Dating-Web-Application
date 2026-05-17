from django.db import models
from django.conf import settings


class BugReport(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bug_reports'
    )
    page = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Bug report from {self.user.name if self.user else 'anonymous'} at {self.page}"