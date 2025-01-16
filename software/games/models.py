import uuid
from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone as django_timezone
from django.conf import settings
from django.utils import timezone
from users.models import Profile
from model_utils import FieldTracker
from users.models import ClerkUser
from django.db.models.signals import pre_save
from django.dispatch import receiver
import random
from django.db.models import Q

class Profile(models.Model):
  user = models.OneToOneField(
    User,
    on_delete=models.CASCADE,
    related_name='game_profile'
  )
  bio = models.TextField(blank=True)
  phone = models.CharField(max_length=10, blank=True)
  address = models.CharField(max_length=1024)
  age = models.PositiveIntegerField(blank=True, null=True)
  profile_image_url = models.URLField(max_length=500, blank=True, null=True)
  #gender = models.IntegerField(choices=GENDER_CHOICES, default=1)

  def __str__(self):
    return str(self.user)

class Game(models.Model):
  STATUS_CHOICES = [
    ('upcoming', 'Upcoming'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
    ('archived', 'Archived'),
    ('cancelled', 'Cancelled'),
  ]

  host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_games', null=True)
  title = models.CharField(max_length=255)
  description = models.TextField(blank=True)
  location = models.CharField(max_length=255)
  scheduled_time = models.DateTimeField()
  buy_in = models.DecimalField(max_digits=10, decimal_places=2)
  slots = models.IntegerField()
  blinds = models.DecimalField(max_digits=10, decimal_places=2)
  amount_reserved = models.DecimalField(max_digits=10, decimal_places=2, default=0)
  private = models.BooleanField(default=False)
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  players = models.ManyToManyField(User, through='GamePlayer')
  tracker = FieldTracker(fields=['status'])

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._original_status = self.status if self.pk else None

  class Meta:
    ordering = ['-scheduled_time']

  def __str__(self):
    return f"{self.title} - {self.scheduled_time}"

  @property
  def player_count(self):
    return self.players.count()

  @property
  def is_past_due(self):
    return timezone.now() > self.scheduled_time

  def archive_if_past_due(self):
    if self.is_past_due and self.status in ['upcoming', 'in_progress']:
      print(f"Archiving game {self.id}: {self.title}")
      print(f"Current time: {timezone.now()}")
      print(f"Game start time: {self.scheduled_time}")
      self.status = 'archived'
      self.save()
      print(f"Game status updated to: {self.status}")

  @classmethod
  def update_past_due_games(cls):
    """Update status of all past due games"""
    past_due_games = cls.objects.filter(
      scheduled_time__lt=timezone.now(),
      status__in=['upcoming', 'in_progress']
    )
    for game in past_due_games:
      game.archive_if_past_due()

  def save(self, *args, **kwargs):
    is_new = self.pk is None
    status_changed = not is_new and self.status != self._original_status
    old_status = self._original_status
    
    # Regular save
    super().save(*args, **kwargs)
    
    # Update original status after save
    self._original_status = self.status
    
    # If status changed, trigger notifications
    if status_changed:
        from notifications.models import Notification
        
        if self.status == 'in_progress':
            # Game started notifications
            title = random.choice([
                'Game started!',
                'Time to win some money!'
            ])
            message = f'{self.title} is now in session'
        elif self.status in ['completed', 'archived']:
            # Game ended notifications
            title = random.choice([
                'Game over!',
                'Did you win?!'
            ])
            message = f'Report your stats for {self.title}'
        else:
            return  # Don't create notifications for other status changes
        
        # Create notifications for all players
        players = list(self.game_players.all())
        
        for game_player in players:
            Notification.objects.create(
                user=game_player.user,
                type='GAME_STARTED' if self.status == 'in_progress' else 'GAME_ENDED',
                title=title,
                message=message,
                game=self
            )
        
        # Special notification for host if they're not a player
        if not self.game_players.filter(user=self.host).exists():
            Notification.objects.create(
                user=self.host,
                type='GAME_STARTED' if self.status == 'in_progress' else 'GAME_ENDED',
                title=title,
                message=message,
                game=self
            )

    # If this is a new game, add the host as a player
    if is_new and self.host:
        GamePlayer.objects.get_or_create(
            game=self,
            user=self.host,
            defaults={'is_admin': True}
        )

  def is_hosted_by(self, user):
    """Check if game is hosted by user using clerk_id"""
    return hasattr(user, 'profile') and self.host.profile.clerk_id == user.profile.clerk_id

  def create_game_notification(self, type, title, message):
    from notifications.models import Notification
    
    # Create notification for all players
    for player in self.game_players.all():
        Notification.objects.create(
            user=player.user,
            type=type,
            title=title,
            message=message,
            game=self
        )

  def start_game(self):
    self.status = 'in_progress'
    self.save()
    self.create_game_notification(
        'GAME_STARTED',
        'Game Started',
        f'Your game "{self.title}" has started!'
    )

  def end_game(self):
    self.status = 'completed'
    self.save()
    self.create_game_notification(
        'GAME_ENDED',
        'Game Ended',
        f'Your game "{self.title}" has ended!'
    )

  def can_user_join(self, user):
    # If game is public, anyone can join
    if not self.private:
        return True
            
    # If user is host, they can join
    if self.host == user:
        return True
            
    # Check if user is friends with host
    friendship = Friendship.objects.filter(
        (Q(user1=self.host, user2=user) | Q(user1=user, user2=self.host)),
        status='accepted'
    ).exists()
        
    return friendship

class GamePlayer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='joined_games')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='game_players')
    is_admin = models.BooleanField(default=False)
    is_host = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('game', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.game.title}"

