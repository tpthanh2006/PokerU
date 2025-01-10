from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from users.webhooks import clerk_webhook

# Add this function to test the API is working
def test_view(request):
    return HttpResponse("API is working!")

urlpatterns = [
    path('', test_view),  # Add a root path test
    path('admin/', admin.site.urls),
    path('api/games/', include('games.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/users/', include('users.urls')),
    path('api/users/webhooks/clerk/', clerk_webhook, name='clerk-webhook'),
    path('api/chat/', include('chat.urls')),
]