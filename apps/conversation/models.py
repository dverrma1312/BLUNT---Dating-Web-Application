from django.db import models  # imports Django model base classes
from apps.users.models import User  # imports our User model
from apps.connections.models import Match  # imports our Match model

class PromptQuestion(models.Model):
    # stores the 5 questions each user writes
    # these questions are shown to their match to answer

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')  # user who wrote this question
    question = models.TextField()  # the question text
    order = models.PositiveIntegerField()  # order of question 1 to 5

    class Meta:
        ordering = ['order']  # always return questions in order
        unique_together = ['user', 'order']  # user cannot have two questions at same order position

    def __str__(self):
        return f"Q{self.order} by {self.user.name}: {self.question[:50]}"  # how question appears in admin panel


class PromptAnswer(models.Model):
    # stores answers to prompt questions
    # each user answers their match's questions

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='answers')  # which match this answer belongs to
    answerer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers_given')  # user who answered
    question = models.ForeignKey(PromptQuestion, on_delete=models.CASCADE, related_name='answers')  # which question was answered
    answer = models.TextField()  # the answer text
    answered_at = models.DateTimeField(auto_now_add=True)  # when answer was given

    class Meta:
        unique_together = ['match', 'answerer', 'question']  # same user cannot answer same question twice in same match

    def __str__(self):
        return f"{self.answerer.name} answered Q{self.question.order} in match {self.match.id}"  # how answer appears in admin panel


class Message(models.Model):
    # stores each chat message in a match
    # chat only unlocks after both users answer each other's questions

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='messages')  # which match this message belongs to
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_sent')  # user who sent this message
    content = models.TextField()  # the message text
    sent_at = models.DateTimeField(auto_now_add=True)  # when message was sent
    is_read = models.BooleanField(default=False)  # whether message has been read by the other user

    class Meta:
        ordering = ['sent_at']  # always return messages in chronological order

    def __str__(self):
        return f"{self.sender.name} in match {self.match.id}: {self.content[:50]}"  # how message appears in admin panel