from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import FriendRequest
from .serializers import FriendRequestSerializer, FriendListSerializer
from notifications.models import Notification

class FriendViewSet(viewsets.ModelViewSet):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FriendRequest.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).select_related(
            'sender__profile',
            'receiver__profile'
        )

    @action(detail=False, methods=['POST'])
    def send_request(self, request):
        receiver_id = request.data.get('user_id')
        if not receiver_id:
            return Response(
                {'error': 'user_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if request already exists
        if FriendRequest.objects.filter(
            Q(sender=request.user, receiver_id=receiver_id) |
            Q(sender_id=receiver_id, receiver=request.user)
        ).exists():
            return Response(
                {'error': 'Friend request already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        friend_request = FriendRequest.objects.create(
            sender=request.user,
            receiver_id=receiver_id
        )

        # Create notification for receiver
        Notification.objects.create(
            user_id=receiver_id,
            type='FRIEND_REQUEST',
            title='New Friend Request',
            message=f'{request.user.username} sent you a friend request'
        )

        serializer = self.get_serializer(friend_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['POST'])
    def accept(self, request, pk=None):
        friend_request = self.get_object()
        
        if friend_request.receiver != request.user:
            return Response(
                {'error': 'Not authorized to accept this request'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        friend_request.status = 'accepted'
        friend_request.save()

        # Create notification for sender
        Notification.objects.create(
            user=friend_request.sender,
            type='FRIEND_REQUEST_ACCEPTED',
            title='Friend Request Accepted',
            message=f'{request.user.username} accepted your friend request'
        )

        serializer = self.get_serializer(friend_request)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def decline(self, request, pk=None):
        friend_request = self.get_object()
        
        if friend_request.receiver != request.user:
            return Response(
                {'error': 'Not authorized to decline this request'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        friend_request.status = 'declined'
        friend_request.save()
        
        serializer = self.get_serializer(friend_request)
        return Response(serializer.data)

    @action(detail=False)
    def pending(self, request):
        pending_requests = FriendRequest.objects.filter(
            receiver=request.user,
            status='pending'
        ).select_related(
            'sender__profile',
            'receiver__profile'
        )
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def friends(self, request):
        # Get all accepted friend requests
        friend_requests = FriendRequest.objects.filter(
            (Q(sender=request.user) | Q(receiver=request.user)),
            status='accepted'
        )
        
        # Get the friend users from the requests
        friends = User.objects.filter(
            Q(sent_requests__in=friend_requests) |
            Q(received_requests__in=friend_requests)
        ).exclude(id=request.user.id).distinct()
        
        serializer = FriendListSerializer(friends, many=True)
        return Response(serializer.data)