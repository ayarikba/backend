from django.db import models
from django.contrib.auth.models import User


class Game_Room(models.Model):
    slug = models.SlugField(unique=True)
    user_host = models.CharField(max_length=100, default='host')
    user_guest = models.CharField(max_length=100, default='guest')
    winner = models.CharField(max_length=100, default='none')
    loser = models.CharField(max_length=100, default='none')
    score_host = models.IntegerField(default=0)
    score_guest = models.IntegerField(default=0)
    game_over = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)