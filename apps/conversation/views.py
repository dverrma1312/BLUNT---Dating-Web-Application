from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import PromptQuestion, PromptAnswer, Message
from .serializers import PromptQuestionSerializer, PromptAnswerSerializer, MessageSerializer
from apps.connections.models import Match


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

            return Response({
                'message': 'Answer submitted successfully.',
                'chat_unlocked': chat_unlocked,
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
            if request.user != match.user_a and request.user != match.user_b:
                return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

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