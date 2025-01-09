import uuid
from users.models import Profile
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.models import User

class Game(models.Model):
  title = models.CharField(max_length=255, default="Great Game, Good Fun")

  host = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
  slots = models.IntegerField(default=5)
  players = models.ManyToManyField(User, related_name='joined_games', blank=True)
  #players = models.ManyToManyField(Player, through='GamePlayer', blank=True)

  private = models.BooleanField(default=False)
  description = models.TextField(default='Have fun with me!')
  
  #Optional buy-in and reserved money can be 0
  buy_in = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
  blinds = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

  # Date and time the game starts was created
  time_start = models.TimeField(null=True, default=timezone.now().time())  # Now's time only
  date_start = models.DateField(null=True, default=timezone.now().date())  # Now's date only
  time_created = models.DateTimeField(null=True, default=timezone.now())
  
  # Unique identifier for the game, generated on save
  unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

  def __str__(self):
    return f"{self.title} | Hosted by: {self.host.first_name if self.host else 'Unknown'} | Starts at: {self.time_start} | Game ID: {self.unique_id}"
  
  '''def save(self, *args, **kwargs):
    if self.host:  # Check if self.host exists before accessing its pk
      if self.host not in self.players.all():
        self.players.add(self.host)
    super().save(*args, **kwargs)'''

  def get_absolute_url(self):
    return reverse('game-list')
    #return reverse('game-details', args=(str(self.id)) )
  
'''class Apple(models.Model):
  name = models.CharField(max_length=100)
  color = models.CharField(max_length=100)
  photo_url = models.URLField()

  def __str__(self):
    return self.name'''