import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { JoinedGameCard } from '../../../components/ui/JoinedGameCard';
import { useRouter } from 'expo-router';
import GradientButton from '../../../components/ui/GradientButton';
import { fetchGames, fetchGameById } from '../../../services/gameService';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { setApiAuth } from '../../../services/api';
import api from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { formatDateTime } from '../../../utils/dateFormatting';
import { getGameAvatar } from '../../../utils/gameAvatars';

const { width } = Dimensions.get('window');

// First, define the game type
export interface Game {
  id: string;
  title: string;
  hostName: string;
  hostImage: string | null;
  dateTime?: string;
  scheduled_time?: string;
  buyIn: number;
  totalSpots: number;
  playerCount: number;
  private: boolean;
  isHostedByMe: boolean;
  isPlayer: boolean;
  description: string;
  location: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'archived';
  startTime?: string;
  joinedPlayers: {
    id: string;
    name: string;
    image: string | null;
    isHost: boolean;
    isAdmin: boolean;
  }[];
}


export default function FindGamesPage(): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();

  const loadGames = useCallback(async () => {
    if (!user || !isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        console.error('No auth token available');
        setLoading(false);
        return;
      }
      
      await setApiAuth(token, user.id);
      const response = await fetchGames();
      
      // Transform the data to match the Game interface
      const transformedGames = response.map(game => ({
        id: String(game.id),
        title: game.title,
        hostName: game.host.username || game.host.email,
        hostImage: game.host.image_url,
        dateTime: formatDateTime(game.scheduled_time),
        buyIn: parseFloat(game.buy_in),
        totalSpots: game.slots,
        playerCount: game.player_count,
        private: game.private,
        isHostedByMe: game.is_hosted_by_me,
        isPlayer: game.is_player,
        description: game.description,
        location: game.location,
        status: game.status,
        joinedPlayers: game.players.map(player => ({
          id: String(player.id),
          name: player.username,
          image: player.image_url,
          isHost: player.is_host,
          isAdmin: player.is_admin
        }))
      }));

      setGames(transformedGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isSignedIn, getToken]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  useFocusEffect(
    useCallback(() => {
      if (isSignedIn) {
        loadGames();
      }
    }, [isSignedIn, loadGames])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  }, [loadGames]);

  // Simplified game filtering
  const displayedGames = useMemo(() => {
    console.log('Filtering games:', { totalGames: games.length, selectedIndex });
    
    // Filter for upcoming games
    const upcomingGames = games.filter(game => 
      game.status === 'upcoming' || game.status === 'in_progress'
    );
    
    if (selectedIndex === 0) {
      // All Games tab
      return upcomingGames;
    } else {
      // My Games tab
      return upcomingGames.filter(game => game.isHostedByMe || game.isPlayer);
    }
  }, [games, selectedIndex]);

  const handleGamePress = async (gameId: string) => {
    try {
      console.log('Fetching game data for ID:', gameId);
      const gameData = await fetchGameById(gameId);
      console.log('Received game data:', gameData);

      if (!gameData) {
        console.error('No game data received');
        return;
      }

      // First check if user is host
      if (gameData.isHostedByMe) {
        console.log('Routing as host');
        router.push({
          pathname: "/(home)/(screens)/GameDashboardAdminScreen",
          params: { id: gameId }
        });
        return;
      }

      // Then check if user is a player
      if (gameData.isPlayer) {
        // Check if player is an admin
        const isAdmin = gameData.joinedPlayers.some(player => 
          player.isAdmin && player.id === user?.id  // Add user ID check
        );

        if (isAdmin) {
          console.log('Routing as admin player');
          router.push({
            pathname: "/(home)/(screens)/GameDashboardAdminScreen",
            params: { id: gameId }
          });
        } else {
          console.log('Routing as regular player');
          router.push({
            pathname: "/(home)/(screens)/GameDashboardScreen",
            params: { id: gameId }
          });
        }
        return;
      }

      // Finally, route as non-player
      console.log('Routing as non-player');
      router.push({
        pathname: "/(home)/(screens)/GameDetailsScreen",
        params: { id: gameId }
      });

    } catch (error) {
      console.error('Error handling game press:', error);
      Alert.alert('Error', 'Failed to load game details');
    }
  };

  // Remove the loading check for user
  if (!isSignedIn) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Find Games</Text>
            <Ionicons 
              name="archive-outline" 
              size={24} 
              color="white" 
              onPress={() => router.push('/(home)/(screens)/ArchivedGamesScreen')}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SegmentedControl
        options={['All Games', 'My Games']}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        containerStyle={styles.segmentedControl}
      />

      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={['#9702E7']}
            />
          }
        >
          <View style={styles.gamesContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#BB86FC" />
            ) : displayedGames.length > 0 ? (
              displayedGames.map((game) => {
                console.log('Rendering game:', game);
                return (
                  <JoinedGameCard
                    key={game.id}
                    {...game}
                    onPress={() => handleGamePress(game.id)}
                  />
                );
              })
            ) : (
              <Text style={styles.noGamesText}>
                {selectedIndex === 0 ? 'No upcoming games found' : 'No games found'}
              </Text>
            )}
          </View>
        </ScrollView>

        {selectedIndex === 0 && (
          <View style={styles.footer}>
            <GradientButton 
              text="Host a Game" 
              onPress={() => router.push('/(home)/(screens)/HostGameScreen')}
            />
          </View>
        )}
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
  segmentedControl: {
    marginVertical: 20,
  },
  contentWrapper: {
    flex: 1,
    display: 'flex',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
  },
  gamesContainer: {
    width: '100%',
    flex: 1,
  },
  placeholderText: {
    color: 'white',
    textAlign: 'center',
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
  noGamesText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10,
  },
});
