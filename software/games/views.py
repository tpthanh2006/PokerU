from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic import ListView, DetailView, CreateView
from .models import Game
from django.contrib.auth.decorators import login_required
#from .models import Apple
#from .serializers import serialize_apples

from .models import Game
class HomeView(ListView):
  model = Game
  template_name = "game_list.html"

class GameDetailView(DetailView):
  model = Game
  template_name = "game_details.html"

@login_required
def join_game(request, game_id):
  try:
    game = Game.objects.get(pk=game_id)
  except Game.DoesNotExist:
    return render(request, 'error.html', {'message': 'Game not found.'})
  
  if request.user in game.players.all():
    return render(request, 'error.html', {'message': 'You are already in this game.'})

  if game.players.count() >= game.slots:
    return render(request, 'error.html', {'message': 'Game is full.'})

  game.players.add(request.user)
  game.save()

  return redirect('game-details', game_id)

class AddGameView(CreateView):
  model = Game
  #fields = '__all__'
  fields = ('title',
            'host',
            'slots',
            'private',
            'time_start',
            'buy_in',
            'blinds',
            'amount_reserved', 'description') 
  template_name = "add_game.html"

'''def home_games(request):
  #return render(request, 'games.html', {})

  def apple_list(request):
  apples = Apple.objects.all()
  return JsonResponse(serialize_apples(apples), safe=False)'''