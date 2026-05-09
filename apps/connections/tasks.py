from celery import shared_task  # imports shared_task decorator
from django.utils import timezone  # imports timezone for current time
from .models import Match  # imports Match model

@shared_task
def expire_matches():
    # this task runs every day at midnight
    # finds all active matches that have passed their expiry time
    # and sets their status to expired

    now = timezone.now()  # get current time

    # find all active matches that have expired
    expired_matches = Match.objects.filter(
        status='active',  # only active matches
        expires_at__lt=now,  # expires_at is less than current time — meaning they have expired
    )

    count = expired_matches.count()  # count how many matches are being expired

    expired_matches.update(status='expired')  # update all in one query — more efficient

    return f'{count} matches expired.'  # return message for Celery logs