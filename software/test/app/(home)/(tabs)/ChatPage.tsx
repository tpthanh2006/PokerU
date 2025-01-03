import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { ChatPreview } from '../../../components/ui/ChatPreview';
import { router } from 'expo-router';

const DIRECT_CHATS = [
  {
    id: '1',
    title: 'John Doe',
    lastMessage: 'See you at the game tonight!',
    time: '2m ago',
    image: 'https://i.pravatar.cc/150?img=1',
    unreadCount: 2,
  },
  {
    id: '2',
    title: 'Jane Smith',
    lastMessage: 'Great game yesterday!',
    time: '1h ago',
    image: 'https://i.pravatar.cc/150?img=2',
  },
];

const GAME_CHATS = [
  {
    id: 'g1',
    title: 'Friday Night Poker',
    lastMessage: 'Mike: Looking forward to it!',
    time: '5m ago',
    image: 'https://i.pravatar.cc/150?img=3',
    unreadCount: 5,
    isGameChat: true,
  },
  {
    id: 'g2',
    title: 'Weekend Tournament',
    lastMessage: 'Sarah: What time does it start?',
    time: '30m ago',
    image: 'https://i.pravatar.cc/150?img=4',
    isGameChat: true,
  },
];

export default function ChatPage(): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleChatPress = (chatId: string) => {
    router.push({
      pathname: "/(home)/(screens)/ChatScreen",
      params: { id: chatId }
    });
  };

  const displayedChats = selectedIndex === 0 ? DIRECT_CHATS : GAME_CHATS;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9702E7', '#E14949']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>
            {selectedIndex === 0 
              ? 'Chat with other players'
              : 'Game group chats'
            }
          </Text>
        </View>
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
        {displayedChats.map((chat) => (
          <ChatPreview
            key={chat.id}
            {...chat}
            onPress={handleChatPress}
          />
        ))}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
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
});
