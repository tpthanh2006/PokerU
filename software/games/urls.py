from django.urls import path
from .views import HomeView, GameDetailView, AddGameView, join_game

urlpatterns = [
    path('', HomeView.as_view(), name = "game-list"),
    path('game/<int:pk>', GameDetailView.as_view(), name = "game-details"), #pk is a unique id automatically created by Django & assigned to each object in database
    path('add_game/', AddGameView.as_view(), name="add-game"),
    path('join_game/<int:game_id>', join_game, name = "join-game"),

    #path('', views.home_games, name = "home_games"),
    #path('', views.apple_list),
]