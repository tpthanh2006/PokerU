from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FriendRequest
from users.serializers import ProfileSerializer

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = ProfileSerializer(source='sender.profile', read_only=True)
    receiver = ProfileSerializer(source='receiver.profile', read_only=True)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

class FriendListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'profile']
        depth = 1