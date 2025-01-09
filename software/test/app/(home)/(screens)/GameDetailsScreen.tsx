import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../../components/ui/GradientButton';
import { useRouter } from 'expo-router';
import { fetchGameById, joinGame } from '../../../services/gameService';
import { Game } from '../(tabs)/FindGamesPage';
import { useAuth } from '@clerk/clerk-expo';

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
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded, isSignedIn } = useAuth();
  const [joining, setJoining] = useState(false);

  const isHostOrAdmin = () => {
    return game?.host?.id === user?.id || 
           game?.players?.some(player => 
             player.user.id === user?.id && player.is_admin
           );
  };

  useEffect(() => {
    const checkGameAccess = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      try {
        const game = await fetchGameById(id as string);

        // Log access check
        console.log('GameDetails access check:', {
          userId: user.id,
          isHost: game.isHostedByMe,
          players: game.joinedPlayers
        });

        // Remove any automatic redirects here
        // Let the user view the game details and choose to join
      } catch (error) {
        console.error('Error checking game access:', error);
      }
    };

    checkGameAccess();
  }, [id, isLoaded, isSignedIn, user]);

  useEffect(() => {
    const loadGame = async () => {
      try {
        if (!id) return;
        const gameData = await fetchGameById(id.toString());
        setGame(gameData);
      } catch (error) {
        console.error('Error loading game:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id]);

  const handleJoinGame = async () => {
    try {
      setJoining(true);
      
      // Check if user is already in the game
      const isAlreadyJoined = game?.players?.some(
        player => player.user.id === user?.id
      );
      
      if (isAlreadyJoined) {
        // If already joined, just navigate to the appropriate dashboard
        if (isHostOrAdmin()) {
          router.replace(`/(home)/(screens)/GameDashboardAdminScreen?id=${id}`);
        } else {
          router.replace(`/(home)/(screens)/GameDashboardScreen?id=${id}`);
        }
        return;
      }

      await joinGame(game?.id);
      router.replace(`/(home)/(screens)/GameDashboardScreen?id=${id}`);
    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Error', 'Failed to join game');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Loading game details...</Text>
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error || 'Game not found'}</Text>
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
              <Image
                source={{ uri: game.hostImage }}
                style={styles.hostImage}
              />
              <Text style={styles.hostName}>{game.hostName}</Text>
              <Text style={styles.hostSubtitle}>Game Host</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
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
              {game.playerCount}/{game.totalSpots} spots filled
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
          <Text style={styles.descriptionText}>{game.description || 'No description available'}</Text>
        </View>

        {game.location && (
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Location</Text>
            <Text style={styles.locationText}>{game.location}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton 
          text={game.isPlayer 
            ? 'Already Joined' 
            : game.playerCount >= game.totalSpots
            ? 'Game Full'
            : `Join Game ($${game.buyIn})`}
          onPress={handleJoinGame}
          disabled={game.isPlayer || game.playerCount >= game.totalSpots}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
}); 