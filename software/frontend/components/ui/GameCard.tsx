import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Game } from '../../app/(home)/(tabs)/FindGamesPage';

interface GameCardProps {
  game: Game;
  onPress: () => void;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Helper function to check if two dates are the same day
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  // Format the time part
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Determine the date part
  let dateStr;
  if (isSameDay(date, now)) {
    dateStr = 'Today';
  } else if (isSameDay(date, tomorrow)) {
    dateStr = 'Tomorrow';
  } else {
    dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  return `${dateStr} at ${timeStr}`;
};

export const GameCard: React.FC<GameCardProps> = ({ game, onPress }) => {
  const dateTime = formatDateTime(game.scheduled_time);

  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={['rgba(187, 134, 252, 0.1)', 'rgba(187, 134, 252, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <Image 
            source={{ uri: game.hostImage }} 
            style={styles.hostImage} 
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>{game.title}</Text>
            <Text style={styles.host}>Hosted by {game.hostName}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#BB86FC" />
              <Text style={styles.detailText}>{dateTime}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={20} color="#BB86FC" />
              <Text style={styles.detailText}>${game.buyIn}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={20} color="#BB86FC" />
              <Text style={styles.detailText}>
                {game.playerCount}/{game.totalSpots}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  host: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  details: {
    width: '100%',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(187, 134, 252, 0.2)',
  },
  detailText: {
    color: 'white',
    fontSize: 14,
  },
}); 