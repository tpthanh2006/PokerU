from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from users.models import ClerkUser
from games.models import Game
from .models import Notification

@shared_task
def check_inactive_users():
    # Find users inactive for 24+ hours
    yesterday = timezone.now() - timedelta(days=1)
    inactive_users = ClerkUser.objects.filter(last_login__lt=yesterday)
    
    # Check for new games since their last login
    for user in inactive_users:
        new_games = Game.objects.filter(
            created_at__gt=user.last_login,
            status='upcoming'
        ).count()
        
        if new_games > 0:
            Notification.objects.create(
                user=user,
                type='NEW_GAMES',
                title='New Games Available',
                message=f'There are {new_games} new games since your last visit!'
            ) 