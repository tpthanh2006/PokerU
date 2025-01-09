from django.db import models
from django.contrib.auth.models import User

# Create your models here.
CAMPUS_CHOICES = (
  ('Tulane University', 'Tulane University'),
)

GENDER_CHOICES = (
  (1, 'Male'),
  (2, 'Female'),
  (3, 'Non-binary'),
  (4, 'Prefer not to say'),
)

class Profile(models.Model):
  user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)
  campus = models.CharField(choices=CAMPUS_CHOICES, max_length=255, blank=False)
  bio = models.TextField(blank=True)
  phone = models.CharField(max_length=10, blank=True)
  age = models.PositiveIntegerField(blank=True, null=True)
  gender = models.IntegerField(choices=GENDER_CHOICES, default=1)

  def __str__(self):
    return str(self.user)