from rest_framework import status  # imports HTTP status codes
from rest_framework.response import Response  # imports Response object
from rest_framework.views import APIView  # imports base APIView class
from rest_framework.permissions import IsAuthenticated  # only logged in users
from .models import Match, Rejection  # imports our models
from apps.conversation.models import PromptQuestion, PromptAnswer
from apps.notifications.models import Notification


class RejectMatchView(APIView):
    # handles rejecting a match
    # either user can reject at any point
    # rejection requires a mandatory reason — max 100 chars
    # match closes immediately after rejection
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        # find the match
        try:
            match = Match.objects.get(id=match_id)
            if request.user != match.user_a and request.user != match.user_b:  # user must be part of this match
                return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

        # check if match is still active
        if match.status != 'active':  # cannot reject an already closed match
            return Response({
                'error': 'This match is no longer active.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # get rejection reason from request
        reason = request.data.get('reason', '').strip()  # strip removes extra spaces

        if not reason:  # reason is mandatory
            return Response({
                'error': 'Rejection reason is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if len(reason) > 100:  # reason cannot exceed 100 characters
            return Response({
                'error': 'Rejection reason cannot exceed 100 characters.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # find the other user — they are the rejected user
        rejected_user = match.user_b if request.user == match.user_a else match.user_a

        # create rejection record
        Rejection.objects.create(
            match=match,  # link to this match
            rejected_by=request.user,  # user who rejected
            rejected_user=rejected_user,  # user who was rejected
            reason=reason,  # the reason
        )

        # close the match immediately
        match.status = 'rejected'
        match.save()

        # Create notification for the rejected user
        Notification.objects.create(
            user=rejected_user,
            notification_type='rejection',
            title='You were unmatched',
            message='A match has ended. The reason has been recorded.',
            reason=reason,
        )

        return Response({
            'message': 'Match rejected.'
        }, status=status.HTTP_200_OK)


class MyRejectionsView(APIView):
    # returns all rejections received by the logged in user
    # reason is shown anonymously — rejected_by is never revealed
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # get all rejections where this user was rejected
        rejections = Rejection.objects.filter(rejected_user=request.user)

        # build response — only show reason, not who rejected
        data = []
        for rejection in rejections:
            data.append({
                'match_id': rejection.match.id,  # which match was rejected
                'reason': rejection.reason,  # the reason — shown anonymously
                'rejected_at': rejection.created_at,  # when rejection happened
            })

        return Response(data, status=status.HTTP_200_OK)
    

class MatchListView(APIView):
    # returns all matches for the logged in user
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # get all matches where this user is either user_a or user_b
        matches_as_a = Match.objects.filter(user_a=request.user)  # matches where user is user_a
        matches_as_b = Match.objects.filter(user_b=request.user)  # matches where user is user_b

        # combine both querysets
        all_matches = list(matches_as_a) + list(matches_as_b)

        # build response data
        data = []
        for match in all_matches:
            # find the other user in this match
            other_user = match.user_b if request.user == match.user_a else match.user_a

            # check chat unlock status
            my_questions_count = PromptQuestion.objects.filter(user=request.user).count()
            other_questions_count = PromptQuestion.objects.filter(user=other_user).count()
            my_answers_count = PromptAnswer.objects.filter(match=match, answerer=other_user).count()
            other_answers_count = PromptAnswer.objects.filter(match=match, answerer=request.user).count()

            chat_unlocked = (
                my_answers_count >= my_questions_count and
                other_answers_count >= other_questions_count and
                my_questions_count > 0 and
                other_questions_count > 0
            )

            data.append({
                'id': match.id,  # match id
                'status': match.status,  # active / expired / rejected
                'created_at': match.created_at,  # when match was created
                'expires_at': match.expires_at,  # when match expires
                'chat_unlocked': chat_unlocked,  # whether chat is unlocked
                'other_user': {
                    'id': other_user.id,
                    'name': other_user.name,  # other user's name
                    'city': other_user.city,  # other user's city
                    'photos': [
                    {
                        'image': photo.cloudinary_image if photo.cloudinary_image else (photo.image.url if photo.image else None),
                        'order': photo.order
                    }
                    for photo in other_user.photos.all()
                ],
                },
            })

        return Response(data, status=status.HTTP_200_OK)