import random  # imports random for shuffling
from celery import shared_task  # imports shared_task decorator
from django.utils import timezone  # imports timezone for today's date
from apps.users.models import User  # imports User model
from apps.intent.models import UserIntent  # imports UserIntent model
from .models import DailyPool, UserPreference  # imports DailyPool and UserPreference models
from django.db.models import Q


def apply_preference_filters(queryset, preference):
    """Apply user's preference filters to a queryset"""
    if not preference:
        return queryset

    # Calculate age bounds
    today = timezone.now().date()
    max_age_date = today.replace(year=today.year - preference.age_min)
    min_age_date = today.replace(year=today.year - preference.age_max)

    # Apply age filter
    queryset = queryset.filter(dob__lte=min_age_date, dob__gte=max_age_date)

    queryset = queryset.filter(
        Q(dob__isnull=True) |
        Q(dob__lte=max_age_date, dob__gte=min_age_date)
    )

    # Apply city filter if set
    if preference.city:
        queryset = queryset.filter(city__icontains=preference.city)

    # Apply lifestyle filters
    if preference.drinks is not None:
        queryset = queryset.filter(alcohol=preference.drinks)
    if preference.smokes is not None:
        queryset = queryset.filter(smoke=preference.smokes)
    if preference.weed is not None:
        queryset = queryset.filter(weed=preference.weed)

    return queryset


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

        # Get user's preferences (if any)
        try:
            preference = user.discovery_preference
        except UserPreference.DoesNotExist:
            preference = None

        opposite_gender = 'F' if user.gender == 'M' else 'M'  # find opposite gender

        # get all previously seen candidates — never show same person twice
        seen_candidates = DailyPool.objects.filter(
            viewer=user,
        ).values_list('candidate_id', flat=True)  # flat=True returns a simple list of ids

        # Base queryset for eligible candidates
        base_candidates = User.objects.filter(
            gender=opposite_gender,  # opposite gender
            is_active=True,
            is_verified=True,
            is_profile_complete=True,
            is_approved=True,  # only approved users shown in pool
        ).exclude(id=user.id).exclude(id__in=seen_candidates)

        # Apply preference filters
        filtered_candidates = apply_preference_filters(base_candidates, preference)

        # Step 1 — strict match — same category opposite gender
        strict_matches = filtered_candidates.filter(
            intent__looking_for=user_intent.looking_for,  # same category
        ).order_by('id')  # order for consistency before shuffling

        strict_list = list(strict_matches)  # convert to list for shuffling
        random.shuffle(strict_list)  # shuffle randomly — pure fairness

        pool = strict_list[:10]  # take up to 10 intent matches

        # Step 2 — if less than 10 found fill from other categories
        if len(pool) < 10:
            remaining = 10 - len(pool)  # how many more we need

            already_in_pool = [u.id for u in pool]  # ids already in pool
            strict_ids = [u.id for u in pool]

            # Get candidates not in pool and not same category
            loose_matches = filtered_candidates.exclude(
                id__in=already_in_pool
            ).exclude(intent__looking_for=user_intent.looking_for)

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