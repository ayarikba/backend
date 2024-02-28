from django.db import models
from django.contrib.auth.models import User
from game.models import Game_Room
# Create your models here.

class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	avatar = models.ImageField(upload_to='avatars/', default='avatars/default_profile_picture.jpg')
	avatar_42 = models.URLField(blank=True)
	bio = models.TextField(max_length=500, blank=True, default="selam")
	win_count = models.IntegerField(default=0)
	lose_count = models.IntegerField(default=0)
	fa_enabled = models.BooleanField(default=False)
	friends = models.ManyToManyField(User, blank=True, related_name='friends')
	sended_friend_requests = models.ManyToManyField(User, blank=True, related_name='sended_friend_requests')
	received_friend_requests = models.ManyToManyField(User, blank=True, related_name='received_friend_requests')
	online_status = models.BooleanField(default=False)
	game_room = models.ManyToManyField(Game_Room, blank=True, related_name='game_room')
