from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
  title = models.CharField(max_length=255)
  author = models.ForeignKey(User, on_delete=models.CASCADE)
  #creator_id (user's key)
  
  description = models.TextField()

  #time_started (user's input in hh:mm MM/DD/YYYY)
  #time_ended (user's input in hh:mm MM/DD/YYYY)
  #time_created (user's key)

  #convo_id (randomly generated by system)

  #if_private (user's input in boolean)
  
  def __str__(self):
    return self.title + ' | ' + str(self.author) + ' | ' + self.description


'''class Apple(models.Model):
  name = models.CharField(max_length=100)
  color = models.CharField(max_length=100)
  photo_url = models.URLField()

  def __str__(self):
    return self.name'''