class GameStats(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='player_stats')
    player = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='game_stats')
    buy_in = models.DecimalField(max_digits=10, decimal_places=2)
    cash_out = models.DecimalField(max_digits=10, decimal_places=2)
    hours_played = models.DecimalField(max_digits=4, decimal_places=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('game', 'player')
        ordering = ['-created_at']

    @property
    def net_profit(self):
        return self.cash_out - self.buy_in

    @property
    def roi(self):
        if self.buy_in == 0:
            return 0
        return (self.net_profit / self.buy_in) * 100

    @property
    def hourly_rate(self):
        if self.hours_played == 0:
            return 0
        return self.net_profit / self.hours_played

    @classmethod
    def get_user_stats(cls, user):
        print(f"\n=== Calculating Stats for {user.username} ===")
        stats = cls.objects.filter(player=user)
        print(f"Found {stats.count()} game stats")
        
        total_games = stats.count()
        if total_games == 0:
            print("No games found, returning zeros")
            return {
                'total_games': 0,
                'total_profit': 0,
                'avg_profit_per_game': 0,
                'total_hours': 0,
                'avg_hourly_rate': 0,
                'roi': 0,
                'biggest_win': 0,
                'biggest_loss': 0
            }

        total_profit = sum((stat.cash_out - stat.buy_in) for stat in stats)
        total_hours = sum(stat.hours_played for stat in stats)
        total_buyin = sum(stat.buy_in for stat in stats)
        
        # Calculate biggest win and loss
        profits = [(stat.cash_out - stat.buy_in) for stat in stats]
        biggest_win = max(profits) if profits else 0
        # Only count negative values for biggest loss
        losses = [p for p in profits if p < 0]
        biggest_loss = min(losses) if losses else 0
        
        print(f"Biggest win: ${biggest_win}")
        print(f"Biggest loss: ${biggest_loss}")
        
        print(f"Stats calculated:")
        print(f"- Total games: {total_games}")
        print(f"- Total profit: ${total_profit}")
        print(f"- Total hours: {total_hours}")
        print(f"- ROI: {(total_profit / total_buyin * 100) if total_buyin > 0 else 0}%")
        
        # Add historical data
        # Get stats for last 6 months
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        monthly_stats = []
        
        for month in range(6):
            start_date = six_months_ago + timezone.timedelta(days=30 * month)
            end_date = start_date + timezone.timedelta(days=30)
            
            month_stats = cls.objects.filter(
                player=user,
                game__scheduled_time__gte=start_date,
                game__scheduled_time__lt=end_date
            )
            
            if month_stats.exists():
                profit = sum((stat.cash_out - stat.buy_in) for stat in month_stats)
                hours = sum(stat.hours_played for stat in month_stats)
                games = month_stats.count()
                
                monthly_stats.append({
                    'month': start_date.strftime('%b'),
                    'profit': float(profit),
                    'hours': float(hours),
                    'games': games,
                    'hourly_rate': float(profit / hours) if hours > 0 else 0
                })
            else:
                monthly_stats.append({
                    'month': start_date.strftime('%b'),
                    'profit': 0,
                    'hours': 0,
                    'games': 0,
                    'hourly_rate': 0
                })

        return {
            'total_games': total_games,
            'total_profit': total_profit,
            'avg_profit_per_game': total_profit / total_games,
            'total_hours': total_hours,
            'avg_hourly_rate': total_profit / total_hours if total_hours > 0 else 0,
            'roi': (total_profit / total_buyin * 100) if total_buyin > 0 else 0,
            'biggest_win': biggest_win,
            'biggest_loss': biggest_loss,
            'total_buyin': total_buyin,
            'historical_data': monthly_stats
        }

class Player(models.Model):
    # ... existing Player model code ...
    pass

class Friendship(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships_initiated')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships_received')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined')
    ], default='pending')

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"{self.user1.username} - {self.user2.username} ({self.status})"

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'followed')

    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"