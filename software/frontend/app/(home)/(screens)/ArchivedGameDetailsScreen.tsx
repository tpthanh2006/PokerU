import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import api, { setApiAuth } from '../../../services/api';
import { fetchGameById, submitGameStats } from '../../../services/gameService';
import { Game } from '../(tabs)/FindGamesPage';
import { Ionicons } from '@expo/vector-icons';
import { InfoCard } from '../../../components/ui/InfoCard';
import GradientButton from '../../../components/ui/GradientButton';

interface UserGameStats {
  buyIn: number;
  cashOut: number;
  hoursPlayed: number;
  profit?: number;
}

export default function ArchivedGameDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserGameStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();

  // Form state
  const [buyIn, setBuyIn] = useState('');
  const [cashOut, setCashOut] = useState('');
  const [hoursPlayed, setHoursPlayed] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load both game and user stats
  useEffect(() => {
    const loadData = async () => {
      if (!user || !isSignedIn) {
        setLoading(false);
        setLoadingStats(false);
        return;
      }

      try {
        setLoading(true);
        setLoadingStats(true);
        const token = await getToken();
        if (!token) {
          console.error('No auth token available');
          return;
        }
        
        await setApiAuth(token, user.id);
        const [gameData, statsData] = await Promise.all([
          fetchGameById(id as string),
          api.get(`games/${id}/player_stats/`).catch(() => null)
        ]);

        setGame(gameData);
        if (statsData?.data) {
          setUserStats({
            buyIn: parseFloat(statsData.data.buy_in) || 0,
            cashOut: parseFloat(statsData.data.cash_out) || 0,
            hoursPlayed: parseFloat(statsData.data.hours_played) || 0,
            profit: parseFloat(statsData.data.cash_out) - parseFloat(statsData.data.buy_in) || 0
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
        setLoadingStats(false);
      }
    };

    loadData();
  }, [id, user, isSignedIn, getToken]);

  const handleSubmitStats = async () => {
    if (!game || !user) return;

    if (!buyIn || !cashOut || !hoursPlayed) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await submitGameStats(game.id, {
        buyIn: parseFloat(buyIn),
        cashOut: parseFloat(cashOut),
        hoursPlayed: parseFloat(hoursPlayed)
      });

      // Update local state with submitted stats
      setUserStats({
        buyIn: parseFloat(buyIn),
        cashOut: parseFloat(cashOut),
        hoursPlayed: parseFloat(hoursPlayed),
        profit: parseFloat(cashOut) - parseFloat(buyIn)
      });

      Alert.alert('Success', 'Game statistics submitted successfully');
    } catch (error) {
      console.error('Error submitting stats:', error);
      Alert.alert('Error', 'Failed to submit game statistics');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Game not found</Text>
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
        {loadingStats ? (
          <View style={styles.card}>
            <ActivityIndicator size="small" color="#BB86FC" />
          </View>
        ) : userStats ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Game Statistics</Text>
            <InfoCard
              label="Buy In"
              value={`$${Number(userStats.buyIn).toFixed(2)}`}
              icon="cash-outline"
            />
            <InfoCard
              label="Cash Out"
              value={`$${Number(userStats.cashOut).toFixed(2)}`}
              icon="wallet-outline"
            />
            <InfoCard
              label="Hours Played"
              value={`${Number(userStats.hoursPlayed).toFixed(1)}`}
              icon="time-outline"
            />
            <InfoCard
              label="Profit/Loss"
              value={`$${Number(userStats.profit).toFixed(2)}`}
              icon="trending-up-outline"
              valueStyle={{ 
                color: (userStats.profit || 0) > 0 ? '#4CAF50' : '#E14949'
              }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Submit Your Game Statistics</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Total Buy In ($)</Text>
              <TextInput
                style={styles.input}
                value={buyIn}
                onChangeText={setBuyIn}
                keyboardType="decimal-pad"
                placeholder="Enter total buy in"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cash Out ($)</Text>
              <TextInput
                style={styles.input}
                value={cashOut}
                onChangeText={setCashOut}
                keyboardType="decimal-pad"
                placeholder="Enter cash out amount"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hours Played</Text>
              <TextInput
                style={styles.input}
                value={hoursPlayed}
                onChangeText={setHoursPlayed}
                keyboardType="decimal-pad"
                placeholder="Enter hours played"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            <GradientButton
              text={submitting ? 'Submitting...' : 'Submit Statistics'}
              onPress={handleSubmitStats}
              disabled={submitting}
            />
          </View>
        )}

        <View style={styles.hostSection}>
          <Image 
            source={{ uri: game.hostImage || 'https://via.placeholder.com/150' }} 
            style={styles.hostImage}
          />
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>{game.hostName}</Text>
            <Text style={styles.hostLabel}>Host</Text>
          </View>
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
                <Image 
                  source={{ uri: player.image || 'https://via.placeholder.com/150' }} 
                  style={styles.playerImage} 
                />
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
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
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#BB86FC',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E14949',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  // Host section styles
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  hostImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  hostInfo: {
    marginLeft: 12,
  },
  hostName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hostLabel: {
    color: '#BB86FC',
    fontSize: 14,
  },

  // Status badge styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },

  // Player grid styles
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  playerItem: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  playerName: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostBadge: {
    backgroundColor: '#BB86FC',
  },
  adminBadge: {
    backgroundColor: '#03DAC6',
  },
  badgeText: {
    color: '#1a0325',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Description styles
  descriptionText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
}); 