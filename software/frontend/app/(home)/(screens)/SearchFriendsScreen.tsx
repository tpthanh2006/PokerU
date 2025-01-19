import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { SearchBar } from '../../../components/ui/SearchBar';
import { UserListItem } from '../../../components/ui/UserListItem';

// Temporary mock data
const MY_FRIENDS = [
  {
    id: '1',
    username: 'JohnDoe',
    imageUrl: 'https://i.pravatar.cc/150?img=1',
    status: 'Online',
  },
  {
    id: '2',
    username: 'JaneSmith',
    imageUrl: 'https://i.pravatar.cc/150?img=2',
    status: 'Offline',
  },
  // Add more friends...
];

const SUGGESTED_FRIENDS = [
  {
    id: '3',
    username: 'MikeJohnson',
    imageUrl: 'https://i.pravatar.cc/150?img=3',
    mutualFriends: 3,
  },
  {
    id: '4',
    username: 'SarahWilson',
    imageUrl: 'https://i.pravatar.cc/150?img=4',
    mutualFriends: 5,
  },
  // Add more suggestions...
];

export default function SearchFriendsScreen() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof SUGGESTED_FRIENDS>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would be an API call
    if (selectedIndex === 0) {
      // Search my friends
      const results = MY_FRIENDS.filter(friend => 
        friend.username.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      // Search all users
      const results = SUGGESTED_FRIENDS.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <UserListItem 
      user={item}
      isFriend={selectedIndex === 0}
      onPress={() => router.push(`/(home)/(screens)/UserProfileScreen?id=${item.id}`)}
    />
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedIndex === 0 ? 'My Friends' : 'Find Friends'}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SegmentedControl
        options={['My Friends', 'Find Friends']}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        containerStyle={styles.segmentedControl}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder={selectedIndex === 0 ? "Search friends..." : "Search users..."}
        containerStyle={styles.searchBar}
      />

      <FlatList
        data={searchQuery ? searchResults : (selectedIndex === 0 ? MY_FRIENDS : SUGGESTED_FRIENDS)}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  segmentedControl: {
    marginVertical: 20,
  },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    padding: 20,
  },
}); 