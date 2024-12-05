import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'friend_request' | 'game_invite' | 'achievement';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const NotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'John Doe sent you a friend request',
      time: '2m ago',
      read: false,
    },
    {
      id: '2',
      type: 'game_invite',
      title: 'Game Invitation',
      message: 'Sarah invited you to join Friday Night Poker',
      time: '15m ago',
      read: false,
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: 'You won 5 games in a row!',
      time: '1h ago',
      read: true,
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'person-add';
      case 'game_invite':
        return 'game-controller';
      case 'achievement':
        return 'trophy';
      default:
        return 'notifications';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id 
          ? { ...n, read: true }
          : n
      )
    );

    // Handle navigation
    switch (notification.type) {
      case 'friend_request':
        router.push('/(home)/(screens)/SearchFriendsScreen');
        break;
      case 'game_invite':
        router.push('/(home)/(screens)/GameDetailsScreen?id=1');
        break;
      case 'achievement':
        router.push('/(home)/(screens)/StatisticsDetailScreen?statId=games_played');
        break;
    }
    onClose();
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const hasUnread = notifications.some(n => !n.read);

  return (
    <>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerButtons}>
            {hasUnread && (
              <TouchableOpacity 
                style={styles.markReadButton} 
                onPress={handleMarkAllAsRead}
              >
                <Text style={styles.markReadButtonText}>Mark All as Read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.notificationList}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.unreadItem
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={getIcon(notification.type)} 
                  size={24} 
                  color="#BB86FC" 
                />
              </View>
              <View style={styles.contentContainer}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  container: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: width - 40,
    maxHeight: 400,
    backgroundColor: '#1a0325',
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationList: {
    maxHeight: 332,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  unreadItem: {
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  markReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
    borderRadius: 16,
  },
  markReadButtonText: {
    color: '#BB86FC',
    fontSize: 14,
    fontWeight: '600',
  },
}); 