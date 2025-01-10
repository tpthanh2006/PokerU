from celery import shared_task
from .models import Game

@shared_task
def update_game_statuses():
    """
    Periodic task to update game statuses
    """
    Game.update_past_due_games() 