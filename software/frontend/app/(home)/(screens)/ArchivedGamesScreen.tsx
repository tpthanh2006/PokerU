import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameCard } from '../../../components/ui/GameCard';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { setApiAuth } from '../../../services/api';
import api from '../../../services/api';
import { Game } from '../(tabs)/FindGamesPage';
import { Ionicons } from '@expo/vector-icons';

export default function ArchivedGamesScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();

  const loadArchivedGames = useCallback(async () => {
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

      const response = await api.get('games/?status=archived');
      console.log('Raw API Response:', response.data);

      if (!Array.isArray(response.data)) {
        console.error('Expected array of games, got:', typeof response.data);
        return;
      }

      const transformedGames = response.data.map((game: any) => {
        console.log('Processing game:', game);
        
        if (!game || !game.id) {
          console.error('Invalid game data:', game);
          return null;
        }

        return {
          id: game.id.toString(),
          title: game.title || 'Untitled Game',
          hostName: game.host?.username || 'Unknown Host',
          hostImage: game.host?.image_url || null,
          dateTime: game.scheduled_time ? new Date(game.scheduled_time).toLocaleString() : '',
          scheduled_time: game.scheduled_time || '',
          buyIn: parseFloat(game.buy_in || '0'),
          totalSpots: game.slots || 0,
          private: Boolean(game.private),
          isHostedByMe: Boolean(game.is_hosted_by_me),
          isPlayer: Boolean(game.is_player),
          playerCount: game.player_count || 0,
          description: game.description || '',
          location: game.location || '',
          status: game.status || 'archived',
          startTime: game.scheduled_time || '',
          joinedPlayers: (game.players || []).map((player: any) => ({
            id: (player?.id || '').toString(),
            name: player?.username || 'Unknown Player',
            image: player?.is_host ? game.host?.image_url : null,
            isHost: Boolean(player?.is_host),
            isAdmin: Boolean(player?.is_admin)
          }))
        };
      }).filter(Boolean);

      console.log('Transformed games:', transformedGames);

      setGames(transformedGames);
      setLoading(false);
    } catch (err) {
      console.error('Error loading archived games:', err);
      setError('Failed to load archived games');
      setLoading(false);
    }
  }, [user, isSignedIn, getToken]);

  useEffect(() => {
    loadArchivedGames();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadArchivedGames();
    setRefreshing(false);
  }, [loadArchivedGames]);

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
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="white" 
              onPress={() => router.back()}
              style={styles.backButton}
            />
            <Text style={styles.headerTitle}>Archived Games</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

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
          ) : games.length > 0 ? (
            games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPress={() => router.push(`/(home)/(screens)/ArchivedGameDetailsScreen?id=${game.id}`)}
              />
            ))
          ) : (
            <Text style={styles.noGamesText}>No archived games found</Text>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gamesContainer: {
    width: '100%',
    paddingTop: 20,
  },
  noGamesText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
}); 