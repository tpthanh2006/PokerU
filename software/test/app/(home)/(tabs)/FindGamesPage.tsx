import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { GameCard } from '../../../components/ui/GameCard';
import { useRouter } from 'expo-router';
import GradientButton from '../../../components/ui/GradientButton';

const { width } = Dimensions.get('window');

const SAMPLE_GAMES = [
  {
    id: '1',
    hostName: 'John Doe',
    hostImage: 'https://i.pravatar.cc/150?img=1',
    dateTime: 'Today, 8:00 PM',
    buyIn: 100,
    joinedPlayers: 6,
    totalSpots: 9,
    private: false,
  },
  {
    id: '2',
    hostName: 'Jane Smith',
    hostImage: 'https://i.pravatar.cc/150?img=2',
    dateTime: 'Tomorrow, 7:30 PM',
    buyIn: 250,
    joinedPlayers: 4,
    totalSpots: 8,
    private: true,
  },
  {
    id: '3',
    hostName: 'Mike Johnson',
    hostImage: 'https://i.pravatar.cc/150?img=3',
    dateTime: 'Sat, 9:00 PM',
    buyIn: 500,
    joinedPlayers: 2,
    totalSpots: 6,
    private: false,
  },
  {
    id: '4',
    hostName: 'Sarah Wilson',
    hostImage: 'https://i.pravatar.cc/150?img=4',
    dateTime: 'Fri, 6:00 PM',
    buyIn: 200,
    joinedPlayers: 3,
    totalSpots: 6,
    private: true,
  },
];

export default function FindGamesPage(): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const handleGamePress = (gameId: string) => {
    router.push(`/(home)/(screens)/GameDetailsScreen?id=${gameId}`);
  };

  const displayedGames = selectedIndex === 0 
    ? SAMPLE_GAMES // Show all games in All Games tab
    : SAMPLE_GAMES.filter(game => game.private); // Only show private games in Private Games tab

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9702E7', '#E14949']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Find Games</Text>
          <Text style={styles.headerSubtitle}>
            {selectedIndex === 0 
              ? 'Discover poker games near you'
              : 'Games from your friends'
            }
          </Text>
        </View>
      </LinearGradient>

      <SegmentedControl
        options={['All Games', 'Private Games']}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        containerStyle={styles.segmentedControl}
      />

      <View style={styles.contentWrapper}>
        <ScrollView style={styles.contentContainer}>
          {displayedGames.length > 0 ? (
            displayedGames.map((game) => (
              <GameCard
                key={game.id}
                hostName={game.hostName}
                hostImage={game.hostImage}
                dateTime={game.dateTime}
                buyIn={game.buyIn}
                joinedPlayers={game.joinedPlayers}
                totalSpots={game.totalSpots}
                onPress={() => handleGamePress(game.id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No {selectedIndex === 1 ? 'private ' : ''}games available at the moment
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton 
            text="Host a Game" 
            onPress={() => router.push('/(home)/(screens)/HostGameScreen')}
          />
        </View>
      </View>
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
  segmentedControl: {
    marginVertical: 20,
  },
  contentWrapper: {
    flex: 1,
    display: 'flex',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
  },
  gamesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    textAlign: 'center',
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
});
