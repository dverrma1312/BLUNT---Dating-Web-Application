from django.db import models  # imports Django model base classes
from django.utils import timezone  # imports timezone for date
from datetime import datetime, time, timedelta  # for time operations
import pytz  # for timezone handling
from apps.users.models import User  # imports User model


class UserPreference(models.Model):
    # stores a user's discovery filter preferences
    # one preference record per user

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='discovery_preference')

    # Age range filters
    age_min = models.PositiveIntegerField(default=18)
    age_max = models.PositiveIntegerField(default=50)

    # City filter (empty means any city)
    city = models.CharField(max_length=100, blank=True, default='')

    # Lifestyle filters (null means "any", True/False for specific preference)
    drinks = models.BooleanField(null=True, blank=True, default=None)
    smokes = models.BooleanField(null=True, blank=True, default=None)
    weed = models.BooleanField(null=True, blank=True, default=None)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name}'s discovery preferences"

    @property
    def is_editable(self):
        """Returns True if preferences can be edited (not during 7am-8am IST lock)"""
        ist = pytz.timezone('Asia/Kolkata')
        now_ist = datetime.now(ist)
        current_time = now_ist.time()

        # Edit window: 8am to 7am next day (23 hours)
        # Pool locks at 7am, generates at 8am - no editing during this hour
        # Otherwise editing is allowed
        return not (time(7, 0) <= current_time < time(8, 0))

    @property
    def lock_time_ist(self):
        """Returns datetime when the pool locks (7am IST)"""
        ist = pytz.timezone('Asia/Kolkata')
        now_ist = datetime.now(ist)
        current_time = now_ist.time()

        if current_time >= time(8, 0):
            # Next lock is tomorrow 7am
            tomorrow = now_ist.date() + timedelta(days=1)
            lock_datetime = datetime.combine(tomorrow, time(7, 0), tzinfo=ist)
        else:
            # Lock is today at 7am (if we're before 7am)
            lock_datetime = datetime.combine(now_ist.date(), time(7, 0), tzinfo=ist)

        return lock_datetime

    @property
    def generation_time_ist(self):
        """Returns datetime when the pool generates (8am IST)"""
        ist = pytz.timezone('Asia/Kolkata')
        now_ist = datetime.now(ist)
        current_time = now_ist.time()

        if current_time >= time(8, 0):
            # Next generation is tomorrow 8am
            tomorrow = now_ist.date() + timedelta(days=1)
            gen_datetime = datetime.combine(tomorrow, time(8, 0), tzinfo=ist)
        else:
            # Generation is today at 8am (if we're before 8am)
            gen_datetime = datetime.combine(now_ist.date(), time(8, 0), tzinfo=ist)

        return gen_datetime


from datetime import timedelta


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