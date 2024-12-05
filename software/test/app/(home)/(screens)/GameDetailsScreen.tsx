import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../../components/ui/GradientButton';

// This would come from your API/database in reality
const GAME_DETAILS = {
  '1': {
    id: '1',
    hostName: 'John Doe',
    hostImage: 'https://i.pravatar.cc/150?img=1',
    dateTime: 'Today, 8:00 PM',
    buyIn: 100,
    joinedPlayers: 6,
    totalSpots: 9,
    description: 'Weekly poker night! All skill levels welcome. Friendly atmosphere with snacks and drinks provided. Tournament style with rebuys available for the first hour.',
    location: '123 Poker Street, Card City',
  },
  '2': {
    id: '2',
    hostName: 'Jane Smith',
    hostImage: 'https://i.pravatar.cc/150?img=2',
    dateTime: 'Tomorrow, 7:30 PM',
    buyIn: 250,
    joinedPlayers: 4,
    totalSpots: 8,
    description: 'High stakes game for experienced players. Professional dealer, secure venue, complimentary refreshments. No rebuys.',
    location: '456 Casino Ave, Poker Valley',
  },
  '3': {
    id: '3',
    hostName: 'Mike Johnson',
    hostImage: 'https://i.pravatar.cc/150?img=3',
    dateTime: 'Sat, 9:00 PM',
    buyIn: 500,
    joinedPlayers: 2,
    totalSpots: 6,
    description: 'Monthly tournament series qualifier. Winner gets entry into the championship round. Serious players only.',
    location: '789 Tournament Blvd, Poker City',
  },
  '4': {
    id: '4',
    hostName: 'Sarah Wilson',
    hostImage: 'https://i.pravatar.cc/150?img=4',
    dateTime: 'Fri, 6:00 PM',
    buyIn: 200,
    joinedPlayers: 3,
    totalSpots: 6,
    description: 'Friendly home game with regular players. Casual atmosphere, perfect for intermediate players looking for consistent games.',
    location: '321 Home Game Lane, Card Town',
  },
};

interface InfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value }) => (
  <View style={styles.infoCard}>
    <Ionicons name={icon} size={24} color="#BB86FC" />
    <View style={styles.infoCardText}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardValue}>{value}</Text>
    </View>
  </View>
);

export default function GameDetailsScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams();
  const game = GAME_DETAILS[id as keyof typeof GAME_DETAILS];
  
  if (!game) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Game not found</Text>
      </View>
    );
  }

  const progressPercentage = (game.joinedPlayers / game.totalSpots) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9702E7', '#E14949']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Image
            source={{ uri: game.hostImage }}
            style={styles.hostImage}
          />
          <Text style={styles.hostName}>{game.hostName}</Text>
          <Text style={styles.hostSubtitle}>Game Host</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.infoRow}>
          <InfoCard
            icon="calendar"
            title="Date & Time"
            value={game.dateTime}
          />
          <InfoCard
            icon="cash"
            title="Buy In"
            value={`$${game.buyIn}`}
          />
        </View>

        <View style={styles.capacityCard}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityTitle}>Capacity</Text>
            <Text style={styles.capacityValue}>
              {game.joinedPlayers}/{game.totalSpots} spots filled
            </Text>
          </View>
          <View style={styles.progressBackground}>
            <LinearGradient
              colors={['#9702E7', '#E14949']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${progressPercentage}%` }]}
            />
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>About This Game</Text>
          <Text style={styles.descriptionText}>{game.description}</Text>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>Location</Text>
          <Text style={styles.locationText}>{game.location}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton 
          text={`Join Game ($${game.buyIn})`}
          onPress={() => console.log('Join game:', id)}
        />
      </View>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  hostImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 12,
  },
  hostName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hostSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  infoCardValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  capacityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  capacityTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  capacityValue: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
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
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  descriptionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  locationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
}); 