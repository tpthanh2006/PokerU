from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import ClerkUser

class ClerkAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            user = authenticate(request=request, token=token)
            if user:
                request.user = user
            else:
                # Don't invalidate the session if auth fails
                print("Auth failed but continuing")

        response = self.get_response(request)
        return response

class UsernameSyncMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
            try:
                clerk_user = ClerkUser.objects.get(user=user)
                if user.username != f"user_{clerk_user.clerk_id.split('_')[1]}":
                    user.username = f"user_{clerk_user.clerk_id.split('_')[1]}"
                    user.save()
            except ClerkUser.DoesNotExist:
                pass

        response = self.get_response(request)
        return response