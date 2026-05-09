import random  # imports random for shuffling
from celery import shared_task  # imports shared_task decorator
from django.utils import timezone  # imports timezone for today's date
from apps.users.models import User  # imports User model
from apps.intent.models import UserIntent  # imports UserIntent model
from .models import DailyPool  # imports DailyPool model

@shared_task
def generate_daily_pools():
    # this task runs every day at 8am
    # generates 10 profiles for every active user

    today = timezone.now().date()  # get today's date

    # get all active verified users who have set their intent
    active_users = User.objects.filter(
        is_active=True,
        is_verified=True,
        is_profile_complete=True,
        is_approved=True,  # only approved users enter the pool
        intent__isnull=False,
    )

    for user in active_users:
        # skip if pool already generated for this user today
        if DailyPool.objects.filter(viewer=user, date=today).exists():
            continue

        try:
            user_intent = user.intent  # get this user's intent
        except UserIntent.DoesNotExist:
            continue  # skip if no intent set

        opposite_gender = 'F' if user.gender == 'M' else 'M'  # find opposite gender

        # get all previously seen candidates — never show same person twice
        seen_candidates = DailyPool.objects.filter(
            viewer=user
        ).values_list('candidate_id', flat=True)  # flat=True returns a simple list of ids

        # Step 1 — strict match — same category opposite gender
        strict_matches = User.objects.filter(
            gender=opposite_gender,  # opposite gender
            is_active=True,
            is_verified=True,
            is_profile_complete=True,
            is_approved=True,  # only approved users shown in pool
            intent__looking_for=user_intent.looking_for,  # same category
        ).exclude(id=user.id).exclude(id__in=seen_candidates)  # exclude self and already seen

        strict_list = list(strict_matches)  # convert to list for shuffling
        random.shuffle(strict_list)  # shuffle randomly — pure fairness

        pool = strict_list[:10]  # take up to 10

        # Step 2 — if less than 10 found fill from other categories
        if len(pool) < 10:
            remaining = 10 - len(pool)  # how many more we need

            already_in_pool = [u.id for u in pool]  # ids already in pool

            loose_matches = User.objects.filter(
                gender=opposite_gender,
                is_active=True,
                is_verified=True,
                is_profile_complete=True,
                is_approved=True,  # only approved users shown in pool
            ).exclude(id=user.id).exclude(id__in=seen_candidates).exclude(id__in=already_in_pool).exclude(
                intent__looking_for=user_intent.looking_for  # exclude same category — already covered
            )

            loose_list = list(loose_matches)
            random.shuffle(loose_list)
            pool += loose_list[:remaining]  # fill remaining slots

        # save pool to database
        for candidate in pool:
            DailyPool.objects.create(
                viewer=user,
                candidate=candidate,
                date=today,
            )