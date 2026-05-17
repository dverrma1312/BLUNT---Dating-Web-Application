from rest_framework import serializers
from .models import BugReport


class BugReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = BugReport
        fields = ['id', 'user', 'page', 'description', 'created_at', 'resolved']
        read_only_fields = ['user', 'created_at', 'resolved']