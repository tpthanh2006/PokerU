from django.shortcuts import render
from django.views import generic
from django.urls import reverse_lazy
from .forms import SignUpForm
from django.contrib.auth.forms import UserChangeForm
from .models import ClerkUser, Profile
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import ProfileSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


# Create your views here.
class UserRegisterView(generic.CreateView):
  form_class = SignUpForm
  template_name = 'registration/register.html'
  success_url = reverse_lazy('login') #sent user to login page after registration

class UserEditView(generic.UpdateView):
  form_class = UserChangeForm
  template_name = 'registration/edit_profile.html'
  success_url = reverse_lazy('game-list')

  def get_object(self):
    return self.request.user

def sync_user_profile(user, clerk_data):
    try:
        clerk_user = ClerkUser.objects.get(user=user)
        
        # Update profile image URL if provided
        if clerk_data.get('profile_image_url'):
            clerk_user.profile_image_url = clerk_data.get('profile_image_url')
            clerk_user.save()

        # Update username if changed
        if clerk_data.get('username') and user.username != clerk_data.get('username'):
            user.username = clerk_data.get('username')
            user.save()

        # Update email if provided
        if clerk_data.get('email'):
            user.email = clerk_data.get('email')
            user.save()

    except ClerkUser.DoesNotExist:
        ClerkUser.objects.create(
            user=user,
            clerk_id=clerk_data.get('id'),
            profile_image_url=clerk_data.get('profile_image_url')
        )

class ProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_profile_view(request):
    clerk_data = request.data.get('clerk_data', {})
    sync_user_profile(request.user, clerk_data)
    return Response({'status': 'success'})