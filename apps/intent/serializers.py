from rest_framework import serializers  # imports DRF serializer tools
from .models import UserIntent  # imports our model

class UserIntentSerializer(serializers.ModelSerializer):
    # serializer for UserIntent
    # converts intent object to JSON and back

    class Meta:
        model = UserIntent
        fields = [
            'id',
            'what_are_you_doing',
            'looking_for',
            'updated_at',
        ]
        read_only_fields = ['updated_at']  # set automatically, user cannot change it