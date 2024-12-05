import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface GameCardProps {
  hostName: string;
  hostImage: string;
  dateTime: string;
  buyIn: number;
  joinedPlayers: number;
  totalSpots: number;
  onPress: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  hostName,
  hostImage,
  dateTime,
  buyIn,
  joinedPlayers,
  totalSpots,
  onPress,
}) => {
  const progressPercentage = (joinedPlayers / totalSpots) * 100;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.topSection}>
        <View style={styles.hostSection}>
          <Image source={{ uri: hostImage }} style={styles.hostImage} />
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>{hostName}</Text>
            <Text style={styles.dateTime}>{dateTime}</Text>
          </View>
        </View>
        <View style={styles.buyInSection}>
          <Text style={styles.buyInAmount}>${buyIn}</Text>
          <Ionicons name="chevron-forward" size={20} color="#BB86FC" />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <LinearGradient
            colors={['#9702E7', '#E14949']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {joinedPlayers}/{totalSpots} spots filled
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  hostInfo: {
    justifyContent: 'center',
  },
  hostName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  buyInSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyInAmount: {
    color: '#BB86FC',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  progressContainer: {
    gap: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
}); 