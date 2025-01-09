import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import TransparentButton from '../../../components/ui/TransparentButton';
import GradientButton from '../../../components/ui/GradientButton';
import { getUserStats, setApiAuth } from '../../../services/api';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface AchievementCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  const router = useRouter();
  
  // Map titles to consistent URL parameters
  const getStatId = (title: string) => {
    switch (title) {
      case 'Games Played':
        return 'games_played';
      case 'Total Profit/Loss':
        return 'total_profit_loss';
      case 'Hourly Rate':
        return 'hourly_rate';
      case 'Hours Played':
        return 'hours_played';
      case 'ROI':
        return 'roi';
      case 'Biggest Win':
        return 'biggest_win';
      default:
        return title.toLowerCase().replace(/ /g, '_');
    }
  };
  
  const handlePress = () => {
    // Make all stats navigable
    const statId = getStatId(title);
    router.push(`/(home)/(screens)/StatisticsDetailScreen?statId=${statId}`);
  };

  return (
    <TouchableOpacity 
      style={styles.statCard}
      onPress={handlePress}
    >
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color="#9702E7" />
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

const AchievementCard: React.FC<AchievementCardProps> = ({ title, description, icon, unlocked }) => (
  <View style={[styles.achievementCard, !unlocked && styles.achievementCardLocked]}>
    <View style={styles.achievementIconContainer}>
      <Ionicons name={icon} size={24} color={unlocked ? "#9702E7" : "rgba(151, 2, 231, 0.3)"} />
    </View>
    <View style={styles.achievementTextContainer}>
      <Text style={[styles.achievementTitle, !unlocked && styles.achievementTitleLocked]}>{title}</Text>
      <Text style={[styles.achievementDescription, !unlocked && styles.achievementDescriptionLocked]}>
        {description}
      </Text>
    </View>
  </View>
);

export default function ProfilePage(): React.JSX.Element {
  const { getToken } = useAuth();
  const { user } = useUser();
  const username = user?.username || 'User';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    total_games: 0,
    total_profit: 0,
    avg_profit_per_game: 0,
    total_hours: 0,
    avg_hourly_rate: 0,
    roi: 0,
    biggest_win: 0,
    biggest_loss: 0
  });

  const loadStats = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token available');
        return;
      }

      await setApiAuth(token, user?.id);
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, getToken]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const stats: StatCardProps[] = [
    {
      title: 'Games Played',
      value: userStats.total_games.toString(),
      icon: 'game-controller',
    },
    {
      title: 'Total Profit/Loss',
      value: `$${userStats.total_profit.toFixed(2)}`,
      icon: 'cash',
    },
    {
      title: 'Hours Played',
      value: `${userStats.total_hours.toFixed(1)}h`,
      icon: 'time',
    },
    {
      title: 'Hourly Rate',
      value: `$${userStats.avg_hourly_rate.toFixed(2)}/hr`,
      icon: 'trending-up',
    },
    {
      title: 'ROI',
      value: `${userStats.roi.toFixed(1)}%`,
      icon: 'analytics',
    },
    {
      title: 'Biggest Win',
      value: `$${userStats.biggest_win.toFixed(2)}`,
      icon: 'trophy',
    },
  ];

  const achievements: AchievementCardProps[] = [
    {
      title: 'First Victory',
      description: 'Win your first poker game',
      icon: 'trophy',
      unlocked: true,
    },
    {
      title: 'High Roller',
      description: 'Win a game with over $1000 in winnings',
      icon: 'cash',
      unlocked: true,
    },
    {
      title: 'Tournament Champion',
      description: 'Win a tournament with 20+ players',
      icon: 'medal',
      unlocked: false,
    },
    {
      title: 'Winning Streak',
      description: 'Win 5 games in a row',
      icon: 'flame',
      unlocked: true,
    },
    {
      title: 'Poker Master',
      description: 'Play 100 games',
      icon: 'star',
      unlocked: false,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9702E7', '#E14949']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <View style={{ width: 40 }} />
            <Image
              source={{ uri: user?.imageUrl }}
              style={styles.profileImage}
            />
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push('/(home)/(screens)/SettingsScreen')}
            >
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>{username}</Text>
          <Text style={styles.headerSubtitle}>Pro Player</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(home)/(screens)/SearchFriendsScreen')}
            >
              <Ionicons name="people" size={24} color="white" />
              <Text style={styles.actionButtonText}>Friends</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.hostButton]}
              onPress={() => router.push('/(home)/(screens)/HostGameScreen')}
            >
              <Ionicons name="add-circle" size={24} color="white" style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Host Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <SegmentedControl
        options={['Statistics', 'Achievements']}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        containerStyle={styles.segmentedControl}
      />

      <ScrollView style={styles.contentContainer}>
        {selectedIndex === 0 ? (
          <View style={styles.statsGrid}>
            {loading ? (
              <Text style={styles.loadingText}>Loading stats...</Text>
            ) : (
              stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))
            )}
          </View>
        ) : (
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement, index) => (
              <AchievementCard key={index} {...achievement} />
            ))}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  statsContainer: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    width: (width - 56) / 2, // Accounts for padding and gap
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(151, 2, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  segmentedControl: {
    marginVertical: 20,
  },
  achievementsContainer: {
    padding: 20,
    gap: 16,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(151, 2, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    opacity: 0.7,
  },
  achievementDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  achievementDescriptionLocked: {
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  actionButton: {
    width: '48%',
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
  },
  hostButton: {
    backgroundColor: '#BB86FC',
  },
  buttonIcon: {
    marginLeft: -4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
    marginTop: 20,
  },
});
