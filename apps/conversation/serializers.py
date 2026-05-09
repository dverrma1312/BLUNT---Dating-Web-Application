from rest_framework import serializers  # imports DRF serializer tools
from .models import PromptQuestion, PromptAnswer, Message  # imports our models

class PromptQuestionSerializer(serializers.ModelSerializer):
    # serializer for PromptQuestion
    # converts question object to JSON and back

    class Meta:
        model = PromptQuestion
        fields = ['id', 'question', 'order']  # user and match are set automatically, not sent by frontend
        read_only_fields = ['order']  # order is set automatically based on how many questions user already has

class PromptAnswerSerializer(serializers.ModelSerializer):
    # serializer for PromptAnswer
    # converts answer object to JSON and back

    class Meta:
        model = PromptAnswer
        fields = ['id', 'question', 'answer', 'answered_at']  # match and answerer are set automatically
        read_only_fields = ['answered_at']  # set automatically when answer is created

class MessageSerializer(serializers.ModelSerializer):
    # serializer for Message
    # converts message object to JSON and back

    sender_name = serializers.CharField(source='sender.name', read_only=True)  # show sender name instead of just id

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'content', 'sent_at', 'is_read']  # fields to include in JSON
        read_only_fields = ['sender', 'sender_name', 'sent_at', 'is_read']  # set automatically, not sent by frontend