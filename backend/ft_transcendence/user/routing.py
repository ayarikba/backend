from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/online_status/', consumers.OnlineStatus.as_asgi()),
]

