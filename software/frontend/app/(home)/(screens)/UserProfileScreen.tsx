import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';

// Mock user data - would come from your database
const USERS = {
  '1': {
    id: '1',
    username: 'JohnDoe',
    imageUrl: 'https://i.pravatar.cc/150?img=1',
    friendCount: 156,
    rank: 12,
    isFriend: true,
  },
  '2': {
    id: '2',
    username: 'JaneSmith',
    imageUrl: 'https://i.pravatar.cc/150?img=2',
    friendCount: 89,
    rank: 45,
    isFriend: true,
  },
  '3': {
    id: '3',
    username: 'MikeJohnson',
    imageUrl: 'https://i.pravatar.cc/150?img=3',
    friendCount: 234,
    rank: 3,
    isFriend: false,
  },
  '4': {
    id: '4',
    username: 'SarahWilson',
    imageUrl: 'https://i.pravatar.cc/150?img=4',
    friendCount: 167,
    rank: 8,
    isFriend: false,
  },
  'user1': {
    id: 'user1',
    username: 'John Doe',
    imageUrl: 'https://i.pravatar.cc/150?img=1',
    friendCount: 156,
    rank: 12,
    isFriend: true,
  },
  'user3': {
    id: 'user3',
    username: 'Mike Johnson',
    imageUrl: 'https://i.pravatar.cc/150?img=3',
    friendCount: 234,
    rank: 3,
    isFriend: false,
  },
  'user4': {
    id: 'user4',
    username: 'Sarah Wilson',
    imageUrl: 'https://i.pravatar.cc/150?img=4',
    friendCount: 167,
    rank: 8,
    isFriend: false,
  },
};

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const user = USERS[id as keyof typeof USERS];
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  const handleMessage = () => {
    router.push({
      pathname: "/(home)/(screens)/ChatScreen",
      params: { id: user.id }
    });
  };

  const handleFriendAction = () => {
    // This would handle friend request/remove friend based on current status
    console.log(user.isFriend ? 'Remove friend' : 'Send friend request');
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.profileInfo}>
            <Image
              source={{ uri: user.imageUrl }}
              style={styles.profileImage}
            />
            <Text style={styles.username}>{user.username}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="people" size={24} color="#BB86FC" />
                <Text style={styles.statValue}>{user.friendCount}</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="trophy" size={24} color="#BB86FC" />
                <Text style={styles.statValue}>#{user.rank}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleMessage}
              >
                <Ionicons name="chatbubble" size={24} color="white" />
                <Text style={styles.actionButtonText}>Message</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.friendButton]}
                onPress={handleFriendAction}
              >
                <Ionicons 
                  name={user.isFriend ? "person-remove" : "person-add"} 
                  size={24} 
                  color="white" 
                />
                <Text style={styles.actionButtonText}>
                  {user.isFriend ? 'Remove' : 'Add Friend'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollContent}>
        <SegmentedControl
          options={['Statistics', 'Achievements']}
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
          containerStyle={styles.segmentedControl}
        />

        {selectedIndex === 0 ? (
          <View style={styles.statsGrid}>
            <StatCard title="Games Played" value="127" icon="game-controller" />
            <StatCard title="Win Rate" value="68%" icon="trophy" />
            <StatCard title="Total Winnings" value="$2,450" icon="cash" />
            <StatCard title="Favorite Game" value="Texas Hold'em" icon="heart" />
            <StatCard title="Current Streak" value="5 games" icon="flame" />
            <StatCard title="Tournament Wins" value="3" icon="medal" />
          </View>
        ) : (
          <View style={styles.achievementsContainer}>
            <AchievementCard
              title="First Victory"
              description="Win your first poker game"
              icon="trophy"
              unlocked={true}
            />
            <AchievementCard
              title="High Roller"
              description="Win a game with over $1000 in winnings"
              icon="cash"
              unlocked={true}
            />
            <AchievementCard
              title="Tournament Champion"
              description="Win a tournament with 20+ players"
              icon="medal"
              unlocked={false}
            />
            <AchievementCard
              title="Winning Streak"
              description="Win 5 games in a row"
              icon="flame"
              unlocked={true}
            />
            <AchievementCard
              title="Poker Master"
              description="Play 100 games"
              icon="star"
              unlocked={false}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: keyof typeof Ionicons.glyphMap }) => {
  const router = useRouter();
  const statId = title.toLowerCase().replace(' ', '_');
  
  const handlePress = () => {
    if (title !== 'Favorite Game') {  // Don't navigate for Favorite Game
      router.push(`/(home)/(screens)/StatisticsDetailScreen?statId=${statId}`);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.statCardContainer}
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

const AchievementCard = ({ 
  title, 
  description, 
  icon, 
  unlocked 
}: { 
  title: string; 
  description: string; 
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
}) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 12,
  },
  username: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
  },
  friendButton: {
    backgroundColor: '#BB86FC',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  segmentedControl: {
    marginVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCardContainer: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statTextContainer: {
    flex: 1,
  },
  statTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  achievementIconContainer: {
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
  achievementDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementTitleLocked: {
    opacity: 0.7,
  },
  achievementDescriptionLocked: {
    opacity: 0.7,
  },
});

import { friendService } from '../../../services/friendService';

// Add to existing interface or create new one
interface UserProfile {
  id: string;
  username: string;
  imageUrl: string;
  isFriend: boolean;
  isFollowing: boolean;
  friendCount: number;
  followerCount: number;
  followingCount: number;
  rank: number;
}

export default function UserProfileScreen() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none');

  const handleFriendAction = async () => {
    try {
      if (friendStatus === 'none') {
        await friendService.sendFriendRequest(user.id);
        setFriendStatus('pending');
      } else if (friendStatus === 'friends') {
        await friendService.removeFriend(user.id);
        setFriendStatus('none');
      }
    } catch (error) {
      console.error('Error handling friend action:', error);
      Alert.alert('Error', 'Failed to process friend request');
    }
  };

  const handleFollowAction = async () => {
    try {
      if (isFollowing) {
        await friendService.unfollowUser(user.id);
        setIsFollowing(false);
      } else {
        await friendService.followUser(user.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error handling follow action:', error);
      Alert.alert('Error', 'Failed to process follow action');
    }
  };

  // Add to the existing return JSX
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleMessage}
      >
        <Ionicons name="chatbubble" size={24} color="white" />
        <Text style={styles.actionButtonText}>Message</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.friendButton]}
        onPress={handleFriendAction}
      >
        <Ionicons 
          name={friendStatus === 'friends' ? "person-remove" : "person-add"} 
          size={24} 
          color="white" 
        />
        <Text style={styles.actionButtonText}>
          {friendStatus === 'none' ? 'Add Friend' : 
           friendStatus === 'pending' ? 'Pending' : 'Remove Friend'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.followButton]}
        onPress={handleFollowAction}
      >
        <Ionicons 
          name={isFollowing ? "star" : "star-outline"} 
          size={24} 
          color="white" 
        />
        <Text style={styles.actionButtonText}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}