import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Mock data for different statistics
const STATS_DATA = {
  games_played: {
    title: 'Games Played',
    currentValue: 127,
    change: '+12 this month',
    trend: 'up',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [85, 92, 98, 109, 118, 127]
      }]
    },
    details: [
      { label: 'Texas Hold\'em', value: '78 games' },
      { label: 'Omaha', value: '32 games' },
      { label: 'Seven Card Stud', value: '17 games' },
    ]
  },
  win_rate: {
    title: 'Win Rate',
    currentValue: '68%',
    change: '+5% this month',
    trend: 'up',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [55, 58, 62, 64, 66, 68]
      }]
    },
    details: [
      { label: 'Texas Hold\'em', value: '72%' },
      { label: 'Omaha', value: '65%' },
      { label: 'Seven Card Stud', value: '58%' },
    ]
  },
  total_winnings: {
    title: 'Total Winnings',
    currentValue: '$2,450',
    change: '+$350 this month',
    trend: 'up',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [1200, 1500, 1750, 1900, 2100, 2450]
      }]
    },
    details: [
      { label: 'Biggest Win', value: '$500' },
      { label: 'Average Win', value: '$125' },
      { label: 'Win Streak', value: '5 games' },
    ]
  },
  current_streak: {
    title: 'Current Streak',
    currentValue: '5 games',
    change: 'Best: 8 games',
    trend: 'up',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [2, 3, 4, 3, 4, 5]
      }]
    },
    details: [
      { label: 'Longest Streak', value: '8 games' },
      { label: 'Average Streak', value: '3 games' },
      { label: 'Streaks This Month', value: '4' },
    ]
  },
  tournament_wins: {
    title: 'Tournament Wins',
    currentValue: '3',
    change: '+1 this month',
    trend: 'up',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [0, 1, 1, 2, 2, 3]
      }]
    },
    details: [
      { label: 'Total Tournaments', value: '12' },
      { label: 'Win Rate', value: '25%' },
      { label: 'Average Position', value: '3rd' },
    ]
  },
};

// Add to STATS_DATA for each stat
const GAME_HISTORY = [
  {
    id: '1',
    date: '2024-03-15',
    duration: '2h 15m',
    earnings: '+$350',
    gameType: 'Texas Hold\'em',
    position: '1st',
    isWin: true,
  },
  {
    id: '2',
    date: '2024-03-13',
    duration: '1h 45m',
    earnings: '-$120',
    gameType: 'Omaha',
    position: '4th',
    isWin: false,
  },
  // Add more games...
];

// Add custom theme
const customTheme = {
  axis: {
    style: {
      axis: {
        stroke: 'rgba(255, 255, 255, 0.3)',
      },
      tickLabels: {
        fill: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
      },
      grid: {
        stroke: 'none',
      },
    },
  },
};

export default function StatisticsDetailScreen() {
  const { statId } = useLocalSearchParams();
  const router = useRouter();
  const statKey = statId?.toString() as keyof typeof STATS_DATA;
  const statData = STATS_DATA[statKey];

  if (!statData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Stat not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color="white" 
          onPress={() => router.back()} 
        />
        <Text style={styles.title}>{statData.title}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.mainStatCard}>
          <Text style={styles.mainStatValue}>{statData.currentValue}</Text>
          <View style={styles.changeRow}>
            <Ionicons 
              name={statData.trend === 'up' ? 'arrow-up' : 'arrow-down'} 
              size={20} 
              color={statData.trend === 'up' ? '#4CAF50' : '#F44336'} 
            />
            <Text style={[
              styles.changeText,
              { color: statData.trend === 'up' ? '#4CAF50' : '#F44336' }
            ]}>
              {statData.change}
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Progress Over Time</Text>
          <LineChart
            data={{
              labels: statData.chartData.labels,
              datasets: [{
                data: statData.chartData.datasets[0].data
              }]
            }}
            width={width - 52} // Account for padding
            height={220}
            chartConfig={{
              backgroundColor: '#1a0325',
              backgroundGradientFrom: '#1a0325',
              backgroundGradientTo: '#1a0325',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(187, 134, 252, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#BB86FC"
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Details</Text>
          {statData.details.map((detail, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{detail.label}</Text>
              <Text style={styles.detailValue}>{detail.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.gameHistoryContainer}>
          <Text style={styles.sectionTitle}>Game History</Text>
          {GAME_HISTORY.map((game) => (
            <View key={game.id} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <Text style={styles.gameDate}>{game.date}</Text>
                <Text style={[
                  styles.gameEarnings, 
                  { color: game.earnings.startsWith('+') ? '#4CAF50' : '#F44336' }
                ]}>
                  {game.earnings}
                </Text>
              </View>
              
              <View style={styles.gameDetails}>
                <View style={styles.gameDetail}>
                  <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.gameDetailText}>{game.duration}</Text>
                </View>
                <View style={styles.gameDetail}>
                  <Ionicons name="trophy-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.gameDetailText}>{game.position}</Text>
                </View>
                <View style={styles.gameDetail}>
                  <Ionicons name="grid-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.gameDetailText}>{game.gameType}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
  mainStatCard: {
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  mainStatValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chartContainer: {
    marginVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  detailValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  gameHistoryContainer: {
    marginTop: 24,
  },
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameDate: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  gameEarnings: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  gameDetail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gameDetailText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
}); 