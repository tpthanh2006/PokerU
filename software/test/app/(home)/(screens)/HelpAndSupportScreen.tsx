import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Collapsible } from '../../../components/Collapsible';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => (
  <View style={styles.faqCard}>
    <Collapsible title={question}>
      <View style={styles.faqAnswerContainer}>
        <Text style={styles.faqAnswer}>{answer}</Text>
      </View>
    </Collapsible>
  </View>
);

export default function HelpAndSupportScreen(): React.JSX.Element {
  const router = useRouter();

  const handleInstagramPress = async () => {
    const instagramUrl = 'https://www.instagram.com/official.pokeru/';
    const canOpen = await Linking.canOpenURL(instagramUrl);
    if (canOpen) {
      await Linking.openURL(instagramUrl);
    }
  };

  const handleEmailPress = async () => {
    const emailUrl = 'mailto:pokerufromtulane@gmail.com';
    const canOpen = await Linking.canOpenURL(emailUrl);
    if (canOpen) {
      await Linking.openURL(emailUrl);
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
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <FAQItem
          question="How do I join a game?"
          answer="You can join a game through the 'Find Games' page. Some games may require approval from the host."
        />
        
        <FAQItem
          question="How do I host a game?"
          answer="To host a game, go to the find games or profile page and tap the 'Host Game' button. You can then customize your game settings and create a game."
        />

        <FAQItem
          question="Is the app free to use?"
          answer="Yes, PokerU is completely free to use! We want to make poker accessible and fun for everyone. Later updates may include premium features."
        />

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactDescription}>
            Contact our support team through Instagram or email:
          </Text>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleInstagramPress}
          >
            <Ionicons name="logo-instagram" size={24} color="#BB86FC" />
            <Text style={styles.contactButtonText}>@official.pokeru</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleEmailPress}
          >
            <Ionicons name="mail-outline" size={24} color="#BB86FC" />
            <Text style={styles.contactButtonText}>pokerufromtulane@gmail.com</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 16,
    paddingLeft: 12,
  },
  faqCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    padding: 20,
  },
  faqAnswerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(187, 134, 252, 0.1)',
  },
  faqAnswer: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  contactSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  contactTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactButtonText: {
    color: '#BB86FC',
    fontSize: 16,
    marginLeft: 12,
  },
}); 