from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Game_Room
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
import secrets
from django.http import JsonResponse
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from game.models import Game_Room
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
def generate_unique_hex():
    unique_hex = secrets.token_hex(3)
    return unique_hex

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username_from_frontend = data.get('username', None)
            if username_from_frontend:
                room = Game_Room.objects.create()
                room.slug = generate_unique_hex()
                room.user_host = username_from_frontend
                user = User.objects.get(username=username_from_frontend)
                user.profile.game_room.add(room)
                user.save()
                room.save()
                print(room.slug)
                return JsonResponse({'success':True, 'room': room.slug, 'status':'host'})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload'})

    return JsonResponse({'error': 'Invalid request method'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_room(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username_from_frontend = data.get('username', None)
            room_slug = data.get('room', None)
            if username_from_frontend and room_slug:
                room = Game_Room.objects.get(slug=room_slug)
                if room.user_guest != 'guest':
                    return JsonResponse({'error': 'Room is full'})
                if room.user_host == username_from_frontend:
                    return JsonResponse({'error': 'You are already the host of this room'})
                if room.user_host == 'host':
                    return JsonResponse({'error': 'Room does not exist'})
                if room.game_over == True:
                    return JsonResponse({'error': 'Game is over'})
                room.user_guest = username_from_frontend
                user = User.objects.get(username=username_from_frontend)
                user.profile.game_room.add(room)
                user.save()
                room.save()
                return JsonResponse({'success': True, 'status':'guest'})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload'})

    return JsonResponse({'error': 'Invalid request method'})
