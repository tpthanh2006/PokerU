import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { InputField } from '../../components/ui/InputField';
import GradientButton from '../../components/ui/GradientButton';
import { KeyboardAwareView } from '../../components/ui/KeyboardAwareView';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen(): React.JSX.Element {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      // Navigate to reset password screen with email
      router.push({
        pathname: '/(auth)/ResetPasswordScreen',
        params: { email }
      });
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.errors?.[0]?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../assets/images/circle_bg.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      
      <KeyboardAwareView>
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address to receive a password reset link
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                If an account exists with this email, you will receive password reset instructions shortly.
              </Text>
            </View>
          )}

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <InputField
              label="Email"
              placeholder="Enter Your Email"
              value={email}
              onChange={setEmail}
            />
          </View>

          {/* Button Section */}
          <View style={styles.buttonContainer}>
            <GradientButton 
              text={loading ? "Sending..." : "Send Reset Link"} 
              onPress={handleResetPassword}
            />
          </View>
        </View>
      </KeyboardAwareView>
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
    marginTop: height * 0.1,
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
  inputContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: height * 0.05,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#34C759',
    textAlign: 'center',
  },
});
