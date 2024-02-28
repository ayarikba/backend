from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
from rest_framework import serializers
from django.contrib.auth.models import User
import re


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('avatar', 'bio', 'win_count', 'lose_count', 'fa_enabled', 'friends', 'sended_friend_requests', 'received_friend_requests', 'online_status', 'game_room')

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('avatar', 'bio')

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserSignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    username = serializers.CharField()
