import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameAvatar } from './GameAvatar';

interface JoinedGameCardProps {
  id: string;
  title: string;
  hostName: string;
  hostImage: string;
  dateTime: string;
  buyIn: number;
  playerCount: number;
  totalSpots: number;
  isHostedByMe?: boolean;
  onPress: () => void;
}

export const JoinedGameCard: React.FC<JoinedGameCardProps> = ({
  title,
  hostImage,
  hostName,
  dateTime,
  buyIn,
  playerCount,
  totalSpots,
  onPress,
  isHostedByMe,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.hostInfo}>
          <GameAvatar title={title} size={60} />
          <View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.hostRow}>
              <Text style={styles.hostName}>
                {isHostedByMe ? 'Hosted by you' : `Hosted by ${hostName}`}
              </Text>
              {isHostedByMe && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>Host</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.5)" />
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#BB86FC" />
          <Text style={styles.detailText}>{dateTime}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color="#BB86FC" />
          <Text style={styles.detailText}>${buyIn}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color="#BB86FC" />
          <Text style={styles.detailText}>{playerCount}/{totalSpots}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(187, 134, 252, 0.2)',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  hostName: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostBadge: {
    backgroundColor: '#BB86FC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  hostBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 