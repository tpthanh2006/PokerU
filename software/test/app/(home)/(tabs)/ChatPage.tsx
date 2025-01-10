import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { ChatPreview } from '../../../components/ui/ChatPreview';
import { router } from 'expo-router';
import { chatService, ChatPreviewData } from '../../../services/chatService';
import { useFocusEffect } from '@react-navigation/native';
import { getGameAvatar } from '../../../utils/gameAvatars';

export default function ChatPage(): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [chats, setChats] = useState<ChatPreviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const chatData = await chatService.getChats();
      setChats(chatData);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh chats every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  const handleChatPress = (chatId: string) => {
    const selectedChat = chats.find(c => c.id === chatId);
    if (!selectedChat) return;

    router.push({
      pathname: "/(home)/(screens)/ChatScreen",
      params: { 
        id: chatId,
        gameId: selectedChat.gameId.toString()
      }
    });
  };

  // Filter chats based on selected tab
  const displayedChats = chats.filter(chat => 
    selectedIndex === 0 ? !chat.isGameChat : chat.isGameChat
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9702E7', '#E14949']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Messages</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SegmentedControl
        options={['Direct Chat', 'Game Chat']}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        containerStyle={styles.segmentedControl}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#BB86FC" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadChats}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : displayedChats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No chats available</Text>
          </View>
        ) : (
          displayedChats.map((chat) => (
            <ChatPreview
              key={chat.id}
              {...chat}
              image={getGameAvatar(chat.title)}
              onPress={handleChatPress}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  segmentedControl: {
    marginVertical: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#BB86FC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
