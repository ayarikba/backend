"""
WSGI config for ft_transcendence project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""



from django.core.wsgi import get_wsgi_application
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from user.routing import websocket_urlpatterns as user_websocket_urlpatterns
from game.routing import websocket_urlpatterns as game_websocket_urlpatterns
import django
import os 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ft_transcendence.settings')
import django
django.setup()

application = get_wsgi_application()
