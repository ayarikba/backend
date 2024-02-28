import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from django.contrib.auth.models import User
from user.models import Profile
from django.http import QueryDict
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async

class OnlineStatus(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connected")
        self.room_name = 'general'
        self.room_group_name = f'chat_{self.room_name}'

        query_string = self.scope.get('query_string', b'').decode('utf-8')
        params = QueryDict(query_string)
        username = params.get('username', None)

        if not username:
            await self.close()
            return
        print(f"User {username} connected to room {self.room_name}")
        await self.connect_user(username)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        query_string = self.scope.get('query_string', b'').decode('utf-8')
        params = QueryDict(query_string)
        username = params.get('username', None)
        await self.disconnect_user(username)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @database_sync_to_async
    def connect_user(self, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return

        profile = Profile.objects.get(user=user)
        profile.online_status = True
        profile.save()

    @database_sync_to_async
    def disconnect_user(self, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return
        profile = Profile.objects.get(user=user)
        profile.online_status = False
        profile.save()
