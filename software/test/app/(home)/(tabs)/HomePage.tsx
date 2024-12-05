import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SignedIn, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { LeaderboardCard } from '../../../components/ui/LeaderboardCard';
import { router } from 'expo-router';
import { NotificationDropdown } from '../../../components/ui/NotificationDropdown';

const { width } = Dimensions.get('window');

const GLOBAL_LEADERS = [
  {
    id: '1',
    name: 'John Doe',
    imageUrl: 'https://i.pravatar.cc/150?img=1',
    winnings: 50000,
    position: 1,
  },
  {
    id: '2',
    name: 'Jane Smith',
    imageUrl: 'https://i.pravatar.cc/150?img=2',
    winnings: 35000,
    position: 2,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    imageUrl: 'https://i.pravatar.cc/150?img=3',
    winnings: 22000,
    position: 3,
  },
];

const FRIEND_LEADERS = [
  {
    id: '4',
    name: 'Sarah Wilson',
    imageUrl: 'https://i.pravatar.cc/150?img=4',
    winnings: 15000,
    position: 1,
  },
  {
    id: '5',
    name: 'Tom Brown',
    imageUrl: 'https://i.pravatar.cc/150?img=5',
    winnings: 12000,
    position: 2,
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    imageUrl: 'https://i.pravatar.cc/150?img=6',
    winnings: 8000,
    position: 3,
  },
];

export default function HomePage(): React.JSX.Element {
  const { user } = useUser();
  const username = user?.username || 'User';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSeeAllGlobal = () => {
    router.push('/(home)/(screens)/LeaderboardScreen?type=global');
  };

  const handleSeeAllFriends = () => {
    router.push('/(home)/(screens)/LeaderboardScreen?type=friends');
  };

  const handleNotificationPress = () => {
    setShowNotifications(!showNotifications);
  };

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

      <ScrollView style={styles.contentContainer}>
        {selectedIndex === 0 ? (
          <View>
            <LeaderboardCard
              title="Global Leaderboard"
              users={GLOBAL_LEADERS}
              onSeeAll={handleSeeAllGlobal}
            />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.placeholderText}>Activity Feed Coming Soon</Text>
          </View>
        ) : (
          <View>
            <LeaderboardCard
              title="Friends Leaderboard"
              users={FRIEND_LEADERS}
              onSeeAll={handleSeeAllFriends}
            />
            <Text style={styles.sectionTitle}>Friends Activity</Text>
            <Text style={styles.placeholderText}>Friends Feed Coming Soon</Text>
          </View>
        )}
      </ScrollView>

      {showNotifications && (
        <NotificationDropdown onClose={() => setShowNotifications(false)} />
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
});