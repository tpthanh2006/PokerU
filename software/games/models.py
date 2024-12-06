import uuid
from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone as django_timezone

class Profile(models.Model):
  user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)
  bio = models.TextField(blank=True)
  phone = models.CharField(max_length=10, blank=True)
  address = models.CharField(max_length=1024)
  age = models.PositiveIntegerField(blank=True, null=True)
  #gender = models.IntegerField(choices=GENDER_CHOICES, default=1)

  def __str__(self):
    return str(self.user)

class Game(models.Model):
  title = models.CharField(max_length=255, default="Great Game, Good Fun")
  host = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
  slots = models.DecimalField(max_digits=2, decimal_places=0, default=5)
  players = models.ManyToManyField(User, related_name='joined_games', blank=True)
  description = models.TextField(default='Have fun with me!')
  private = models.BooleanField(default=False)

  #Optional buy-in and reserved money can be 0
  buy_in = models.DecimalField(max_digits=10, decimal_places=0, default=0)
  blinds = models.DecimalField(max_digits=10, decimal_places=0, default=0)
  amount_reserved = models.DecimalField(max_digits=10, decimal_places=0, default=0)

  # Date and time the game starts was created
  time_start = models.DateTimeField(blank=False)  # Changed to None
  time_created = models.DateField(null=True, default=django_timezone.now) # Automatically set on creation
  #time_end = models.DateTimeField(null=True, blank=True)  # Optional field
  
  # Unique identifier for the game, generated on save
  game_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

  def __str__(self):
    return f"{self.title} | Hosted by: {self.host.first_name if self.host else 'Unknown'} | Starts at: {self.time_start} | Game ID: {self.game_id}"  # Improved string representation
  
  def get_absolute_url(self):
    return reverse('game-list')
    #return reverse('game-details', args=(str(self.id)) )
  

'''class Apple(models.Model):
  name = models.CharField(max_length=100)
  color = models.CharField(max_length=100)
  photo_url = models.URLField()

  def __str__(self):
    return self.name'''