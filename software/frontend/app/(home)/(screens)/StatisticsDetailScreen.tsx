import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getUserStats, setApiAuth } from '../../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

interface DetailedStats {
  total_games: number;
  total_profit: number;
  avg_profit_per_game: number;
  total_hours: number;
  avg_hourly_rate: number;
  roi: number;
  biggest_win: number;
  biggest_loss: number;
  total_buyin: number;
  historical_data: {
    month: string;
    profit: number;
    hours: number;
    games: number;
    hourly_rate: number;
  }[];
}

const renderChart = (
  data: number[],
  labels: string[],
  label: string,
  color = '#9702E7'
) => (
  <LineChart
    data={{
      labels,
      datasets: [{
        data,
        color: () => color,
      }]
    }}
    width={Dimensions.get('window').width - 40}
    height={220}
    chartConfig={{
      backgroundColor: '#1a0325',
      backgroundGradientFrom: '#1a0325',
      backgroundGradientTo: '#1a0325',
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: color
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  />
);

export default function StatisticsDetailScreen() {
  const { statId } = useLocalSearchParams();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const router = useRouter();

  const loadStats = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      await setApiAuth(token, user?.id);
      const userStats = await getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, getToken]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const renderGamesPlayedDetails = () => (
    <>
      <Text style={styles.subtitle}>Games Overview</Text>
      <View style={styles.statRow}>
        <Text style={styles.label}>Total Games</Text>
        <Text style={styles.value}>{stats?.total_games || 0}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Total Hours</Text>
        <Text style={styles.value}>{stats?.total_hours?.toFixed(1) || 0}h</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Average Game Duration</Text>
        <Text style={styles.value}>
          {stats?.total_games ? 
            ((stats.total_hours / stats.total_games) * 60).toFixed(0) + ' min' : 
            '0 min'}
        </Text>
      </View>
      <Text style={styles.subtitle}>Games Over Time</Text>
      {renderChart(
        stats?.historical_data.map(d => d.games) || [],
        stats?.historical_data.map(d => d.month) || [],
        'Games'
      )}
    </>
  );

  const renderProfitDetails = () => (
    <>
      <Text style={styles.subtitle}>Profit Analysis</Text>
      <View style={styles.statRow}>
        <Text style={styles.label}>Total Profit/Loss</Text>
        <Text style={[
          styles.value,
          { color: stats?.total_profit >= 0 ? '#4CAF50' : '#E14949' }
        ]}>
          ${stats?.total_profit?.toFixed(2) || '0.00'}
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Average Per Game</Text>
        <Text style={[
          styles.value,
          { color: stats?.avg_profit_per_game >= 0 ? '#4CAF50' : '#E14949' }
        ]}>
          ${stats?.avg_profit_per_game?.toFixed(2) || '0.00'}
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>ROI</Text>
        <Text style={[
          styles.value,
          { color: stats?.roi >= 0 ? '#4CAF50' : '#E14949' }
        ]}>
          {stats?.roi?.toFixed(1) || '0'}%
        </Text>
      </View>
      <Text style={styles.subtitle}>Profit Trend</Text>
      {renderChart(
        stats?.historical_data.map(d => d.profit) || [],
        stats?.historical_data.map(d => d.month) || [],
        'Profit',
        stats?.total_profit >= 0 ? '#4CAF50' : '#E14949'
      )}
    </>
  );

  const renderHourlyRateDetails = () => (
    <>
      <Text style={styles.subtitle}>Hourly Performance</Text>
      <View style={styles.statRow}>
        <Text style={styles.label}>Average Hourly Rate</Text>
        <Text style={[
          styles.value,
          { color: stats?.avg_hourly_rate >= 0 ? '#4CAF50' : '#E14949' }
        ]}>
          ${stats?.avg_hourly_rate?.toFixed(2) || '0.00'}/hr
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Total Hours Played</Text>
        <Text style={styles.value}>{stats?.total_hours?.toFixed(1) || 0}h</Text>
      </View>
      <Text style={styles.subtitle}>Hourly Rate Trend</Text>
      {renderChart(
        stats?.historical_data.map(d => d.hourly_rate) || [],
        stats?.historical_data.map(d => d.month) || [],
        'Hourly Rate',
        stats?.avg_hourly_rate >= 0 ? '#4CAF50' : '#E14949'
      )}
    </>
  );

  const renderROIDetails = () => (
    <>
      <Text style={styles.subtitle}>Return on Investment</Text>
      <View style={styles.statRow}>
        <Text style={styles.label}>Overall ROI</Text>
        <Text style={[
          styles.value,
          { color: stats?.roi >= 0 ? '#4CAF50' : '#E14949' }
        ]}>
          {stats?.roi?.toFixed(1) || '0'}%
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Total Buy-ins</Text>
        <Text style={styles.value}>
          ${stats?.total_buyin?.toFixed(2) || '0.00'}
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Total Returns</Text>
        <Text style={[
          styles.value,
          { color: stats?.total_profit >= 0 ? '#4CAF50' : '#E14949' }
        ]}>
          ${(stats?.total_buyin + stats?.total_profit)?.toFixed(2) || '0.00'}
        </Text>
      </View>

      <Text style={styles.subtitle}>ROI Trend</Text>
      {renderChart(
        stats?.historical_data.map(d => 
          d.profit && d.hours ? (d.profit / d.hours) * 100 : 0
        ) || [],
        stats?.historical_data.map(d => d.month) || [],
        'ROI %',
        stats?.roi >= 0 ? '#4CAF50' : '#E14949'
      )}
    </>
  );

  const renderBiggestWinDetails = () => (
    <>
      <Text style={styles.subtitle}>Biggest Wins & Losses</Text>
      <View style={styles.statRow}>
        <Text style={styles.label}>Biggest Win</Text>
        <Text style={[styles.value, { color: '#4CAF50' }]}>
          ${stats?.biggest_win?.toFixed(2) || '0.00'}
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Biggest Loss</Text>
        <Text style={[styles.value, { color: '#E14949' }]}>
          ${stats?.biggest_loss?.toFixed(2) || '0.00'}
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Average Win</Text>
        <Text style={[
          styles.value,
          { color: stats?.avg_profit_per_game >= 0 ? '#4CAF50' : '#E14949' }
        ]}>
          ${stats?.avg_profit_per_game?.toFixed(2) || '0.00'}
        </Text>
      </View>

      <Text style={styles.subtitle}>Profit History</Text>
      {renderChart(
        stats?.historical_data.map(d => d.profit) || [],
        stats?.historical_data.map(d => d.month) || [],
        'Profit',
        '#9702E7'
      )}
    </>
  );

  const renderHoursPlayedDetails = () => (
    <>
      <Text style={styles.subtitle}>Time Analysis</Text>
      <View style={styles.statRow}>
        <Text style={styles.label}>Total Hours</Text>
        <Text style={styles.value}>{stats?.total_hours?.toFixed(1) || 0}h</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Average Session</Text>
        <Text style={styles.value}>
          {stats?.total_games ? 
            ((stats.total_hours / stats.total_games) * 60).toFixed(0) + ' min' : 
            '0 min'}
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Profit Per Hour</Text>
        <Text style={[
          styles.value,
          { color: stats?.avg_hourly_rate >= 0 ? '#4CAF50' : '#E14949' }
        ]}>
          ${stats?.avg_hourly_rate?.toFixed(2) || '0.00'}/hr
        </Text>
      </View>

      <Text style={styles.subtitle}>Hours Played Trend</Text>
      {renderChart(
        stats?.historical_data.map(d => d.hours) || [],
        stats?.historical_data.map(d => d.month) || [],
        'Hours',
        '#9702E7'
      )}
    </>
  );

  const renderContent = () => {
    console.log('Current statId:', statId);
    
    switch (statId) {
      case 'games_played':
        return renderGamesPlayedDetails();
      case 'total_profit_loss':
        return renderProfitDetails();
      case 'hourly_rate':
        return renderHourlyRateDetails();
      case 'hours_played':
        return renderHoursPlayedDetails();
      case 'roi':
        return renderROIDetails();
      case 'biggest_win':
        return renderBiggestWinDetails();
      default:
        return (
          <Text style={styles.error}>
            Invalid statistic selected: {statId}
          </Text>
        );
    }
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {statId?.toString().split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loading}>Loading statistics...</Text>
        ) : (
          renderContent()
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -20,
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  value: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    color: '#E14949',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 