from django.core.management.base import BaseCommand
from games.models import Game

class Command(BaseCommand):
    help = 'Updates the status of past due games to archived'

    def handle(self, *args, **options):
        self.stdout.write('Updating game statuses...')
        Game.update_past_due_games()
        self.stdout.write(self.style.SUCCESS('Successfully updated game statuses')) 