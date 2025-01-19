import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface NotificationBannerProps {
  gameId: string;
  gameTitle: string;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  gameId,
  gameTitle,
  onDismiss,
}) => {
  const handlePress = () => {
    router.push(`/(home)/(screens)/ArchivedGameDetailsScreen?id=${gameId}`);
    onDismiss();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <Ionicons name="stats-chart" size={24} color="#BB86FC" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Game Ended</Text>
          <Text style={styles.message}>
            Submit your stats for "{gameTitle}"
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 3, 37, 0.95)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#BB86FC',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: 'white',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
}); 