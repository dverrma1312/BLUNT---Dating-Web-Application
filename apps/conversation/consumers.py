import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from apps.users.models import User
from apps.connections.models import Match
from .models import Message, PromptQuestion, PromptAnswer


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = None
        token = self.scope.get('query_string', b'').decode()

        if 'token=' in token:
            token = token.split('token=')[-1].split('&')[0]
            try:
                access_token = AccessToken(token)
                self.user = await self.get_user(access_token['user_id'])
            except Exception:
                await self.close()
                return

        if not self.user:
            await self.close()
            return

        self.room_group_name = f'notifications_{self.user.id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"[NOTIFICATIONS] Connected: {self.user.name}")

    async def disconnect(self, close_code):
        if self.user:
            print(f"[NOTIFICATIONS] Disconnected: {self.user.name}")
            await self.channel_layer.group_discard(f'notifications_{self.user.id}', self.channel_name)

    async def receive(self, text_data):
        pass

    async def match_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_created',
            'match_id': event.get('match_id'),
            'other_user_id': event.get('other_user_id'),
            'other_user_name': event.get('other_user_name'),
            'other_user_photo': event.get('other_user_photo'),
        }))

    async def answer_submitted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'answer_submitted',
            'match_id': event.get('match_id'),
            'question_id': event.get('question_id'),
            'question': event.get('question'),
        }))

    async def notification(self, event):
        await self.send(text_data=json.dumps(event.get('data', {})))

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.room_group_name = f'chat_{self.match_id}'

        token = self.scope['query_string'].decode().split('token=')[-1]

        try:
            access_token = AccessToken(token)
            self.user = await self.get_user(access_token['user_id'])
        except Exception:
            await self.close()
            return

        self.match = await self.get_match(self.match_id, self.user)
        if not self.match:
            await self.close()
            return

        unlocked = await self.is_chat_unlocked(self.match, self.user)
        if not unlocked:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"CONNECTED: {self.user.name} joined {self.room_group_name}")  # debug

    async def disconnect(self, close_code):
        print(f"DISCONNECTED: {self.user.name} left {self.room_group_name}")  # debug
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get('content', '').strip()
        print(f"RECEIVE: {self.user.name} sent: {content}")  # debug

        if not content:
            return

        message = await self.save_message(self.match, self.user, content)

        print(f"GROUP SEND to: {self.room_group_name}")  # debug
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message_id': message.id,
                'sender_id': self.user.id,
                'sender_name': self.user.name,
                'content': content,
                'sent_at': str(message.sent_at),
            }
        )

    async def chat_message(self, event):
        print(f"CHAT_MESSAGE fired for: {self.user.name}")  # debug
        await self.send(text_data=json.dumps({
            'id': event['message_id'],
            'sender': event['sender_id'],
            'sender_name': event['sender_name'],
            'content': event['content'],
            'sent_at': event['sent_at'],
            'is_read': False,
        }))

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_match(self, match_id, user):
        try:
            match = Match.objects.get(id=match_id)
            if user != match.user_a and user != match.user_b:
                return None
            return match
        except Match.DoesNotExist:
            return None

    @database_sync_to_async
    def is_chat_unlocked(self, match, user):
        other_user = match.user_b if user == match.user_a else match.user_a
        my_q = PromptQuestion.objects.filter(user=user).count()
        other_q = PromptQuestion.objects.filter(user=other_user).count()
        my_ans = PromptAnswer.objects.filter(match=match, answerer=other_user).count()
        other_ans = PromptAnswer.objects.filter(match=match, answerer=user).count()
        return (
            my_ans >= my_q and
            other_ans >= other_q and
            my_q > 0 and other_q > 0
        )

    @database_sync_to_async
    def save_message(self, match, sender, content):
        return Message.objects.create(match=match, sender=sender, content=content)