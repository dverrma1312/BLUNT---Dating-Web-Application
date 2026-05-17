from django.urls import path  # imports path function
from .views import PromptQuestionView, PromptAnswerView, ChatView, MatchQuestionsView, ConversationListView # imports our views

urlpatterns = [
    path('', ConversationListView.as_view(), name='conversation-list'),  # GET /api/conversation/
    path('questions/', PromptQuestionView.as_view(), name='prompt-questions'),  # GET + POST /api/conversation/questions/
    path('questions/<int:question_id>/', PromptQuestionView.as_view(), name='prompt-question-delete'),  # DELETE /api/conversation/questions/1/
    path('match/<int:match_id>/answers/', PromptAnswerView.as_view(), name='prompt-answers'),  # GET + POST /api/conversation/match/1/answers/
    path('match/<int:match_id>/chat/', ChatView.as_view(), name='chat'),  # GET + POST /api/conversation/match/1/chat/
    path('match/<int:match_id>/questions/', MatchQuestionsView.as_view()),
]