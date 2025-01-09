from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'created_at', 'read')
    list_filter = ('type', 'read', 'created_at')
    search_fields = ('title', 'message') 