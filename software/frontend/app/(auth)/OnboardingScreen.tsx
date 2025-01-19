import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import GradientButton from '../../components/ui/GradientButton';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../assets/images/circle_bg.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo_large.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to PokerU</Text>
          <Text style={styles.subtitle}>
            Your journey starts here. Connect, share, and explore with our community.
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonContainer}>
          <GradientButton 
            text="Sign Up" 
            onPress={() => router.push('/(auth)/SignUpScreen')} 
          />
          <TouchableOpacity 
            style={styles.transparentButton}
            onPress={() => router.push('/(auth)/LoginScreen')}
          >
            <Text style={styles.transparentButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1, // 10% from the top
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: height * 0.05, // 5% from bottom
    gap: 16,
  },
  transparentButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  transparentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
