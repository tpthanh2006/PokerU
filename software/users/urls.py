from django.urls import path
from .views import UserRegisterView, UserEditView, ProfileView, sync_profile_view

urlpatterns = [
  path('register/', UserRegisterView.as_view(), name='register'),
  path('edit_profile/', UserEditView.as_view(), name='edit-profile'),
  path('profile/', ProfileView.as_view(), name='profile'),
  path('sync_profile/', sync_profile_view, name='sync-profile'),
]