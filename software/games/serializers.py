from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Game, GamePlayer, GameStats
from users.serializers import ProfileSerializer
from datetime import datetime
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.db.models import Sum

class UserSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'image_url']
        
    def get_image_url(self, obj):
        try:
            if hasattr(obj, 'clerkuser') and obj.clerkuser:
                return obj.clerkuser.profile_image_url
            elif hasattr(obj, 'user_profile') and obj.user_profile:
                return obj.user_profile.profile_image_url
            return None
        except Exception as e:
            print(f"Error getting image_url for user {obj.username}: {str(e)}")
            return None
        
class GamePlayerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GamePlayer
        fields = ['id', 'username', 'is_admin', 'is_host', 'joined_at', 'image_url']
        
    def get_image_url(self, obj):
        try:
            if hasattr(obj.user, 'clerkuser') and obj.user.clerkuser:
                return obj.user.clerkuser.profile_image_url
            elif hasattr(obj.user, 'user_profile') and obj.user.user_profile:
                return obj.user.user_profile.profile_image_url
            return None
        except Exception as e:
            print(f"Error getting image_url for user {obj.user.username}: {str(e)}")
            return None

class GameSerializer(serializers.ModelSerializer):
    players = GamePlayerSerializer(source='game_players', many=True, read_only=True)
    host = UserSerializer(read_only=True)
    player_count = serializers.IntegerField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    is_hosted_by_me = serializers.SerializerMethodField()
    is_player = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            'id', 'host', 'title', 'description', 'location', 
            'scheduled_time', 'buy_in', 'slots', 'blinds',
            'amount_reserved', 'private', 'status', 'players',
            'player_count', 'is_past_due', 'is_hosted_by_me', 'is_player'
        ]
        read_only_fields = ['host', 'status']

    def get_is_hosted_by_me(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.host == request.user
        return False

    def get_is_player(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.game_players.filter(user=request.user).exists()
        return False

    def validate_scheduled_time(self, value):
        """
        Check that the game is not scheduled in the past
        """
        if value < timezone.now():
            raise serializers.ValidationError("Cannot schedule a game in the past")
        return value

class GameStatsSerializer(serializers.ModelSerializer):
    net_profit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    roi = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    hourly_rate = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = GameStats
        fields = ['id', 'game', 'player', 'buy_in', 'cash_out', 'hours_played', 
                 'net_profit', 'roi', 'hourly_rate', 'created_at', 'updated_at']
        read_only_fields = ['player', 'created_at', 'updated_at']

class LeaderboardUserSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    winnings = serializers.SerializerMethodField()
    position = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'imageUrl', 'winnings', 'position']

    def get_imageUrl(self, obj):
        if hasattr(obj, 'clerkuser') and obj.clerkuser.profile_image_url:
            return obj.clerkuser.profile_image_url
        return None

    def get_winnings(self, obj):
        return GameStats.objects.filter(player=obj).aggregate(
            total_winnings=Sum('cash_out') - Sum('buy_in')
        )['total_winnings'] or 0