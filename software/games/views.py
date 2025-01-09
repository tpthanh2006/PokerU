from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView, CreateView
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

class AddGameView(CreateView):
  model = Game
  #fields = '__all__'
  fields = ('title',
            'host',
            'slots',
            'private',
            'time_start',
            'date_start',
            'buy_in',
            'blinds',
            'description') 
  template_name = "add_game.html"

@login_required
def join_game(request, pk):
  try:
    game = Game.objects.get(id=pk)
  except Game.DoesNotExist:
    return render(request, 'error.html', {'message': 'Game not found.'})

  if game.players.count() >= game.slots:
    return render(request, 'error.html', {'message': 'Game is full.'})
  
  context = {'game' : game}
  if request.user not in game.players.all():
    game.players.add(request.user)

  game.save()
  #return render(request, 'join_game.html', context)
  return redirect('game-details', pk=game.pk)

'''def home_games(request):
  #return render(request, 'games.html', {})

  def apple_list(request):
  apples = Apple.objects.all()
  return JsonResponse(serialize_apples(apples), safe=False)'''