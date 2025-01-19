import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Keyboard,
  KeyboardEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../../components/ui/ChatMessage';
import { chatService, Chat, Message } from '../../../services/chatService';
import { api } from '../../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { getGameAvatar } from '../../../utils/gameAvatars';
import { GameAvatar } from '../../../components/ui/GameAvatar';

interface FormattedMessage {
  id: number;
  message: string;
  time: string;
  isMe: boolean;
  senderName: string;
  senderImage?: string;
  senderId: string;
  isGameChat: boolean;
}

interface SystemMessage {
  id: number;
  content: string;
  timestamp: string;
}

interface Chat {
  id: number;
  game: number;
  game_title: string;
  title?: string;
  is_active: boolean;
  created_at: string;
  messages: Message[];
  members: any[];
  unread_count: number;
}

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const { id, gameId } = useLocalSearchParams();
  const [chat, setChat] = useState<Chat | null>(null);
  const [formattedMessages, setFormattedMessages] = useState<(FormattedMessage | SystemMessage)[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const formatMessages = useCallback(async (messages: Message[]) => {
    try {
      const currentUserId = await api.getCurrentUserId();
      console.log('[ChatScreen] Formatting messages with current user ID:', currentUserId);
      
      return messages.map(msg => {
        if (msg.is_system_message) {
          return {
            id: msg.id,
            content: msg.content,
            timestamp: formatTime(new Date(msg.created_at))
          };
        }

        // Use the is_from_me flag from the backend, just like is_hosted_by_me in games
        const isCurrentUser = msg.is_from_me;
        
        console.log('[ChatScreen] Message:', {
          messageId: msg.id,
          senderUsername: msg.sender.username,
          isFromMe: msg.is_from_me,
          content: msg.content
        });

        return {
          id: msg.id,
          message: msg.content,
          time: formatTime(new Date(msg.created_at)),
          isMe: isCurrentUser,
          senderName: msg.sender.username || 'Unknown User',
          senderImage: msg.sender.profile_image_url || 
            'https://ui-avatars.com/api/?name=' + encodeURIComponent(msg.sender.username),
          senderId: String(msg.sender.id),
          isGameChat: true
        };
      });
    } catch (error) {
      console.error('[ChatScreen] Error formatting messages:', error);
      return messages.map(msg => ({
        id: msg.id,
        content: msg.content || msg.message,
        timestamp: formatTime(new Date(msg.created_at))
      }));
    }
  }, []);

  // Update formatted messages whenever chat messages change
  useEffect(() => {
    if (chat?.messages) {
      formatMessages(chat.messages).then(setFormattedMessages);
    }
  }, [chat?.messages, formatMessages]);

  const loadChat = async () => {
    try {
      setError(null);
      setLoading(true);
      const chatData = await chatService.getGameChat(Number(gameId));
      console.log('[ChatScreen] Loaded chat data:', {
        id: chatData.id,
        title: chatData.game_title,
        gameId: chatData.game
      });
      setChat({
        ...chatData,
        title: chatData.game_title
      });
      await chatService.markAsRead(chatData.id);
    } catch (error) {
      console.error('Error loading chat:', error);
      setError('Failed to load chat. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Mark messages as read when entering and leaving the screen
  useFocusEffect(
    useCallback(() => {
      // When screen comes into focus, load chat and mark as read
      loadChat();

      // Return cleanup function that runs when screen loses focus
      return () => {
        if (chat?.id) {
          console.log('[ChatScreen] Marking messages as read on exit');
          chatService.markAsRead(chat.id).catch(error => {
            console.error('[ChatScreen] Error marking messages as read:', error);
          });
        }
      };
    }, [chat?.id])
  );

  const handleSend = async () => {
    if (message.trim() && chat) {
      try {
        const newMessage = await chatService.sendMessage(chat.id, message.trim());
        setChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, newMessage]
        } : null);
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        // Show error to user
      }
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Add keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  if (!chat) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Chat not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#9702E7', '#E14949']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <GameAvatar title={chat?.title || 'Chat'} size={40} />
                <Text style={styles.headerTitle}>{chat?.title || 'Chat'}</Text>
              </View>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <View style={[
        styles.contentContainer,
        { transform: [{ translateY: -keyboardHeight }] }
      ]}>
        <View style={styles.chatContainer}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContent,
              { flexGrow: 1, justifyContent: 'flex-end' }
            ]}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#BB86FC" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              formattedMessages.map((msg) => (
                'content' in msg ? (
                  <View key={msg.id} style={styles.systemMessageContainer}>
                    <Text style={styles.systemMessageText}>{msg.content}</Text>
                    <Text style={styles.systemMessageTime}>{msg.timestamp}</Text>
                  </View>
                ) : (
                  <ChatMessage
                    key={msg.id}
                    message={msg.message}
                    time={msg.time}
                    isMe={msg.isMe}
                    senderName={msg.senderName}
                    senderImage={msg.senderImage}
                    senderId={msg.senderId}
                    isGameChat={msg.isGameChat}
                  />
                )
              ))
            )}
          </ScrollView>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="attach" size={24} color="white" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={1}
                maxHeight={100}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              
              <TouchableOpacity 
                style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={24} 
                  color={message.trim() ? '#BB86FC' : 'rgba(187, 134, 252, 0.5)'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#1a0325',
  },
  contentContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 110 : 90,
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  inputWrapper: {
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2a1335',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#2a1335',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    color: 'white',
    maxHeight: 100,
    minHeight: 36,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  systemMessageText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  systemMessageTime: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginTop: 4,
  },
}); 