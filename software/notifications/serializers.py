from rest_framework import serializers
from .models import Notification
from games.models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'title']

class NotificationSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'game', 'created_at', 'read'] 