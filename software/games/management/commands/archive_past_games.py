from django.core.management.base import BaseCommand
from django.utils import timezone
from games.models import Game

class Command(BaseCommand):
    help = 'Archives games that have passed their start time'

    def handle(self, *args, **options):
        past_games = Game.objects.filter(
            time_start__lt=timezone.now(),
            status='upcoming'
        )
        
        count = past_games.count()
        past_games.update(status='archived')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully archived {count} past games')
        ) 