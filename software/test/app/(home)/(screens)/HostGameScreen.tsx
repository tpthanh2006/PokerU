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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { InputField } from '../../../components/ui/InputField';
import GradientButton from '../../../components/ui/GradientButton';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function HostGameScreen(): React.JSX.Element {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [totalSpots, setTotalSpots] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // Date & Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Add state for storing the actual Date objects
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const handleCreateGame = () => {
    // This will be implemented later with backend integration
    console.log('Creating game...');
    router.back();
  };

  const handleDateChange = (event: any, chosenDate?: Date) => {
    if (chosenDate) {
      setSelectedDate(chosenDate); // Store the full Date object
      setDate(chosenDate.toLocaleDateString());
    }
  };

  const handleTimeChange = (event: any, chosenTime?: Date) => {
    if (chosenTime) {
      setSelectedTime(chosenTime); // Store the full Date object
      setTime(chosenTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const openDatePicker = () => {
    setShowTimePicker(false);
    setShowDatePicker(true);
    if (!date) {
      setDate(new Date().toLocaleDateString());
    }
  };

  const openTimePicker = () => {
    setShowDatePicker(false);
    setShowTimePicker(true);
    if (!time) {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const closePickers = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  return (
    <TouchableWithoutFeedback onPress={closePickers}>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#9702E7', '#E14949']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Host a Game</Text>
            <Text style={styles.headerSubtitle}>
              Set up your poker game details
            </Text>
          </View>
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
              <View style={styles.dateTimeInput}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={openDatePicker}
                  activeOpacity={0.7}
                >
                  <InputField
                    label="Date"
                    placeholder="Select Date"
                    value={date}
                    editable={false}
                    pointerEvents="none"
                  />
                  <Ionicons 
                    name="calendar" 
                    size={24} 
                    color="#BB86FC" 
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.dateTimeInput}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={openTimePicker}
                  activeOpacity={0.7}
                >
                  <InputField
                    label="Time"
                    placeholder="Select Time"
                    value={time}
                    editable={false}
                    pointerEvents="none"
                  />
                  <Ionicons 
                    name="time" 
                    size={24} 
                    color="#BB86FC" 
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>

              <InputField
                label="Buy In Amount ($)"
                placeholder="Enter Buy In Amount"
                value={buyIn}
                onChange={setBuyIn}
              />

              <InputField
                label="Total Spots"
                placeholder="Enter Number of Players"
                value={totalSpots}
                onChange={setTotalSpots}
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
              text="Create Game" 
              onPress={handleCreateGame}
            />
          </View>
        </KeyboardAvoidingView>

        {(showDatePicker || showTimePicker) && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime || new Date()}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a0325',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 45 : 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerContent: {
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  keyboardAvoidingView: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 100 : 120,
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
    position: 'relative',
  },
  dateTimeButton: {
    width: '100%',
    position: 'relative',
    height: 56,
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{
      translateY: -12,
    }],
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
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
}); 