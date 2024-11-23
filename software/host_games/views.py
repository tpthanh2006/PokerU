from django.shortcuts import render
from django.http import JsonResponse
#from .models import Apple
#from .serializers import serialize_apples

def host_games(request):
  return render(request, 'games.html', {})

'''def apple_list(request):
  apples = Apple.objects.all()
  return JsonResponse(serialize_apples(apples), safe=False)'''