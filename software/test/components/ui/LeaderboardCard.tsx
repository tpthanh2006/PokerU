import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LeaderboardUser {
  id: string;
  name: string;
  imageUrl: string;
  winnings: number;
  position: number;
}

interface LeaderboardCardProps {
  title: string;
  users: LeaderboardUser[];
  onSeeAll: () => void;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  title,
  users,
  onSeeAll,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#9702E7" />
        </TouchableOpacity>
      </View>

      {users.map((user) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#BB86FC',
    marginRight: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  name: {
    color: 'white',
    fontSize: 16,
  },
  winnings: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 