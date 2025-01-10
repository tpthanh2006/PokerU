from django.db import models
from django.contrib.auth.models import User
from games.models import Game, GamePlayer
from django.utils import timezone
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver

class Chat(models.Model):
    game = models.OneToOneField(
        Game, 
        on_delete=models.CASCADE,
        related_name='chat'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Chat for {self.game.title}"

    def add_message(self, sender, content, is_system_message=False):
        """Helper method to add a message to the chat"""
        return Message.objects.create(
            chat=self,
            sender=sender,
            content=content,
            is_system_message=is_system_message
        )

class ChatMember(models.Model):
    chat = models.ForeignKey(
        Chat, 
        on_delete=models.CASCADE,
        related_name='members'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='chat_memberships'
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('chat', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.chat}"

    def mark_as_read(self):
        """Mark all messages as read up to now"""
        self.last_read = timezone.now()
        self.save()

class Message(models.Model):
    chat = models.ForeignKey(
        Chat, 
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_system_message = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.username} in {self.chat}"

# Signals
@receiver(post_save, sender=GamePlayer)
def manage_chat_membership(sender, instance, created, **kwargs):
    """Add/remove players from chat when they join/leave the game"""
    if created:
        # Player joined the game
        chat, _ = Chat.objects.get_or_create(game=instance.game)
        member, member_created = ChatMember.objects.get_or_create(
            chat=chat,
            user=instance.user
        )
        if member_created:
            # Add system message only if this is a new member
            chat.add_message(
                sender=instance.user,
                content=f"{instance.user.username} joined the game",
                is_system_message=True
            )
    else:
        # Handle player leaving in pre_delete signal
        pass

@receiver(post_save, sender=Game)
def create_game_chat(sender, instance, created, **kwargs):
    """Create a chat when a game is created"""
    if created:
        chat = Chat.objects.create(game=instance)
        # Add host as first member
        ChatMember.objects.create(chat=chat, user=instance.host)
        # Add system message
        chat.add_message(
            sender=instance.host,
            content=f"Game chat created by {instance.host.username}",
            is_system_message=True
        )

@receiver(post_save, sender=Game)
def handle_game_status_change(sender, instance, **kwargs):
    """Handle game status changes"""
    if instance.tracker.has_changed('status'):
        try:
            chat = instance.chat
            if instance.status == 'completed':
                chat.add_message(
                    sender=instance.host,
                    content="Game has ended",
                    is_system_message=True
                )
                # Schedule chat deletion (we'll implement this later)
            elif instance.status == 'in_progress':
                chat.add_message(
                    sender=instance.host,
                    content="Game has started",
                    is_system_message=True
                )
        except Game.chat.RelatedObjectDoesNotExist:
            # Chat doesn't exist yet, create it
            chat = Chat.objects.create(game=instance)
            ChatMember.objects.create(chat=chat, user=instance.host)
