from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Generate a special clerk_id for superusers
        clerk_id = f"superuser_{instance.id}" if instance.is_superuser else None
        
        # Only create profile if we have a clerk_id or it's a superuser
        if clerk_id:
            Profile.objects.create(
                user=instance,
                clerk_id=clerk_id,
                bio="Admin account"
            )

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        # Generate a special clerk_id for superusers
        clerk_id = f"superuser_{instance.id}" if instance.is_superuser else None
        
        if clerk_id:
            Profile.objects.create(
                user=instance,
                clerk_id=clerk_id,
                bio="Admin account"
            )
    elif instance.profile:
        instance.profile.save() 