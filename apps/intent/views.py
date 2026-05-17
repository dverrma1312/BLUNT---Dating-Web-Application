from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import UserIntent
from .serializers import UserIntentSerializer

class UserIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # get current intent — returns 404 if none exists yet
        try:
            intent = UserIntent.objects.get(user=request.user)
            serializer = UserIntentSerializer(intent)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserIntent.DoesNotExist:
            return Response({'detail': 'No intent found for user.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        # first time only — called during onboarding page
        # creates the intent for the first time
        if UserIntent.objects.filter(user=request.user).exists():  # if intent already exists
            return Response({
                'error': 'Intent already set. Use PUT to update.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserIntentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # link intent to logged in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        # update existing intent anytime
        try:
            intent = UserIntent.objects.get(user=request.user)
        except UserIntent.DoesNotExist:
            return Response({'error': 'No intent found. Use POST to create one.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserIntentSerializer(intent, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)