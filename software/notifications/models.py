from django.db import models
from django.conf import settings
from games.models import Game

class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50)  # e.g., 'GAME_ENDED'
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name='game_notifications',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} - {self.title} for {self.user.username}" 