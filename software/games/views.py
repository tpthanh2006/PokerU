from django.shortcuts import render
from django.http import JsonResponse
from django.views.generic import ListView, DetailView, CreateView
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
            'buy_in',
            'blinds',
            'amount_reserved', 'description') 
  template_name = "add_game.html"

'''def home_games(request):
  #return render(request, 'games.html', {})

  def apple_list(request):
  apples = Apple.objects.all()
  return JsonResponse(serialize_apples(apples), safe=False)'''