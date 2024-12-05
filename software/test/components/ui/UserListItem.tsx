import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserListItemProps {
  user: {
    username: string;
    imageUrl: string;
    status?: string;
    mutualFriends?: number;
  };
  isFriend?: boolean;
  onPress: () => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  isFriend,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
      <View style={styles.content}>
        <Text style={styles.username}>{user.username}</Text>
        {isFriend ? (
          <Text style={styles.status}>
            {user.status === 'Online' ? ' Online' : '⚫ Offline'}
          </Text>
        ) : (
          <Text style={styles.mutualFriends}>
            {user.mutualFriends} mutual friends
          </Text>
        )}
      </View>
      <Ionicons 
        name={isFriend ? "chevron-forward" : "person-add"} 
        size={24} 
        color="#BB86FC" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  status: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  mutualFriends: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
}); 