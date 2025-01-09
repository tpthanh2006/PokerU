import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../../components/ui/ChatMessage';

// Add dummy messages to chat details
const CHAT_DETAILS = {
  '1': {
    id: '1',
    title: 'John Doe',
    image: 'https://i.pravatar.cc/150?img=1',
    isGameChat: false,
    userId: 'user1',
    messages: [
      { id: 1, message: "Hey, are you joining tonight's game?", time: '2:30 PM', isMe: false },
      { id: 2, message: "Yes, I'll be there! What time does it start?", time: '2:31 PM', isMe: true },
      { id: 3, message: "8 PM sharp. Don't be late!", time: '2:31 PM', isMe: false },
    ],
  },
  'g1': {
    id: 'g1',
    title: 'Friday Night Poker',
    image: 'https://i.pravatar.cc/150?img=3',
    isGameChat: true,
    messages: [
      { 
        id: 1, 
        message: "Looking forward to tonight's game!", 
        time: '2:30 PM', 
        isMe: false,
        senderName: 'Mike Johnson',
        senderImage: 'https://i.pravatar.cc/150?img=3',
        senderId: 'user3',
      },
      { 
        id: 2, 
        message: "Same here! Who's bringing snacks?", 
        time: '2:31 PM', 
        isMe: true,
      },
      { 
        id: 3, 
        message: "I'll bring chips and drinks", 
        time: '2:32 PM', 
        isMe: false,
        senderName: 'Sarah Wilson',
        senderImage: 'https://i.pravatar.cc/150?img=4',
        senderId: 'user4',
      },
    ],
  },
  // ... other chats
};

// First, let's create a type for our messages
interface ChatMessage {
  id: number;
  message: string;
  time: string;
  isMe: boolean;
  senderName?: string;
  senderImage?: string;
  senderId?: string;
}

interface ChatDetails {
  id: string;
  title: string;
  image: string;
  isGameChat: boolean;
  userId?: string;
  messages: ChatMessage[];
}

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [chatDetails, setChatDetails] = useState<ChatDetails>(
    CHAT_DETAILS[id as keyof typeof CHAT_DETAILS]
  );
  const [message, setMessage] = useState('');
  const scrollViewRef = React.useRef<ScrollView>(null);

  if (!chatDetails) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Chat not found</Text>
      </View>
    );
  }

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now(), // Use timestamp as temporary ID
        message: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      };

      setChatDetails(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      setMessage('');
      
      // In the future, you would send the message to your backend here
      console.log('Sending message:', message);
    }
  };

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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              {!chatDetails.isGameChat && (
                <TouchableOpacity 
                  onPress={() => chatDetails.userId && router.push(`/(home)/(screens)/UserProfileScreen?id=${chatDetails.userId}`)}
                >
                  <Image
                    source={{ uri: chatDetails.image }}
                    style={styles.headerImage}
                  />
                </TouchableOpacity>
              )}
              <Text style={styles.headerTitle}>{chatDetails.title}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        >
          {chatDetails.messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg.message}
              time={msg.time}
              isMe={msg.isMe}
              senderName={msg.senderName}
              senderImage={msg.senderImage}
              senderId={msg.senderId}
              isGameChat={chatDetails.isGameChat}
            />
          ))}
        </ScrollView>

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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a1335',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
}); 