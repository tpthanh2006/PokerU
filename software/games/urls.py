from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.GameViewSet, basename='game')

print("\n=== Registered URLs ===")
for url in router.urls:
    print(f"- {url.name}: {url.pattern}")

urlpatterns = [
    path('', include(router.urls)),
]