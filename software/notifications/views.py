from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from users.models import ClerkUser
from django.contrib.auth.models import User

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        print("\n=== Getting Notifications ===")
        print(f"User: {self.request.user}")
        print(f"User type: {type(self.request.user)}")
        
        if not self.request.user.is_authenticated:
            print("User not authenticated")
            return Notification.objects.none()
        
        # Get notifications for the Django User directly
        notifications = Notification.objects.filter(user=self.request.user)
        print(f"Found {notifications.count()} notifications")
        return notifications

    @action(detail=False)
    def unread(self, request):
        print(f"\n=== Getting Unread Notifications ===")
        print(f"User: {request.user}")
        queryset = self.get_queryset().filter(read=False)
        print(f"Found {queryset.count()} unread notifications")
        return Response(
            self.serializer_class(
                queryset,
                many=True
            ).data
        )

    @action(detail=False, methods=['post'])
    def test(self, request):
        """Create a test notification (only in development)"""
        notification = Notification.objects.create(
            user=request.user,  # Use Django User directly
            type=request.data.get('type', 'GAME_STARTED'),
            title=request.data.get('title', 'Test Notification'),
            message=request.data.get('message', 'This is a test notification'),
            game_id=request.data.get('gameId')
        )
        return Response({'status': 'created', 'id': notification.id}) 

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        try:
            notification = self.get_queryset().get(pk=pk)
            notification.read = True
            notification.save()
            return Response({'status': 'success'})
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'}, 
                status=status.HTTP_404_NOT_FOUND
            ) 