from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Chat, ChatMember, Message
from .serializers import ChatSerializer, MessageSerializer
from django.shortcuts import get_object_or_404
from games.models import Game

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return only chats that the user is a member of
        return Chat.objects.filter(members__user=self.request.user)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        chat = self.get_object()
        if not chat.members.filter(user=request.user).exists():
            return Response(
                {"error": "You are not a member of this chat"},
                status=status.HTTP_403_FORBIDDEN
            )

        content = request.data.get('content')
        if not content:
            return Response(
                {"error": "Message content is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        message = chat.add_message(
            sender=request.user,
            content=content
        )
        
        serializer = MessageSerializer(message, context={'request': request})
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        chat = self.get_object()
        member = get_object_or_404(ChatMember, chat=chat, user=request.user)
        member.mark_as_read()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        if not chat.members.filter(user=request.user).exists():
            return Response(
                {"error": "You are not a member of this chat"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        messages = chat.messages.all()
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = MessageSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def game_chat(self, request):
        game_id = request.query_params.get('game_id')
        if not game_id:
            return Response(
                {"error": "game_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            game = Game.objects.get(id=game_id)
            chat = Chat.objects.get(game=game)
            
            if not chat.members.filter(user=request.user).exists():
                return Response(
                    {"error": "You are not a member of this chat"},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = self.get_serializer(chat)
            return Response(serializer.data)
        except Game.DoesNotExist:
            return Response(
                {"error": f"Game with id {game_id} does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Chat.DoesNotExist:
            return Response(
                {"error": f"Chat for game {game_id} does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
