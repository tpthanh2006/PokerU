import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import TransparentButton from '../../../components/ui/TransparentButton';
import GradientButton from '../../../components/ui/GradientButton';

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
  const statId = title.toLowerCase().replace(/ /g, '_');
  
  const handlePress = () => {
    if (title !== 'Favorite Game') {  // Don't navigate for Favorite Game
      router.push(`/(home)/(screens)/StatisticsDetailScreen?statId=${statId}`);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.statCard}
      onPress={handlePress}
      disabled={title === 'Favorite Game'}
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
  const { user } = useUser();
  const username = user?.username || 'User';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const stats: StatCardProps[] = [
    {
      title: 'Games Played',
      value: '127',
      icon: 'game-controller',
    },
    {
      title: 'Win Rate',
      value: '68%',
      icon: 'trophy',
    },
    {
      title: 'Total Winnings',
      value: '$2,450',
      icon: 'cash',
    },
    {
      title: 'Favorite Game',
      value: 'Texas Hold\'em',
      icon: 'heart',
    },
    {
      title: 'Current Streak',
      value: '5 games',
      icon: 'flame',
    },
    {
      title: 'Tournament Wins',
      value: '3',
      icon: 'medal',
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
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
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
});
