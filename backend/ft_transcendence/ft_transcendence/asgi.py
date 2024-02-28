# asgi.py
from django.urls import re_path
import os
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from user.routing import websocket_urlpatterns as user_websocket_urlpatterns
from game.routing import websocket_urlpatterns as game_websocket_urlpatterns
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ft_transcendence.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(
        user_websocket_urlpatterns +
        game_websocket_urlpatterns
    ),
}) 

