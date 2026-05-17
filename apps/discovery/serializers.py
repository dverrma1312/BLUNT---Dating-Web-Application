from rest_framework import serializers
from .models import UserPreference
from apps.users.models import User
from django.utils import timezone
from datetime import timedelta
import pytz


class UserPreferenceSerializer(serializers.ModelSerializer):
    is_editable = serializers.SerializerMethodField()
    lock_time = serializers.SerializerMethodField()
    generation_time = serializers.SerializerMethodField()

    class Meta:
        model = UserPreference
        fields = [
            'age_min', 'age_max', 'city', 'drinks', 'smokes', 'weed',
            'is_editable', 'lock_time', 'generation_time', 'updated_at'
        ]
        read_only_fields = ['updated_at']

    def get_is_editable(self, obj):
        """Check if edit window is open (before 7am IST)"""
        return obj.is_editable

    def get_lock_time(self, obj):
        """Return ISO datetime when pool locks"""
        return obj.lock_time_ist.isoformat()

    def get_generation_time(self, obj):
        """Return ISO datetime when pool generates"""
        return obj.generation_time_ist.isoformat()


class UserPreferenceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['age_min', 'age_max', 'city', 'drinks', 'smokes', 'weed']

    def validate_age_min(self, value):
        if value < 18:
            raise serializers.ValidationError("Minimum age must be 18 or older")
        return value

    def validate_age_max(self, value):
        if value > 100:
            raise serializers.ValidationError("Maximum age must be 100 or younger")
        return value

    def validate(self, data):
        if data.get('age_min', 0) > data.get('age_max', 100):
            raise serializers.ValidationError("Minimum age cannot be greater than maximum age")
        return data


class PoolPreviewSerializer(serializers.Serializer):
    """Serializer for pool preview response"""
    intent_matches = serializers.IntegerField()
    random_fills = serializers.IntegerField()
    total = serializers.IntegerField()
    is_editable = serializers.BooleanField()
    lock_time = serializers.CharField()
    generation_time = serializers.CharField()