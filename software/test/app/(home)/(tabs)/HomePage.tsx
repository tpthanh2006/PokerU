import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SignedIn, useUser, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { LeaderboardCard } from '../../../components/ui/LeaderboardCard';
import { router } from 'expo-router';
import { NotificationDropdown } from '../../../components/ui/NotificationDropdown';
import { JoinedGameCard } from '../../../components/ui/JoinedGameCard';
import { fetchUserGames } from '../../../services/gameService';
import { Game } from './FindGamesPage';
import { setApiAuth } from '../../../services/api';
import { NotificationBanner } from '../../../components/ui/NotificationBanner';
import api from '../../../services/api';

const { width } = Dimensions.get('window');

interface LeaderboardUser {
  id: string;
  username: string;
  imageUrl: string;
  winnings: number;
  position: number;
}

export default function HomePage(): React.JSX.Element {
  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const username = user?.username || 'User';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gameEndedNotification, setGameEndedNotification] = useState<{
    gameId: string;
    gameTitle: string;
  } | null>(null);
  const [globalLeaders, setGlobalLeaders] = useState<LeaderboardUser[]>([]);
  const [friendLeaders, setFriendLeaders] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const loadGames = async () => {
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
      const games = await fetchUserGames();
      setUserGames(games);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadGames();
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [user, isSignedIn, getToken]);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const response = await api.get('notifications/unread/');
        const notifications = response.data;
        
        // Find game ended notifications
        const gameEndedNotif = notifications.find(n => n.type === 'GAME_ENDED');
        if (gameEndedNotif) {
          setGameEndedNotification({
            gameId: gameEndedNotif.data.gameId,
            gameTitle: gameEndedNotif.data.gameTitle
          });
          // Mark as read
          await api.post(`notifications/${gameEndedNotif.id}/mark_read/`);
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkNotifications();
    // Poll for notifications every minute
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSeeAllGlobal = () => {
    router.push('/(home)/(screens)/LeaderboardScreen?type=global');
  };

  const handleSeeAllFriends = () => {
    router.push('/(home)/(screens)/LeaderboardScreen?type=friends');
  };

  const handleNotificationPress = () => {
    setShowNotifications(!showNotifications);
  };

  const handleGamePress = (gameId: string, isHostedByMe: boolean) => {
    console.log('Game Press:', { gameId, isHostedByMe });
    if (isHostedByMe) {
      router.push(`/(home)/(screens)/GameDashboardAdminScreen?id=${gameId}`);
    } else {
      router.push(`/(home)/(screens)/GameDashboardScreen?id=${gameId}`);
    }
  };

  const fetchLeaderboard = async (type: 'global' | 'friends') => {
    try {
      const response = await api.get(`games/leaderboard/?type=${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${type} leaderboard:`, error);
      return [];
    }
  };

  useEffect(() => {
    const loadLeaderboards = async () => {
      if (!user || !isSignedIn) return;
      
      try {
        setLeaderboardLoading(true);
        const token = await getToken();
        if (!token) return;
        
        await setApiAuth(token);
        const [global, friends] = await Promise.all([
          api.get('games/leaderboard/?type=global').then(res => res.data),
          api.get('games/leaderboard/?type=friends').then(res => res.data)
        ]);
        
        setGlobalLeaders(global);
        setFriendLeaders(friends);
      } catch (error) {
        console.error('Error loading leaderboards:', error);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    loadLeaderboards();
  }, [user, isSignedIn, getToken]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9702E7', '#E14949']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: user?.imageUrl }}
              style={styles.profileImage}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.nameText}>{username}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SegmentedControl
        options={['For You', 'Friends']}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        containerStyle={styles.segmentedControl}
      />

      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#BB86FC"
            colors={['#BB86FC']}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Games</Text>
          {loading ? (
            <Text style={styles.placeholderText}>Loading games...</Text>
          ) : userGames.length > 0 ? (
            userGames.map((game) => (
              <JoinedGameCard
                key={game.id}
                {...game}
                onPress={() => handleGamePress(game.id, game.isHostedByMe)}
              />
            ))
          ) : (
            <Text style={styles.placeholderText}>No games found</Text>
          )}
        </View>

        {selectedIndex === 0 ? (
          <View>
            <LeaderboardCard
              title="Global Leaderboard"
              users={globalLeaders}
              onSeeAll={handleSeeAllGlobal}
              loading={leaderboardLoading}
            />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.placeholderText}>Activity Feed Coming Soon</Text>
          </View>
        ) : (
          <View>
            <LeaderboardCard
              title="Friends Leaderboard"
              users={friendLeaders}
              onSeeAll={handleSeeAllFriends}
              loading={leaderboardLoading}
            />
            <Text style={styles.sectionTitle}>Friends Activity</Text>
            <Text style={styles.placeholderText}>Friends Feed Coming Soon</Text>
          </View>
        )}
      </ScrollView>

      {showNotifications && (
        <NotificationDropdown onClose={() => setShowNotifications(false)} />
      )}

      {gameEndedNotification && (
        <NotificationBanner
          gameId={gameEndedNotification.gameId}
          gameTitle={gameEndedNotification.gameTitle}
          onDismiss={() => setGameEndedNotification(null)}
        />
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  nameText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedControl: {
    marginVertical: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  placeholderText: {
    color: 'white',
    textAlign: 'center',
    opacity: 0.6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});