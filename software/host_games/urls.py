from django.urls import path
from . import views

urlpatterns = [
    path('', views.host_games),
    #path('', views.apple_list),
]
