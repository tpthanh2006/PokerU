from rest_framework import serializers
from .models import Chat, ChatMember, Message
from users.serializers import UserSerializer
from games.models import Game

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    is_from_me = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'created_at', 'is_system_message', 'is_from_me']
        read_only_fields = ['sender', 'created_at', 'is_system_message', 'is_from_me']

    def get_is_from_me(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.sender == request.user
        return False

class ChatMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatMember
        fields = ['id', 'user', 'joined_at', 'last_read']
        read_only_fields = ['joined_at']

class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    members = ChatMemberSerializer(many=True, read_only=True)
    unread_count = serializers.SerializerMethodField()
    game_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = ['id', 'game', 'game_title', 'created_at', 'is_active', 'messages', 'members', 'unread_count']
        read_only_fields = ['created_at', 'is_active']

    def get_unread_count(self, obj):
        user = self.context['request'].user
        try:
            member = obj.members.get(user=user)
            return obj.messages.filter(created_at__gt=member.last_read).count()
        except ChatMember.DoesNotExist:
            return 0

    def get_game_title(self, obj):
        return obj.game.title if obj.game else None 