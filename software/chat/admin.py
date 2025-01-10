from django.contrib import admin
from .models import Chat, ChatMember, Message

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'game', 'created_at', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('game__title',)

@admin.register(ChatMember)
class ChatMemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'user', 'joined_at', 'last_read')
    list_filter = ('joined_at',)
    search_fields = ('user__username',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender', 'content', 'created_at', 'is_system_message')
    list_filter = ('is_system_message', 'created_at')
    search_fields = ('content', 'sender__username')
