import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
import apps.conversation.routing

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': URLRouter(
        apps.conversation.routing.websocket_urlpatterns
    ),
})