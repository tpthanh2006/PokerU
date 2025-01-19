import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@clerk/clerk-expo';
import { useProfile } from '../../../hooks/useProfile';
import { getUserStats, setApiAuth } from '../../../services/api';

interface PokerStats {
  total_games: number;
  total_profit: number;
  total_hours: number;
  average_profit_per_game: number;
  hourly_rate: number;
  roi_percentage: number;
  biggest_win: number;
  biggest_loss: number;
  win_rate: number;
}

export default function ProfileScreen() {
  const { user, getToken } = useAuth();
  const { profile, loading: profileLoading, error } = useProfile();
  const [stats, setStats] = useState({
    total_games: 0,
    total_profit: 0,
    avg_profit_per_game: 0,
    total_hours: 0,
    avg_hourly_rate: 0,
    roi: 0,
    biggest_win: 0,
    biggest_loss: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      console.log('\n=== Loading Profile Stats ===');
      console.log('Loading user stats...');
      
      const token = await getToken();
      console.log('Got auth token:', token ? 'yes' : 'no');
      
      if (!token) {
        console.error('No auth token available');
        return;
      }

      await setApiAuth(token, user?.id);
      console.log('Set auth token, attempting API request to:', 'games/user_stats/');
      
      const userStats = await getUserStats();
      console.log('Stats received from API:', userStats);
      
      if (userStats) {
        console.log('Setting stats in state');
        setStats(userStats);
      } else {
        console.warn('No stats received from API');
      }
    } catch (error) {
      console.error('Error loading stats:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
    } finally {
      setStatsLoading(false);
    }
  }, [user?.id, getToken]);

  useEffect(() => {
    console.log('\n=== Profile Screen Mounted ===');
    console.log('User:', {
      id: user?.id,
      isSignedIn: !!user
    });
    loadStats();
    return () => {
      console.log('Profile Screen unmounted');
    };
  }, [loadStats, user]);

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const renderStatItem = (label: string, value: string, color?: string) => (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </View>
  );

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
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          {profileLoading ? (
            <Text style={styles.loadingText}>Loading profile...</Text>
          ) : (
            <>
              <View style={styles.profileHeader}>
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{user?.fullName || user?.username}</Text>
                  <Text style={styles.email}>{user?.emailAddresses[0]?.emailAddress}</Text>
                </View>
              </View>
              
              {profile && (
                <View style={styles.profileDetails}>
                  {profile.bio && (
                    <View style={styles.bioSection}>
                      <Text style={styles.bioLabel}>Bio</Text>
                      <Text style={styles.bioText}>{profile.bio}</Text>
                    </View>
                  )}
                  {profile.phone && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailValue}>{profile.phone}</Text>
                    </View>
                  )}
                  {profile.address && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Location</Text>
                      <Text style={styles.detailValue}>{profile.address}</Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Poker Statistics</Text>
          
          {statsLoading ? (
            <Text style={styles.loadingText}>Loading stats...</Text>
          ) : (
            <>
              {renderStatItem('Total Games Played', stats.total_games.toString())}
              {renderStatItem(
                'Total Profit/Loss', 
                formatCurrency(stats.total_profit),
                stats.total_profit >= 0 ? '#4CAF50' : '#E14949'
              )}
              {renderStatItem('Total Hours Played', `${stats.total_hours.toFixed(1)}h`)}
              {renderStatItem(
                'Average Profit per Game', 
                formatCurrency(stats.avg_profit_per_game),
                stats.avg_profit_per_game >= 0 ? '#4CAF50' : '#E14949'
              )}
              {renderStatItem(
                'Hourly Rate', 
                `${formatCurrency(stats.avg_hourly_rate)}/hr`,
                stats.avg_hourly_rate >= 0 ? '#4CAF50' : '#E14949'
              )}
              {renderStatItem('ROI', formatPercentage(stats.roi))}
              {renderStatItem('Biggest Win', formatCurrency(stats.biggest_win))}
              {renderStatItem('Biggest Loss', formatCurrency(stats.biggest_loss))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  statsSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  profileSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  profileDetails: {
    gap: 12,
  },
  bioSection: {
    marginBottom: 16,
  },
  bioLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 4,
  },
  bioText: {
    color: 'white',
    fontSize: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  detailValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  // ... rest of the styles ...
}); 