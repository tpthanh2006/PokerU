from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    poker_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['id', 'bio', 'phone', 'address', 'age', 'profile_image_url', 'poker_stats']
        
    def get_poker_stats(self, obj):
        return obj.get_poker_stats()

class UserSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_image_url']
        
    def get_profile_image_url(self, obj):
        # Try to get image from Profile first
        try:
            if obj.profile and obj.profile.profile_image_url:
                return obj.profile.profile_image_url
        except:
            pass
            
        # Try to get image from ClerkUser as fallback
        try:
            if obj.clerkuser and obj.clerkuser.profile_image_url:
                return obj.clerkuser.profile_image_url
        except:
            pass
            
        return None 