import json
from django.contrib.auth.models import User
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Game_Room
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .PongGame import PongGame
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer

class GameRoom(AsyncWebsocketConsumer):
    game_instances = {}
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"game_{self.room_name}"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        self.game = self.get_or_create_game_instance()
        asyncio.ensure_future(self.game_loop())

    async def game_loop(self):
        connected_players = len(self.channel_layer.groups.get(self.room_group_name, set()))
        if connected_players == 2 and not self.game.started:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_game',
                }
            )
            self.game.started = True
            while self.game.started == True: 
                if self.game:
                    self.game.update_game_state()
                    updated_state = self.game.get_game_state()
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'send_game_state',
                            'state': updated_state,
                        }
                    )
                    if self.game.game_over:
                        await self.game_over('p1' if self.game.score1 == 10 else 'p2')      
                await asyncio.sleep(0.01)

    async def disconnect(self, close_code):
        if self.game.started == True and self.game.game_over == False:
            await self.afk_end_game() 
        elif self.game.started == False and self.game.game_over == False:
            await self.remove_game_instance()
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        if self.room_name in self.game_instances:
            del self.game_instances[self.room_name]

    async def receive(self, text_data):
        data = json.loads(text_data)
        if 'paddle1Y' in data:
            self.game.update_paddle1Y(data['paddle1Y'])
        if 'paddle2Y' in data:
            self.game.update_paddle2Y(data['paddle2Y'])
        self.game.update_game_state()
        updated_state = self.game.get_game_state()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_game_state',
                'state': updated_state,
            }
        )

    async def game_end(self, event):
        await self.send(text_data=json.dumps({'game_end': True}))

    async def send_game_state(self, event):
        state = event['state']
        await self.send(text_data=json.dumps(state))

    async def AFK(self, event):
        await self.send(text_data=json.dumps({'AFK': True}))

    async def start_game(self, event):
        connected_players = len(self.channel_layer.groups.get(self.room_group_name, set()))
        if connected_players == 2:
            await self.send(text_data=json.dumps({'start_game': True}))

    def get_or_create_game_instance(self):
        if self.room_name not in self.game_instances:
            self.game_instances[self.room_name] = PongGame(self.room_name)
        return self.game_instances[self.room_name]

    @database_sync_to_async
    def remove_game_instance(self):
            game_room = Game_Room.objects.get(slug=self.room_name)
            game_room.delete()

    @database_sync_to_async
    def game_over(self, scorer):
        game_room = Game_Room.objects.get(slug=self.room_name)
        print("GAME OVER\n")
        game_room.score_host = self.game.score1
        game_room.score_guest = self.game.score2
        user_host = User.objects.get(username=game_room.user_host)
        user_guest = User.objects.get(username=game_room.user_guest)
        if game_room.score_host > game_room.score_guest:
            game_room.winner = game_room.user_host.username
            game_room.loser = game_room.user_guest.username
            print("WINNER: ", game_room.winner, '\n')
            user_host.profile.win_count += 1
            user_guest.profile.lose_count += 1
        else:
            game_room.winner = game_room.user_guest.username
            game_room.loser = game_room.user_host.username
            print("WINNER: ", game_room.winner, '\n')
            user_guest.profile.win_count += 1
            user_host.profile.lose_count += 1

        game_room.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'game_end',
                'message': "Game Over"
            }
        )



    @database_sync_to_async
    def afk_end_game(self):
        self.game.score1 = 0
        self.game.score2 = 0
        self.game.paddle1Y = 250
        self.game.paddle2Y = 250
        self.game.ballSpeedX = 0
        self.game.ballSpeedY = 0
        self.game.reset_ball('p1')
        game_room = Game_Room.objects.get(slug=self.room_name)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'AFK',
                'message': 'AFK',
            }
        )
        game_room.delete()


