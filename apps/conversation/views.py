from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import PromptQuestion, PromptAnswer, Message
from .serializers import PromptQuestionSerializer, PromptAnswerSerializer, MessageSerializer
from apps.connections.models import Match
from django.db.models import Max


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        matches_as_a = Match.objects.filter(user_a=request.user, status='active')
        matches_as_b = Match.objects.filter(user_b=request.user, status='active')

        conversations = []

        for match in list(matches_as_a) + list(matches_as_b):
            other_user = match.user_b if request.user == match.user_a else match.user_a

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

            if not chat_unlocked:
                continue

            last_message = Message.objects.filter(match=match).order_by('-sent_at').first()
            last_message_preview = last_message.content[:30] + '...' if last_message and len(last_message.content) > 30 else (last_message.content if last_message else None)

            unread_count = Message.objects.filter(match=match, sender=other_user, is_read=False).count()

            other_user_photos = [photo.image.url for photo in other_user.photos.all()]

            conversations.append({
                'id': match.id,
                'other_user_id': other_user.id,
                'other_user_name': other_user.name,
                'other_user_photos': other_user_photos,
                'last_message': last_message_preview,
                'unread_count': unread_count,
                'is_turn': unread_count > 0,
            })

        return Response(conversations, status=status.HTTP_200_OK)


class PromptQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        questions = PromptQuestion.objects.filter(user=request.user)
        serializer = PromptQuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        existing_count = PromptQuestion.objects.filter(user=request.user).count()

        if existing_count >= 5:
            return Response({'error': 'You can only have 5 questions.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PromptQuestionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user, order=existing_count + 1)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, question_id):
        try:
            question = PromptQuestion.objects.get(id=question_id, user=request.user)
            question.delete()
            return Response({'message': 'Question deleted.'}, status=status.HTTP_200_OK)
        except PromptQuestion.DoesNotExist:
            return Response({'error': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)


class PromptAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
            if request.user != match.user_a and request.user != match.user_b:
                return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

        answers = PromptAnswer.objects.filter(match=match)
        serializer = PromptAnswerSerializer(answers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
            if request.user != match.user_a and request.user != match.user_b:
                return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

        other_user = match.user_b if request.user == match.user_a else match.user_a

        question_id = request.data.get('question')  # FIX: was 'question_id', frontend sends 'question'

        try:
            question = PromptQuestion.objects.get(id=question_id, user=other_user)
        except PromptQuestion.DoesNotExist:
            return Response({'error': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)

        if PromptAnswer.objects.filter(match=match, answerer=request.user, question=question).exists():
            return Response({'error': 'You have already answered this question.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PromptAnswerSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(match=match, answerer=request.user, question=question)

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

            self._notify_answer(match.id, other_user.id, question)

            return Response({
                'message': 'Answer submitted successfully.',
                'chat_unlocked': chat_unlocked,
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _notify_answer(self, match_id, other_user_id, question):
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        async def send_notification():
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                f'notifications_{other_user_id}',
                {
                    'type': 'answer_submitted',
                    'match_id': match_id,
                    'question_id': question.id,
                    'question': question.question,
                }
            )

        async_to_sync(send_notification())


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
            if request.user != match.user_a and request.user != match.user_b:
                return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

        if match.status != 'active':
            return Response({'error': 'This match is no longer active.'}, status=status.HTTP_400_BAD_REQUEST)

        other_user = match.user_b if request.user == match.user_a else match.user_a

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

        if not chat_unlocked:
            return Response({'error': 'Chat is locked. Both users must answer each other\'s questions first.'}, status=status.HTTP_403_FORBIDDEN)

        Message.objects.filter(match=match, sender=other_user, is_read=False).update(is_read=True)

        messages = Message.objects.filter(match=match)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
            if request.user != match.user_a and request.user != match.user_b:
                return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

        if match.status != 'active':
            return Response({'error': 'This match is no longer active.'}, status=status.HTTP_400_BAD_REQUEST)

        if match.is_expired():
            match.status = 'expired'
            match.save()
            return Response({'error': 'This match has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        other_user = match.user_b if request.user == match.user_a else match.user_a

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

        if not chat_unlocked:
            return Response({'error': 'Chat is locked. Both users must answer each other\'s questions first.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MessageSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(match=match, sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MatchQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
            if request.user != match.user_a and request.user != match.user_b:
                return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

        other_user = match.user_b if request.user == match.user_a else match.user_a

        questions = PromptQuestion.objects.filter(user=other_user)
        serializer = PromptQuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)