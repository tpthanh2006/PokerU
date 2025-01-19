import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface ChatMessageProps {
  message: string;
  time: string;
  isMe: boolean;
  senderName?: string;
  senderImage?: string;
  senderId?: string;
  isGameChat?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  time,
  isMe,
  senderName,
  senderImage,
  senderId,
  isGameChat,
}) => {
  const handleProfilePress = () => {
    if (!isMe && senderId) {
      router.push(`/(home)/(screens)/UserProfileScreen?id=${senderId}`);
    }
  };

  return (
    <View style={[
      styles.container,
      isMe ? styles.myMessageContainer : styles.otherMessageContainer
    ]}>
      {!isMe && isGameChat && (
        <TouchableOpacity onPress={handleProfilePress}>
          <Image 
            source={{ uri: senderImage }} 
            style={styles.avatar}
          />
        </TouchableOpacity>
      )}
      <View style={[
        styles.messageContent,
        isMe ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMe && isGameChat && (
          <TouchableOpacity onPress={handleProfilePress}>
            <Text style={styles.senderName}>{senderName}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.messageText}>{message}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  messageContent: {
    borderRadius: 16,
    padding: 12,
  },
  myMessage: {
    backgroundColor: '#9702E7',
  },
  otherMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  senderName: {
    color: '#BB86FC',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
}); 