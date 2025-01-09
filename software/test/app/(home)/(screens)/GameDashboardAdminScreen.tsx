import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../../components/ui/GradientButton';
import { fetchGameById, updateGame, deleteGame, removePlayer, toggleAdmin } from '../../../services/gameService';
import { Game } from '../(tabs)/FindGamesPage';
import { useAuth } from '@clerk/clerk-expo';
import { EditSettingModal } from '../../../components/ui/EditSettingModal';
import { InfoCard } from '../../../components/ui/InfoCard';
import { CountdownTimer } from '../../../components/ui/CountdownTimer';
import api, { setApiAuth } from '../../../services/api';

// Define interfaces
interface Player {
  id: string;
  name: string;
  image: string;
  isHost?: boolean;
  isAdmin?: boolean;
}

interface GameDetails extends Game {
  joinedPlayers: Player[];
  location: string;
  buyIn: number;
  totalSpots: number;
}

interface PlayerActionsProps {
  player: Player;
  onPromote: () => void;
  onRemove: () => void;
  isHost: boolean;
}

const PlayerActions: React.FC<PlayerActionsProps> = ({ player, onPromote, onRemove, isHost }) => (
  <View style={styles.playerItem}>
    <Image 
      source={{ 
        uri: player.image || 'https://img.clerk.com/default-avatar.png'
      }} 
      style={[styles.playerImage, { backgroundColor: 'rgba(187, 134, 252, 0.1)' }]} 
    />
    <Text style={styles.playerName}>{player.name}</Text>
    {(player.isHost || player.isAdmin) && (
      <View style={[styles.badge, player.isHost ? styles.hostBadge : styles.adminBadge]}>
        <Text style={styles.badgeText}>
          {player.isHost ? 'Host' : 'Admin'}
        </Text>
      </View>
    )}
    <View style={styles.playerActions}>
      {!player.isHost && !player.isAdmin && isHost && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onPromote}
        >
          <Ionicons name="shield-outline" size={20} color="#BB86FC" />
        </TouchableOpacity>
      )}
      {!player.isHost && (
        <TouchableOpacity 
          style={[styles.actionButton, styles.removeButton]}
          onPress={onRemove}
        >
          <Ionicons name="person-remove-outline" size={20} color="#FF4444" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const GameSettingsSection: React.FC<{ game: GameDetails; onUpdate: (updatedGame: GameDetails) => void }> = ({ game, onUpdate }) => {
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const formatSettingTitle = (setting: string) => {
    switch (setting) {
      case 'buyIn':
        return 'Buy In';
      case 'totalSpots':
        return 'Player Limit';
      case 'location':
        return 'Location';
      default:
        return setting.charAt(0).toUpperCase() + setting.slice(1);
    }
  };

  const handleEdit = (setting: string, value: any) => {
    setEditingSetting(setting);
    
    // Safely convert value to string for editing
    let stringValue = '';
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        stringValue = value.join('\n');
      } else {
        stringValue = value.toString();
      }
    }
    setEditValue(stringValue);
  };

  const handleSave = async (value: string) => {
    if (!editingSetting) return;

    let updates: Partial<GameDetails> = {};
    try {
      switch (editingSetting) {
        case 'buyIn':
          const buyIn = parseFloat(value);
          if (isNaN(buyIn) || buyIn < 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid buy-in amount');
            return;
          }
          updates = { buyIn };
          break;

        case 'totalSpots':
          const spots = parseInt(value);
          if (isNaN(spots) || spots <= 0) {
            Alert.alert('Invalid Number', 'Please enter a valid number of spots');
            return;
          }
          if (spots < (game.joinedPlayers?.length || 0)) {
            Alert.alert('Invalid Number', 'Cannot set spots lower than current player count');
            return;
          }
          updates = { totalSpots: spots };
          break;

        case 'location':
          if (!value.trim()) {
            Alert.alert('Invalid Location', 'Please enter a valid location');
            return;
          }
          updates = { location: value.trim() };
          break;
      }

      const updated = await updateGame(game.id, updates);
      if (updated) {
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error updating game settings:', error);
      Alert.alert('Error', 'Failed to update game settings');
    } finally {
      setEditingSetting(null);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Game Settings</Text>
      
      <InfoCard
        label="Buy In"
        value={game.buyIn ? `$${game.buyIn}` : 'Not set'}
        onPress={() => handleEdit('buyIn', game.buyIn)}
        icon="cash-outline"
      />

      <InfoCard
        label="Player Limit"
        value={game.totalSpots ? `${game.totalSpots} players` : 'Not set'}
        onPress={() => handleEdit('totalSpots', game.totalSpots)}
        icon="people-outline"
      />

      <InfoCard
        label="Location"
        value={game.location || 'Not set'}
        onPress={() => handleEdit('location', game.location)}
        icon="location-outline"
      />

      <EditSettingModal
        visible={!!editingSetting}
        onClose={() => setEditingSetting(null)}
        onSave={handleSave}
        title={`Edit ${formatSettingTitle(editingSetting || '')}`}
        initialValue={editValue}
        multiline={false}
      />
    </View>
  );
};

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return { date: 'Invalid date', time: 'Invalid time' };
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', timeOptions)
    };
  } catch (error) {
    console.error('Error formatting date:', error);
    return { date: 'Invalid date', time: 'Invalid time' };
  }
};

const formatGameStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'archived':
      return 'Archived';
    case 'upcoming':
    default:
      return 'Upcoming';
  }
};

const getStatusStyle = (status?: string) => {
  switch (status) {
    case 'in_progress':
      return { color: '#4CAF50' }; // Green
    case 'completed':
      return { color: '#9E9E9E' }; // Grey
    case 'cancelled':
      return { color: '#E14949' }; // Red
    case 'archived':
      return { color: '#9E9E9E' }; // Grey
    case 'upcoming':
    default:
      return { color: '#BB86FC' }; // Purple
  }
};

export default function GameDashboardAdminScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Add refresh function
  const refreshGameData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        console.error('No auth token available');
        return;
      }

      await setApiAuth(token);
      console.log('Fetching game data for ID:', id);
      const gameData = await fetchGameById(id as string);
      console.log('Received game data:', {
        id: gameData.id,
        status: gameData.status,
        playerCount: gameData.joinedPlayers?.length,
        players: gameData.joinedPlayers
      });
      
      setGame(gameData);
    } catch (error) {
      console.error('Error refreshing game data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to use refreshGameData
  useEffect(() => {
    refreshGameData();
  }, [id]);

  const handlePromoteToAdmin = async (playerId: string) => {
    try {
      // Implement promotion logic
      Alert.alert('Success', 'Player promoted to admin');
    } catch (error) {
      Alert.alert('Error', 'Failed to promote player');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    try {
      if (!game) return;
      
      Alert.alert(
        'Remove Player',
        'Are you sure you want to remove this player?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                const updatedGame = await removePlayer(game.id, playerId);
                setGame(updatedGame);
              } catch (error: any) {
                const errorMessage = error?.response?.data?.detail || 'Failed to remove player';
                Alert.alert('Error', errorMessage);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error removing player:', error);
      Alert.alert('Error', 'Failed to remove player');
    }
  };

  const handleToggleAdmin = async (playerId: string) => {
    try {
      if (!game) return;
      
      const updatedGame = await toggleAdmin(game.id, playerId);
      setGame(updatedGame);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to update admin status';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCancelGame = () => {
    Alert.alert(
      'Cancel Game',
      'Are you sure you want to cancel this game? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!game?.id) return;
              await deleteGame(game.id);
              router.back();
            } catch (error) {
              console.error('Error canceling game:', error);
              Alert.alert('Error', 'Failed to cancel game');
            }
          },
        },
      ]
    );
  };

  const handleGameUpdate = (updatedGame: GameDetails) => {
    setGame(updatedGame);
  };

  const updateGameStatus = async (gameId: string, newStatus: string) => {
    try {
      // Get fresh token
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Set the token in API headers
      await setApiAuth(token);
      
      const response = await api.post(`games/${gameId}/update_status/`, { status: newStatus });
      return response.data;
    } catch (error) {
      console.error('Error updating game status:', error);
      throw error;
    }
  };

  const handleGameStart = async () => {
    try {
      setIsUpdatingStatus(true);
      const updatedGame = await updateGameStatus(game?.id, 'in_progress');
      await refreshGameData(); // Refresh data after status update
    } catch (error) {
      console.error('Failed to start game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleGameEnd = async () => {
    try {
      setIsUpdatingStatus(true);
      const updatedGame = await updateGameStatus(game?.id, 'archived');
      setGame(updatedGame);
      router.back();
    } catch (error) {
      console.error('Failed to end game:', error);
      Alert.alert('Error', 'Failed to end game. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderGameActions = () => {
    if (game?.status === 'in_progress') {
      return (
        <View style={styles.footer}>
          <GradientButton
            text="End Game"
            onPress={handleGameEnd}
            style={styles.startButton}
            disabled={isUpdatingStatus}
          />
        </View>
      );
    }

    if (game?.status === 'upcoming') {
      return (
        <View style={styles.footer}>
          <View>
            <GradientButton
              text="Start Game"
              onPress={handleGameStart}
              style={styles.startButton}
              disabled={isUpdatingStatus}
            />
          </View>
        </View>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Loading...</Text>
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

  const { date, time } = formatDateTime(game?.scheduled_time || '');

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
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{game.title || 'Game Details'}</Text>
            </View>
            <View style={styles.backButtonPlaceholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Details</Text>
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Ionicons name="flag-outline" size={20} color="#BB86FC" />
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, getStatusStyle(game?.status)]}>
                {formatGameStatus(game.status)}
              </Text>
            </View>

            {game?.status === 'upcoming' && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#BB86FC" />
                <Text style={styles.detailLabel}>Starting In:</Text>
                <CountdownTimer
                  targetDate={game.scheduled_time}
                  onComplete={handleGameStart}
                />
              </View>
            )}
          </View>
        </View>

        {game?.status === 'upcoming' && (
          <GameSettingsSection 
            game={game} 
            onUpdate={handleGameUpdate} 
          />
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Players</Text>
            <Text style={styles.playerCount}>
              {game.joinedPlayers?.length || 0}/{game.totalSpots || 0}
            </Text>
          </View>

          <View style={styles.playerGrid}>
            {game.joinedPlayers?.map((player) => (
              <PlayerActions
                key={player.id}
                player={player}
                onPromote={() => handlePromoteToAdmin(player.id)}
                onRemove={() => handleRemovePlayer(player.id)}
                isHost={game.isHostedByMe}
              />
            ))}
          </View>
        </View>

        {game?.status === 'upcoming' && (
          <View style={styles.cancelGameContainer}>
            <GradientButton
              text="Cancel Game"
              onPress={handleCancelGame}
              colors={['#FF4444', '#FF4444']}
            />
          </View>
        )}
      </ScrollView>

      {renderGameActions()}
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
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
    borderWidth: 2,
    borderColor: '#BB86FC',
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hostLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerCount: {
    color: '#BB86FC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
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
  footer: {
    padding: 20,
    paddingBottom: 36,
    width: '100%',
    backgroundColor: '#1a0325',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  startButton: {
    flex: 2,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
  },
  countdownCard: {
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  countdownText: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  settingValue: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  playerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
    padding: 8,
    borderRadius: 20,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  value: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
    marginHorizontal: 4,
  },
  detailGroup: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    minWidth: 65,
  },
  detailValue: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  detailsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  detailValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    marginTop: 20,
    width: '100%',
  },
  cancelGameContainer: {
    marginBottom: 20,
    paddingHorizontal: 0,
  },
}); 


