from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from game.models import Game_Room
from asgiref.sync import sync_to_async
import asyncio


class PongGame:
    def __init__(self, room_name):
        self.room_name = room_name
        self.room_group_name = f"game_{self.room_name}"
        self.paddle1Y = 250
        self.paddle2Y = 250
        self.ballX = 450
        self.ballY = 300
        self.ballSpeedX = 5
        self.ballSpeedY = 5
        self.score1 = 0
        self.score2 = 0
        self.started = False
        self.game_over = False
    def update_game_state(self):
        if (
            self.ballY > self.paddle1Y
            and self.ballY < self.paddle1Y + 100
            and self.ballX < 20
        ):
            self.ballSpeedX *= -1

        if (
            self.ballY > self.paddle2Y
            and self.ballY < self.paddle2Y + 100
            and self.ballX > 880
        ):
            self.ballSpeedX *= -1

        # Ball collision with walls
        if self.ballY > 590 or self.ballY < 10:
            self.ballSpeedY *= -1

        # Ball scoring
        if self.ballX > 890:
            self.score1 += 1
            if self.score1 == 10:
                self.game_over = True
            self.reset_ball("p1")

        if self.ballX < 10:
            self.score2 += 1
            if self.score2 == 10:
                self.game_over = True
            self.reset_ball("p2")

        # Update ball position
        self.ballX += self.ballSpeedX
        self.ballY += self.ballSpeedY
        
    def update_paddle1Y(self, paddle1Y):
        # Update paddle1Y based on user input
        self.paddle1Y = paddle1Y

    def update_paddle2Y(self, paddle2Y):
        # Update paddle2Y based on user input
        self.paddle2Y = paddle2Y

    def reset_ball(self, scorer):
        # Reset the ball position and direction after scoring
        self.ballX = 450
        self.ballY = 300
        if scorer == "p1":
            self.ballSpeedX = -5
        else:
            self.ballSpeedX = +5
        self.ballSpeedY = 5

    def get_game_state(self):
        # Return the current game state
        return {
            "paddle1Y": self.paddle1Y,
            "paddle2Y": self.paddle2Y,
            "ballX": self.ballX,
            "ballY": self.ballY,
            "score1": self.score1,
            "score2": self.score2,
        }









