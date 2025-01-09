import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@clerk/clerk-expo';
import api, { setApiAuth } from '../../services/api';

const { width } = Dimensions.get('window');

interface Notification {
  id: number;
  type: 'GAME_STARTED' | 'GAME_ENDED' | 'NEW_GAMES';
  title: string;
  message: string;
  game: {
    id: number;
    title: string;
  } | null;
  created_at: string;
  read: boolean;
}

export const NotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        
        await setApiAuth(token);
        console.log('Fetching notifications...');
        const response = await api.get('notifications/');
        console.log('Notifications response:', response);
        console.log('Notifications data:', response.data);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.post(`notifications/${notificationId}/mark_read/`);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      console.log('Notification pressed:', notification);
      await markAsRead(notification.id);

      if ((notification.type === 'GAME_ENDED' || notification.type === 'GAME_STARTED') && notification.game) {
        console.log('Navigating to game:', notification.game);
        
        if (notification.type === 'GAME_ENDED') {
          router.push({
            pathname: '/(home)/(screens)/ArchivedGameDetailsScreen',
            params: { id: notification.game.id.toString() }
          });
        } else {
          router.push({
            pathname: '/(home)/(screens)/GameDetailsScreen',
            params: { id: notification.game.id.toString() }
          });
        }
      } else {
        console.warn('Game notification without valid game data:', notification);
      }
      onClose();
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

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

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all notifications as read in the backend
      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(n => api.post(`notifications/${n.id}/mark_read/`))
      );
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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
          {loading ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>No notifications</Text>
            </View>
          ) : (
            notifications.map((notification) => (
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
            ))
          )}
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
    maxHeight: 350,
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
    maxHeight: 282,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
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
  messageContainer: {
    padding: 16,
    alignItems: 'center',
  },
  messageText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
}); 