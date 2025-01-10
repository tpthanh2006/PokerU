from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import ClerkUser

class ClerkUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'clerk_id')
    search_fields = ('user__username', 'user__email', 'clerk_id')

admin.site.register(ClerkUser, ClerkUserAdmin)
