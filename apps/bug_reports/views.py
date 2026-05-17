from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import BugReport
from .serializers import BugReportSerializer


class BugReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BugReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({'message': 'Bug report submitted. Thanks!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BugReportListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        reports = BugReport.objects.all()
        serializer = BugReportSerializer(reports, many=True)
        return Response(serializer.data)