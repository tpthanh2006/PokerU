from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q

class FriendRequest(models.Model):
    sender = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('declined', 'Declined')
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"

    @classmethod
    def are_friends(cls, user1, user2):
        return cls.objects.filter(
            (Q(sender=user1, receiver=user2) | Q(sender=user2, receiver=user1)),
            status='accepted'
        ).exists()