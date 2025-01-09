from django.shortcuts import render
from django.views import generic
from django.urls import reverse_lazy
from .forms import SignUpForm
from django.contrib.auth.forms import UserChangeForm

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