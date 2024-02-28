from django.urls import re_path, path
from . import consumers

websocket_urlpatterns = [
    path('ws/game/<str:room_name>/', consumers.GameRoom.as_asgi()),
]

