from rest_framework import status  # imports HTTP status codes
from rest_framework.response import Response  # imports Response object
from rest_framework.views import APIView  # imports base APIView class
from rest_framework.permissions import IsAuthenticated  # only logged in users
from django.utils import timezone  # imports timezone for today's date
from .models import DailyPool  # imports DailyPool model
from apps.users.serializers import UserSerializer  # imports UserSerializer to show profile data
from .tasks import generate_daily_pools  # imports our celery task
from apps.connections.models import Match  # imports Match model for match detection

class DailyPoolView(APIView):
    # returns today's 10 profiles for the logged in user
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()  # get today's date

        # get today's pool for this user
        pool = DailyPool.objects.filter(
            viewer=request.user,  # only this user's pool
            date=today,  # only today's pool
        ).select_related('candidate')  # fetches candidate data in one query — more efficient

        if not pool.exists():  # if no pool generated yet
            return Response({
                'message': 'No profiles available yet. Check back at 8am.'
            }, status=status.HTTP_404_NOT_FOUND)

        # build response data
        profiles = []
        for entry in pool:
            candidate_data = UserSerializer(entry.candidate).data  # serialize candidate profile
            candidate_data['pool_entry_id'] = entry.id  # add pool entry id so frontend can reference it
            candidate_data['was_selected'] = entry.was_selected  # show if already selected
            candidate_data['was_passed'] = entry.was_passed  # show if already passed
            profiles.append(candidate_data)

        return Response({
            'date': today,
            'total': len(profiles),
            'profiles': profiles,
        }, status=status.HTTP_200_OK)


class TriggerPoolView(APIView):
    # manually triggers pool generation — testing only, remove before production
    permission_classes = [IsAuthenticated]

    def post(self, request):
        generate_daily_pools()  # run the task directly
        return Response({
            'message': 'Pool generation triggered'
        }, status=status.HTTP_200_OK)


