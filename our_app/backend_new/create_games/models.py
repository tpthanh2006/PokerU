from django.db import models

# Create your models here.

# Demo for backend & frontend integration:
class React(models.Model):
  employee = models.CharField(max_Length=30)
  department = models.CharField(max_Length=30)