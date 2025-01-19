import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchGameById, removePlayer, leaveGame } from '../../../services/gameService';
import { Game } from '../(tabs)/FindGamesPage';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { InfoCard } from '../../../components/ui/InfoCard';
import GradientButton from '../../../components/ui/GradientButton';

export default function GameDashboardScreen() {
  const { id } = useLocalSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadGame = async () => {
      if (!isLoaded || !isSignedIn || !id) return;
      
      try {
        setLoading(true);
        const gameData = await fetchGameById(id.toString(), user?.id);
        console.log('Loaded game data:', {
          id: gameData.id,
          title: gameData.title,
          playerCount: gameData.playerCount,
          players: gameData.joinedPlayers
        });
        setGame(gameData);
      } catch (error) {
        console.error('Error loading game:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id, isLoaded, isSignedIn, user?.id]);

  const handleLeaveGame = async () => {
    if (!game) return;
    
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGame(game.id);
              router.back();
            } catch (error) {
              console.error('Error leaving game:', error);
              Alert.alert('Error', 'Failed to leave the game');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Game not found</Text>
      </View>
    );
  }

  const progressPercentage = (game.playerCount / game.totalSpots) * 100;

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
              <Text style={styles.headerTitle}>{game.title}</Text>
            </View>
            <View style={styles.backButtonPlaceholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.hostSection}>
          <Image 
            source={{ uri: game.hostImage }} 
            style={styles.hostImage}
          />
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>{game.hostName}</Text>
            <Text style={styles.hostLabel}>Host</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={[
            styles.statusIndicator,
            game.status === 'in_progress' && styles.statusInProgress,
            game.status === 'completed' && styles.statusCompleted,
          ]} />
          <Text style={styles.statusText}>
            {game.status === 'upcoming' ? 'Upcoming' :
             game.status === 'in_progress' ? 'In Progress' :
             'Completed'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Game Details</Text>
          
          <InfoCard
            label="Date & Time"
            value={game.dateTime}
            icon="calendar-outline"
          />

          <InfoCard
            label="Buy In"
            value={`$${game.buyIn}`}
            icon="cash-outline"
          />

          <InfoCard
            label="Players"
            value={`${game.playerCount}/${game.totalSpots}`}
            icon="people-outline"
          />

          {game.location && (
            <InfoCard
              label="Location"
              value={game.location}
              icon="location-outline"
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Players</Text>
          <View style={styles.playerGrid}>
            {game.joinedPlayers?.map((player) => (
              <View key={player.id} style={styles.playerItem}>
                <Image source={{ uri: player.image }} style={styles.playerImage} />
                <Text style={styles.playerName}>{player.name}</Text>
                {(player.isHost || player.isAdmin) && (
                  <View style={[styles.badge, player.isHost ? styles.hostBadge : styles.adminBadge]}>
                    <Text style={styles.badgeText}>
                      {player.isHost ? 'Host' : 'Admin'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {game.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.descriptionText}>{game.description}</Text>
          </View>
        )}
      </ScrollView>

      {!game.isHostedByMe && game.isPlayer && (
        <View style={styles.footer}>
          <GradientButton
            text="Exit Game"
            onPress={handleLeaveGame}
            colors={['#E14949', '#E14949']}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
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
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  hostImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hostLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  playerItem: {
    alignItems: 'center',
    width: 80,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
  },
  playerName: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  hostBadge: {
    backgroundColor: '#BB86FC',
  },
  adminBadge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  descriptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BB86FC',
  },
  statusInProgress: {
    backgroundColor: '#4CAF50',
  },
  statusCompleted: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
    width: '100%',
    backgroundColor: '#1a0325',
  },
  leaveButton: {
    marginTop: 8,
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 