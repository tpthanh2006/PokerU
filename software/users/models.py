from django.db import models
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Avg, F, Max
from django.db.models.functions import Coalesce
from decimal import Decimal

class ClerkUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    clerk_id = models.CharField(max_length=200, unique=True)
    profile_image_url = models.URLField(max_length=500, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.clerk_id}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    clerk_id = models.CharField(max_length=255, unique=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    age = models.IntegerField(null=True, blank=True)
    profile_image_url = models.URLField(max_length=500, blank=True, null=True)

    def get_poker_stats(self):
        from games.models import GameStats  # Import here to avoid circular import
        
        stats = GameStats.objects.filter(player=self.user)
        
        # Calculate total stats
        total_stats = stats.aggregate(
            total_games=Count('id'),
            total_profit=Coalesce(Sum(F('cash_out') - F('buy_in')), Decimal('0')),
            total_hours=Coalesce(Sum('hours_played'), Decimal('0')),
            total_buy_in=Coalesce(Sum('buy_in'), Decimal('0')),
            total_cash_out=Coalesce(Sum('cash_out'), Decimal('0'))
        )
        
        # Calculate derived stats
        total_games = total_stats['total_games']
        total_profit = total_stats['total_profit']
        total_hours = total_stats['total_hours']
        total_buy_in = total_stats['total_buy_in']
        
        return {
            'total_games': total_games,
            'total_profit': float(total_profit),
            'total_hours': float(total_hours),
            'average_profit_per_game': float(total_profit / total_games) if total_games > 0 else 0,
            'hourly_rate': float(total_profit / total_hours) if total_hours > 0 else 0,
            'roi_percentage': float((total_profit / total_buy_in) * 100) if total_buy_in > 0 else 0,
            'biggest_win': float(stats.filter(cash_out__gt=F('buy_in')).annotate(
                profit=F('cash_out') - F('buy_in')
            ).aggregate(max_profit=Coalesce(Max('profit'), 0))['max_profit']),
            'biggest_loss': float(stats.filter(cash_out__lt=F('buy_in')).annotate(
                loss=F('buy_in') - F('cash_out')
            ).aggregate(max_loss=Coalesce(Max('loss'), 0))['max_loss']),
            'win_rate': float(stats.filter(cash_out__gt=F('buy_in')).count() / total_games * 100) if total_games > 0 else 0
        }

    def __str__(self):
        return f"{self.user.username}'s Profile"
