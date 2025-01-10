import api from './api';

export interface Message {
  id: number;
  sender: {
    id: string | number;
    username: string;
    profile_image_url?: string;
  };
  content: string;
  created_at: string;
  is_system_message: boolean;
  is_from_me: boolean;
}

export interface ChatMember {
  id: number;
  user: {
    id: string;
    username: string;
    profile_image_url?: string;
  };
  joined_at: string;
  last_read: string;
}

export interface Chat {
  id: number;
  game: number;
  created_at: string;
  is_active: boolean;
  messages: Message[];
  members: ChatMember[];
  unread_count: number;
}

export interface ChatPreviewData {
  id: string;
  title: string;
  lastMessage: string;
  time: string;
  image: string;
  unreadCount?: number;
  isGameChat: boolean;
  gameId: number;
}

class ChatService {
  async getChats(): Promise<ChatPreviewData[]> {
    try {
      console.log('[ChatService] Fetching chats...');
      const response = await api.get('chat/chats/');
      console.log('[ChatService] Chats response:', response.data);
      return response.data.map(chat => this.transformChatToPreview(chat));
    } catch (error) {
      console.error('[ChatService] Error in getChats:', error);
      throw error;
    }
  }

  async getGameChat(gameId: number): Promise<Chat> {
    try {
      console.log(`[ChatService] Fetching game chat for game ${gameId}...`);
      const response = await api.get(`chat/chats/game_chat/?game_id=${gameId}`);
      console.log('[ChatService] Game chat response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ChatService] Error fetching game chat:', error);
      throw error;
    }
  }

  async sendMessage(chatId: number, content: string): Promise<Message> {
    try {
      console.log(`[ChatService] Sending message to chat ${chatId}...`);
      const response = await api.post(`chat/chats/${chatId}/send_message/`, {
        content
      });
      console.log('[ChatService] Message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ChatService] Error sending message:', error);
      throw error;
    }
  }

  async markAsRead(chatId: number): Promise<void> {
    try {
      console.log(`[ChatService] Marking chat ${chatId} as read...`);
      await api.post(`chat/chats/${chatId}/mark_as_read/`);
      console.log('[ChatService] Chat marked as read');
    } catch (error) {
      console.error('[ChatService] Error marking chat as read:', error);
      throw error;
    }
  }

  private transformChatToPreview(chat: Chat): ChatPreviewData {
    const lastMessage = chat.messages[chat.messages.length - 1];
    const timeAgo = this.getTimeAgo(new Date(lastMessage?.created_at || chat.created_at));

    return {
      id: chat.id.toString(),
      title: chat.game_title || `Game ${chat.game}`,
      lastMessage: lastMessage ? 
        `${lastMessage.sender.username}: ${lastMessage.content}` : 
        'No messages yet',
      time: timeAgo,
      image: chat.members[0]?.user.profile_image_url || 'https://via.placeholder.com/50',
      unreadCount: chat.unread_count,
      isGameChat: true,
      gameId: chat.game
    };
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
}

export const chatService = new ChatService(); 