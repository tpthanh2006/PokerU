import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function TermsOfServiceScreen(): React.JSX.Element {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams();

  const handleBack = () => {
    if (returnTo === 'signup') {
      router.push('/(auth)/SignUpScreen');
    } else {
      router.back();
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
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Terms of Service</Text>
            <View style={{ width: 40 }}>
              <Text> </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using PokerU, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.text}>
            • You must be at least 18 years old to use this service{'\n'}
            • You are responsible for maintaining the confidentiality of your account{'\n'}
            • You agree to provide accurate and complete information{'\n'}
            • You are solely responsible for all activities under your account
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Game Rules and Fair Play</Text>
          <Text style={styles.text}>
            • Users must follow standard poker rules and etiquette{'\n'}
            • Cheating, collusion, or unfair play is strictly prohibited{'\n'}
            • Users must not use automated tools or bots{'\n'}
            • All games must comply with local laws and regulations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Privacy and Data</Text>
          <Text style={styles.text}>
            We collect and process your data as described in our{' '}
            <Text 
              style={styles.link}
              onPress={() => router.push({
                pathname: '/(home)/(screens)/PrivacyPolicyScreen',
                params: { returnTo: returnTo }
              })}
            >
              Privacy Policy
            </Text>
            . By using PokerU, you consent to such processing and warrant that all data provided is accurate.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Prohibited Activities</Text>
          <Text style={styles.text}>
            • Harassment or abuse of other users{'\n'}
            • Sharing inappropriate content{'\n'}
            • Attempting to manipulate game outcomes{'\n'}
            • Using the service for illegal activities{'\n'}
            • Creating multiple accounts
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Termination</Text>
          <Text style={styles.text}>
            We reserve the right to terminate or suspend accounts that violate these terms or for any other reason at our sole discretion.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
          <Text style={styles.text}>
            We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Disclaimer</Text>
          <Text style={styles.text}>
            PokerU is provided "as is" without warranties of any kind. We are not responsible for any losses incurred while using the service.
          </Text>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#BB86FC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 22,
  },
  link: {
    color: '#BB86FC',
    textDecorationLine: 'underline',
  },
}); 