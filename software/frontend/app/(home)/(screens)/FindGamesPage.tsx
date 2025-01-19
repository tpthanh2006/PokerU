import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { GameCard } from '../../../components/ui/GameCard';
import { useRouter } from 'expo-router';
import GradientButton from '../../../components/ui/GradientButton';
import { fetchGames, fetchGameById } from '../../../services/gameService';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { setApiAuth } from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';

const { width } = Dimensions.get('window');

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
      
      // Check notifications after auth is set
      try {
        await api.get('notifications/unread/');
      } catch (error) {
        console.warn('Failed to check notifications:', error);
        // Continue execution even if notifications fail
      }

      const fetchedGames = await fetchGames();
      console.log('Fetched games:', fetchedGames);
      setGames(fetchedGames);
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

  // Filter games based on selected tab
  const displayedGames = useMemo(() => {
    const activeGames = games.filter(game => 
      game.status === 'upcoming' || game.status === 'in_progress'
    );
    
    switch (selectedIndex) {
      case 0: // All Games
        return activeGames;
      case 1: // My Games
        return activeGames.filter(game => game.isHostedByMe || game.isPlayer);
      default:
        return activeGames;
    }
  }, [games, selectedIndex]);

  const handleGamePress = async (gameId: string) => {
    try {
      const gameData = await fetchGameById(gameId);
      if (gameData.isHostedByMe) {
        router.push(`/(home)/(screens)/GameDashboardAdminScreen?id=${gameId}`);
      } else if (gameData.isPlayer) {
        router.push(`/(home)/(screens)/GameDashboardScreen?id=${gameId}`);
      } else {
        router.push(`/(home)/(screens)/GameDetailsScreen?id=${gameId}`);
      }
    } catch (error) {
      console.error('Error handling game press:', error);
    }
  };

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
              displayedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPress={() => handleGamePress(game.id)}
                />
              ))
            ) : (
              <Text style={styles.noGamesText}>
                {selectedIndex === 0 
                  ? 'No active games found' 
                  : 'You haven\'t joined any active games'}
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
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gamesContainer: {
    width: '100%',
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
  },
  noGamesText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 