import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

// Extended sample data
const ALL_LEADERS = {
  global: [
    // ... your existing GLOBAL_LEADERS array ...
    {
      id: '7',
      name: 'David Lee',
      imageUrl: 'https://i.pravatar.cc/150?img=7',
      winnings: 18000,
      position: 4,
    },
    {
      id: '8',
      name: 'Emma White',
      imageUrl: 'https://i.pravatar.cc/150?img=8',
      winnings: 15000,
      position: 5,
    },
    // Add more users as needed
  ],
  friends: [
    // ... your existing FRIEND_LEADERS array ...
    {
      id: '9',
      name: 'Chris Black',
      imageUrl: 'https://i.pravatar.cc/150?img=9',
      winnings: 7000,
      position: 4,
    },
    {
      id: '10',
      name: 'Amy Green',
      imageUrl: 'https://i.pravatar.cc/150?img=10',
      winnings: 5000,
      position: 5,
    },
    // Add more users as needed
  ],
};

export default function LeaderboardScreen() {
  const { type } = useLocalSearchParams();
  const isGlobal = type === 'global';
  const leaders = isGlobal ? ALL_LEADERS.global : ALL_LEADERS.friends;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9702E7', '#E14949']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isGlobal ? 'Global Leaderboard' : 'Friends Leaderboard'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Top players by winnings
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer}>
        {leaders.map((user) => (
          <View key={user.id} style={styles.userRow}>
            <View style={styles.leftSection}>
              <View style={styles.positionContainer}>
                <Text style={[
                  styles.position,
                  user.position === 1 && styles.firstPlace,
                  user.position === 2 && styles.secondPlace,
                  user.position === 3 && styles.thirdPlace,
                ]}>
                  #{user.position}
                </Text>
              </View>
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
              <Text style={styles.name}>{user.name}</Text>
            </View>
            <Text style={styles.winnings}>${user.winnings.toLocaleString()}</Text>
          </View>
        ))}
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
    justifyContent: 'center',
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
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionContainer: {
    width: 30,
  },
  position: {
    color: 'white',
    fontSize: 14,
  },
  firstPlace: {
    color: '#FFD700',
  },
  secondPlace: {
    color: '#C0C0C0',
  },
  thirdPlace: {
    color: '#CD7F32',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    color: 'white',
    fontSize: 16,
  },
  winnings: {
    color: '#9702E7',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 