# Convert complex data to native Python data (which are then easily renderd into JSON)
from rest_framework import serializers
from . models import *

class ReactSerializer(serializers.ModelSerializer):
  class Meta:
    model = React
    fields = ['employee', 'department']