class SelectCandidateView(APIView):
    # handles selecting a candidate from the daily pool
    # max 5 selects per user per day
    # also checks for mutual match after each select
    permission_classes = [IsAuthenticated]

    def post(self, request, pool_entry_id):
        today = timezone.now().date()  # get today's date

        # check how many selects this user has made today
        todays_selects = DailyPool.objects.filter(
            viewer=request.user,  # this user's pool
            date=today,  # today only
            was_selected=True,  # only count selected entries
        ).count()

        if todays_selects >= 5:  # max 5 selects per day
            return Response({
                'error': 'You have reached your daily limit of 5 selects.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # find the pool entry
        try:
            entry = DailyPool.objects.get(
                id=pool_entry_id,  # match the pool entry id
                viewer=request.user,  # make sure it belongs to this user
                date=today,  # make sure it is from today
            )
        except DailyPool.DoesNotExist:
            return Response({
                'error': 'Pool entry not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # check if already acted on this entry
        if entry.was_selected:
            return Response({
                'error': 'You have already selected this profile.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if entry.was_passed:
            return Response({
                'error': 'You have already passed on this profile.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # mark as selected
        entry.was_selected = True
        entry.save()

        # match detection — check if candidate has also selected this user
        reverse_selection = DailyPool.objects.filter(
            viewer=entry.candidate,   # candidate is the viewer
            candidate=request.user,   # current user is the candidate
            was_selected=True,        # candidate has selected current user
        ).exists()  # returns True or False

        match_created = False  # track if a match was created

        if reverse_selection:  # if mutual selection found
            # check if match already exists between these two users
            already_matched = Match.objects.filter(
                user_a=entry.candidate,
                user_b=request.user,
            ).exists() or Match.objects.filter(
                user_a=request.user,
                user_b=entry.candidate,
            ).exists()

            if not already_matched:  # only create match if it doesnt exist yet
                Match.objects.create(
                    user_a=request.user,   # current user
                    user_b=entry.candidate,  # the candidate they selected
                )
                match_created = True  # flag that match was created

        return Response({
            'message': 'Profile selected successfully.',
            'match_created': match_created,  # tells frontend if a match was made
        }, status=status.HTTP_200_OK)


class PassCandidateView(APIView):
    # handles passing on a candidate from the daily pool
    # no daily limit on passes
    permission_classes = [IsAuthenticated]

    def post(self, request, pool_entry_id):
        today = timezone.now().date()  # get today's date

        # find the pool entry
        try:
            entry = DailyPool.objects.get(
                id=pool_entry_id,  # match the pool entry id
                viewer=request.user,  # make sure it belongs to this user
                date=today,  # make sure it is from today
            )
        except DailyPool.DoesNotExist:
            return Response({
                'error': 'Pool entry not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # check if already acted on this entry
        if entry.was_selected:
            return Response({
                'error': 'You have already selected this profile.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if entry.was_passed:
            return Response({
                'error': 'You have already passed on this profile.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # mark as passed
        entry.was_passed = True
        entry.save()

        return Response({
            'message': 'Profile passed successfully.'
        }, status=status.HTTP_200_OK)
    
from rest_framework.permissions import IsAdminUser

class AdminTestView(APIView):
    # admin only — lets you simulate mutual selections and create matches
    permission_classes = [IsAdminUser]

    def get(self, request):
        # returns all users with basic info
        from apps.users.models import User
        users = User.objects.filter(is_staff=False).order_by('name')
        data = []
        for user in users:
            data.append({
                'id': user.id,
                'name': user.name,
                'gender': user.gender,
                'phone_number': user.phone_number,
                'is_approved': user.is_approved,
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        # simulates a user selecting another user back — creates match if mutual
        from apps.users.models import User
        from django.utils import timezone

        selector_id = request.data.get('selector_id')   # user who will "like back"
        target_id = request.data.get('target_id')        # user they are liking back

        try:
            selector = User.objects.get(id=selector_id)
            target = User.objects.get(id=target_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()

        # create or update pool entry — selector selects target
        pool_entry, created = DailyPool.objects.get_or_create(
            viewer=selector,
            candidate=target,
            date=today,
            defaults={'was_selected': True}
        )
        if not created:
            pool_entry.was_selected = True
            pool_entry.save()

        # check if target has already selected selector (mutual)
        target_selected_selector = DailyPool.objects.filter(
            viewer=target,
            candidate=selector,
            was_selected=True,
        ).exists()

        match_created = False
        if target_selected_selector:
            already_matched = Match.objects.filter(
                user_a=selector, user_b=target
            ).exists() or Match.objects.filter(
                user_a=target, user_b=selector
            ).exists()

            if not already_matched:
                Match.objects.create(user_a=selector, user_b=target)
                match_created = True

        return Response({
            'message': f'{selector.name} selected {target.name}.',
            'match_created': match_created,
        }, status=status.HTTP_200_OK)


class AdminTestUserPoolView(APIView):
    # returns a specific user's pool — today + past selections
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        from apps.users.models import User
        from django.utils import timezone

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()

        # today's pool
        today_pool = DailyPool.objects.filter(viewer=user, date=today).select_related('candidate')
        # past selections
        past_selections = DailyPool.objects.filter(
            viewer=user, was_selected=True
        ).exclude(date=today).select_related('candidate').order_by('-date')

        def format_entry(entry):
            return {
                'pool_entry_id': entry.id,
                'date': entry.date,
                'candidate': {
                    'id': entry.candidate.id,
                    'name': entry.candidate.name,
                    'gender': entry.candidate.gender,
                    'city': entry.candidate.city,
                },
                'was_selected': entry.was_selected,
                'was_passed': entry.was_passed,
            }

        return Response({
            'user': {'id': user.id, 'name': user.name},
            'today': [format_entry(e) for e in today_pool],
            'past_selections': [format_entry(e) for e in past_selections],
        }, status=status.HTTP_200_OK)


import random
import pytz
from datetime import datetime, time, timedelta
from .models import UserPreference
from .serializers import UserPreferenceSerializer, UserPreferenceUpdateSerializer, PoolPreviewSerializer
from apps.intent.models import UserIntent


class UserPreferenceView(APIView):
    """Get or update user's discovery preferences"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        preference, created = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(preference)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        preference, created = UserPreference.objects.get_or_create(user=request.user)

        # Check if editable
        if not preference.is_editable:
            return Response({
                'error': 'Preferences are locked. Edit window opens at 8am IST and closes at 7am.',
                'lock_time': preference.lock_time_ist.isoformat(),
                'generation_time': preference.generation_time_ist.isoformat(),
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserPreferenceUpdateSerializer(preference, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserPreferenceSerializer(preference).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PoolPreviewView(APIView):
    """Dry run of pool generation with current filters - no data saved"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get or create preference
        preference, created = UserPreference.objects.get_or_create(user=user)

        # Get user's intent
        try:
            user_intent = user.intent
        except UserIntent.DoesNotExist:
            return Response({
                'error': 'Please set your intent first.',
            }, status=status.HTTP_400_BAD_REQUEST)

        # Calculate age bounds
        today = timezone.now().date()
        max_age_date = today.replace(year=today.year - preference.age_min)
        min_age_date = today.replace(year=today.year - preference.age_max)

        opposite_gender = 'F' if user.gender == 'M' else 'M'

        # Base filters
        base_filters = {
            'gender': opposite_gender,
            'is_active': True,
            'is_verified': True,
            'is_profile_complete': True,
            'is_approved': True,
        }

        # Get all potential candidates (excluding self)
        candidates = User.objects.filter(**base_filters).exclude(id=user.id)

        # Apply age filter
        candidates = candidates.filter(dob__lte=min_age_date, dob__gte=max_age_date)

        # Apply city filter if set
        if preference.city:
            candidates = candidates.filter(city__icontains=preference.city)

        # Apply lifestyle filters
        if preference.drinks is not None:
            candidates = candidates.filter(alcohol=preference.drinks)
        if preference.smokes is not None:
            candidates = candidates.filter(smoke=preference.smokes)
        if preference.weed is not None:
            candidates = candidates.filter(weed=preference.weed)

        # Get already seen candidates (never show same person twice)
        seen_candidates = DailyPool.objects.filter(
            viewer=user,
        ).values_list('candidate_id', flat=True)

        candidates = candidates.exclude(id__in=seen_candidates)

        # Step 1: Strict matches (same category)
        strict_matches = list(candidates.filter(
            intent__looking_for=user_intent.looking_for
        ))
        random.shuffle(strict_matches)

        # Take up to 10 intent matches
        intent_matches = strict_matches[:10]
        intent_match_count = len(intent_matches)

        # Step 2: If less than 10, fill from other categories
        random_fills = []
        if len(intent_matches) < 10:
            remaining = 10 - len(intent_matches)

            # Get candidates not in intent matches and not same category
            strict_ids = [u.id for u in intent_matches]
            loose_matches = list(candidates.exclude(
                id__in=strict_ids
            ).exclude(intent__looking_for=user_intent.looking_for))
            random.shuffle(loose_matches)

            random_fills = loose_matches[:remaining]

        random_fill_count = len(random_fills)
        total = intent_match_count + random_fill_count

        return Response({
            'intent_matches': intent_match_count,
            'random_fills': random_fill_count,
            'total': total,
            'is_editable': preference.is_editable,
            'lock_time': preference.lock_time_ist.isoformat(),
            'generation_time': preference.generation_time_ist.isoformat(),
            'looking_for': user_intent.looking_for,
        }, status=status.HTTP_200_OK)