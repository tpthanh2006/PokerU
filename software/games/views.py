from rest_framework import viewsets
from .models import Game, GamePlayer, GameStats
from .serializers import GameSerializer, GameStatsSerializer, LeaderboardUserSerializer
from users.authentication import ClerkAuthentication
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
import logging
from users.models import Profile
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from notifications.models import Notification
import random
from django.db.models import Sum, F, Window
from django.db.models.functions import Rank
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

class GameViewSet(viewsets.ModelViewSet):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        print("\n=== Serializer Context ===")
        print(f"User: {self.request.user}")
        print(f"Is authenticated: {self.request.user.is_authenticated}")
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        print("\n=== Creating Game ===")
        print(f"User: {self.request.user}")
        print(f"Is authenticated: {self.request.user.is_authenticated}")
        serializer.save(host=self.request.user)

    def get_queryset(self):
        """
        Get queryset based on the requested status
        """
        print("\n=== Fetching Games ===")
        
        # Start with all games
        queryset = Game.objects.select_related(
            'host',
            'host__clerkuser'
        ).prefetch_related(
            'game_players',
            'game_players__user',
            'game_players__user__clerkuser'
        )
        
        # Get status from query params
        status_params = self.request.query_params.getlist('status')
        print(f"Requested status: {status_params}")
        
        # Filter by status if provided
        if status_params:
            queryset = queryset.filter(status__in=status_params)
        else:
            # Default to showing both upcoming and in_progress games
            queryset = queryset.filter(status__in=['upcoming', 'in_progress'])
        
        # Order by scheduled time
        queryset = queryset.order_by('scheduled_time')
        
        print(f"Found {queryset.count()} games")
        return queryset

    def list(self, request, *args, **kwargs):
        """Override list to add debug logging"""
        print("\n=== Games List Request ===")
        print(f"User: {request.user}")
        print(f"Is authenticated: {request.user.is_authenticated}")
        print(f"Query params: {request.query_params}")
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        print(f"Returning {len(serializer.data)} games")
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        game = self.get_object()
        # Only allow the host to delete their own games
        if game.host != request.user:
            return Response(
                {"detail": "Only the host can delete this game"}, 
                status=403
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        game = self.get_object()
        
        # Check if game is full
        if game.player_count >= game.slots:
            return Response(
                {"detail": "Game is full"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if user is already in the game
        if GamePlayer.objects.filter(user=request.user, game=game).exists():
            return Response(
                {"detail": "Already joined this game"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create GamePlayer instance
        GamePlayer.objects.create(user=request.user, game=game)
        serializer = self.get_serializer(game)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def remove_player(self, request, pk=None):
        game = self.get_object()
        player_id = request.data.get('player_id')
        
        try:
            player = GamePlayer.objects.get(id=player_id, game=game)
            
            # Don't allow removing the host
            if player.user == game.host:
                return Response(
                    {"detail": "Cannot remove the host from the game"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Only host or admins can remove players
            if request.user != game.host and not game.game_players.filter(user=request.user, is_admin=True).exists():
                return Response(
                    {"detail": "Only host or admins can remove players"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            player.delete()
            serializer = self.get_serializer(game)
            return Response(serializer.data)
            
        except GamePlayer.DoesNotExist:
            return Response(
                {"detail": "Player not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def toggle_admin(self, request, pk=None):
        game = self.get_object()
        player_id = request.data.get('player_id')
        
        try:
            player = GamePlayer.objects.get(id=player_id, game=game)
            
            # Only host can promote/demote admins
            if request.user != game.host:
                return Response(
                    {"detail": "Only the host can manage admin status"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Don't allow changing host's admin status
            if player.user == game.host:
                return Response(
                    {"detail": "Cannot change host's admin status"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            player.is_admin = not player.is_admin
            player.save()
            
            serializer = self.get_serializer(game)
            return Response(serializer.data)
            
        except GamePlayer.DoesNotExist:
            return Response(
                {"detail": "Player not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False)
    def archived(self, request):
        """
        Get archived games that the user participated in
        """
        user = request.user
        archived_games = Game.objects.filter(
            status='archived',
            game_players__user=user  # Only get games where user was a player
        ).distinct()
        
        serializer = self.get_serializer(archived_games, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def stats(self, request, pk=None):
        game = self.get_object()
        
        # Check if user was a player in the game
        if not game.game_players.filter(user=request.user).exists():
            return Response(
                {"detail": "You must be a player in this game to submit stats"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Get or create stats for this player
        stats, created = GameStats.objects.get_or_create(
            game=game,
            player=request.user,
            defaults={
                'buy_in': request.data.get('buyIn', 0),
                'cash_out': request.data.get('cashOut', 0),
                'hours_played': request.data.get('hoursPlayed', 0)
            }
        )
        
        if not created:
            # Update existing stats
            stats.buy_in = request.data.get('buyIn', stats.buy_in)
            stats.cash_out = request.data.get('cashOut', stats.cash_out)
            stats.hours_played = request.data.get('hoursPlayed', stats.hours_played)
            stats.save()
            
        serializer = GameStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def player_stats(self, request, pk=None):
        game = self.get_object()
        print(f"\n=== Getting Player Stats ===")
        print(f"Game ID: {pk}")
        print(f"User: {request.user.username}")
        print(f"Game Status: {game.status}")
        try:
            stats = GameStats.objects.get(game=game, player=request.user)
            serializer = GameStatsSerializer(stats)
            return Response(serializer.data)
        except GameStats.DoesNotExist:
            print(f"No stats found for game {pk} and user {request.user.username}")
            return Response(
                {"detail": "No stats found for this game"},
                status=status.HTTP_404_NOT_FOUND
            )

    def get_object(self):
        """
        Override get_object to allow retrieving archived games
        """
        queryset = Game.objects.select_related(
            'host'
        ).prefetch_related(
            'game_players',
            'game_players__user'
        )
        
        # Lookup the game
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        
        # Get the game regardless of status
        game = get_object_or_404(queryset, **filter_kwargs)
        
        # Check permissions
        self.check_object_permissions(self.request, game)
        
        print(f"\n=== Retrieved Game ===")
        print(f"Game ID: {game.id}")
        print(f"Title: {game.title}")
        print(f"Status: {game.status}")
        
        return game

    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Get statistics for the current user"""
        print("\n=== Getting User Stats ===")
        print(f"User: {request.user.username}")
        stats = GameStats.get_user_stats(request.user)
        print("Stats:", stats)
        return Response(stats)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update the game status
        """
        game = self.get_object()
        new_status = request.data.get('status')
        
        # Simply update the status - notifications will be handled by the Game model's save method
        game.status = new_status
        game.save()
        
        serializer = self.get_serializer(game)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        game = self.get_object()
        
        try:
            player = GamePlayer.objects.get(game=game, user=request.user)
            
            # Don't allow host to leave
            if request.user == game.host:
                return Response(
                    {"detail": "Host cannot leave the game"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            player.delete()
            serializer = self.get_serializer(game)
            return Response(serializer.data)
            
        except GamePlayer.DoesNotExist:
            return Response(
                {"detail": "You are not in this game"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False)
    def my_games(self, request):
        """Get games where the user is a player"""
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user = request.user
        
        # Get upcoming and in-progress games
        active_games = Game.objects.filter(
            game_players__user=user,
            status__in=['upcoming', 'in_progress']
        )

        # Get completed games without player stats
        completed_games = Game.objects.filter(
            game_players__user=user,
            status='completed'
        ).exclude(
            player_stats__player=user  # Changed from game_stats to player_stats
        )
        
        # Combine and sort games
        games = (active_games | completed_games).distinct().order_by('scheduled_time')

        # Add related data
        games = games.select_related(
            'host',
            'host__clerkuser'
        ).prefetch_related(
            'game_players',
            'game_players__user',
            'game_players__user__clerkuser'
        )

        serializer = self.get_serializer(games, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def notifications(self, request):
        """Get user's unread notifications"""
        notifications = Notification.objects.filter(
            user=request.user,
            read=False
        ).order_by('-created_at')
        
        return Response([{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'type': n.type,
            'data': n.data,
            'created_at': n.created_at
        } for n in notifications])

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        try:
            notification = Notification.objects.get(
                id=pk,
                user=request.user
            )
            notification.read = True
            notification.save()
            return Response({'status': 'success'})
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False)
    def leaderboard(self, request):
        """Get global or friends leaderboard"""
        is_global = request.query_params.get('type') == 'global'
        
        # Start with all users who have played games
        users = User.objects.filter(
            game_stats__isnull=False
        ).distinct()

        # Calculate total winnings for each user
        users = users.annotate(
            winnings=Sum(F('game_stats__cash_out') - F('game_stats__buy_in'))
        )

        # If friends leaderboard, filter to only friends
        if not is_global:
            # Implement friend filtering here when friend system is added
            pass

        # Add position using window function and order by winnings
        users = users.annotate(
            position=Window(
                expression=Rank(),
                order_by=F('winnings').desc(nulls_last=True)
            )
        ).order_by('position')[:10]  # Get top 10

        print(f"\n=== Leaderboard Query ===")
        print(f"Type: {'Global' if is_global else 'Friends'}")
        print(f"Found {users.count()} users")
        
        serializer = LeaderboardUserSerializer(users, many=True)
        return Response(serializer.data)

@require_http_methods(['POST'])
def remove_player(request, game_id):
    try:
        game = Game.objects.get(id=game_id)
        player = request.user
        game_player = GamePlayer.objects.get(game=game, user=player)
        game_player.delete()
        return Response(GameSerializer(game).data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)