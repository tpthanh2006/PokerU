import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { InputField } from '../../../components/ui/InputField';
import GradientButton from '../../../components/ui/GradientButton';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { createGame, setApiAuth } from '../../../services/api';

export default function HostGameScreen(): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [totalSpots, setTotalSpots] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // Date & Time picker states
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);

  // Update to store full Date objects
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  // Add title to state
  const [title, setTitle] = useState('');

  // Add at the top with other state variables
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGame = async () => {
    try {
      console.log('Create game attempt:', {
        isSignedIn,
        hasUser: !!user,
        userId: user?.id
      });

      if (!isSignedIn || !user) {
        Alert.alert('Error', 'You must be signed in to create a game');
        return;
      }

      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Authentication failed. Please try signing in again.');
        router.push('/(auth)/OnboardingScreen');
        return;
      }

      if (!title || !date || !time || !buyIn || !totalSpots) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0
      );

      setIsSubmitting(true);
      await setApiAuth(token, user.id);
      
      const gameData = {
        title: title.trim(),
        description: description.trim() || 'No description provided',
        location: location.trim(),
        scheduled_time: combinedDateTime.toISOString(),
        buy_in: Number(buyIn),
        slots: Number(totalSpots),
        blinds: 0,
        amount_reserved: 0,
        private: !isPublic
      };

      console.log('Attempting to create game with data:', gameData);
      const createdGame = await createGame(gameData);
      console.log('Game created successfully:', createdGame);
      
      router.push(`/(home)/(screens)/GameDashboardAdminScreen?id=${createdGame.id}`);
    } catch (error: any) {
      console.error('Game creation failed:', error);
      Alert.alert('Error', 'Failed to create game. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (event: any, chosenDate?: Date) => {
    if (chosenDate) {
      setSelectedDate(chosenDate);
      setDate(chosenDate.toLocaleDateString());
    }
  };

  const handleTimeChange = (event: any, chosenTime?: Date) => {
    if (chosenTime) {
      setSelectedTime(chosenTime);
      setTime(chosenTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const handleDonePress = () => {
    setShowPicker(null);
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowPicker(null)}>
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
              <Text style={styles.headerTitle}>Host Game</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.inputContainer}>
              <InputField
                label="Game Title"
                placeholder="Enter Game Title"
                value={title}
                onChange={setTitle}
              />

              <TouchableOpacity 
                style={styles.dateTimeInput} 
                onPress={() => setShowPicker('date')}
              >
                <InputField
                  label="Date"
                  value={date}
                  editable={false}
                  pointerEvents="none"
                  rightIcon={
                    <Ionicons 
                      name="calendar-outline" 
                      size={24} 
                      color="rgba(255, 255, 255, 0.6)" 
                    />
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateTimeInput} 
                onPress={() => setShowPicker('time')}
              >
                <InputField
                  label="Time"
                  value={time}
                  editable={false}
                  pointerEvents="none"
                  rightIcon={
                    <Ionicons 
                      name="time-outline" 
                      size={24} 
                      color="rgba(255, 255, 255, 0.6)" 
                    />
                  }
                />
              </TouchableOpacity>

              <InputField
                label="Buy In Amount ($)"
                placeholder="Enter Buy In Amount"
                value={buyIn}
                onChange={setBuyIn}
                keyboardType="numeric"
              />

              <InputField
                label="Total Spots"
                placeholder="Enter Number of Players"
                value={totalSpots}
                onChange={setTotalSpots}
                keyboardType="numeric"
              />

              <InputField
                label="Location"
                placeholder="Enter Game Location"
                value={location}
                onChange={setLocation}
              />

              <InputField
                label="Description"
                placeholder="Enter Game Description"
                value={description}
                onChange={setDescription}
                multiline={true}
              />

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Game Visibility</Text>
                <View style={styles.toggle}>
                  <TouchableOpacity 
                    style={[
                      styles.toggleOption,
                      isPublic && styles.toggleOptionActive
                    ]}
                    onPress={() => setIsPublic(true)}
                  >
                    <Text style={[
                      styles.toggleText,
                      isPublic && styles.toggleTextActive
                    ]}>Public</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.toggleOption,
                      !isPublic && styles.toggleOptionActive
                    ]}
                    onPress={() => setIsPublic(false)}
                  >
                    <Text style={[
                      styles.toggleText,
                      !isPublic && styles.toggleTextActive
                    ]}>Private</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <GradientButton 
              text={isSubmitting ? "Creating..." : "Create Game"}
              onPress={handleCreateGame}
              disabled={isSubmitting}
            />
          </View>
        </KeyboardAvoidingView>

        {showPicker && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              {showPicker === 'date' && (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              {showPicker === 'time' && (
                <DateTimePicker
                  value={selectedTime || new Date()}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />
              )}
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={handleDonePress}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
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
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  inputContainer: {
    gap: 16,
  },
  dateTimeInput: {
    width: '100%',
  },
  toggleContainer: {
    marginTop: 8,
  },
  toggleLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleOptionActive: {
    backgroundColor: '#BB86FC',
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: 'white',
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a0325',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#BB86FC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 