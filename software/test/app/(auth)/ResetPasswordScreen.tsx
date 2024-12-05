import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { InputField } from '../../components/ui/InputField';
import GradientButton from '../../components/ui/GradientButton';
import { useSignIn, useAuth, useSession } from '@clerk/clerk-expo';
import { useLocalSearchParams, router } from 'expo-router';
import { KeyboardAwareView } from '../../components/ui/KeyboardAwareView';

const { width, height } = Dimensions.get('window');

export default function ResetPasswordScreen(): React.JSX.Element {
  const { signIn } = useSignIn();
  const { signOut } = useAuth();
  const { session } = useSession();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!code) {
      setError('Please enter the verification code');
      return;
    }
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (session) {
        await session.end();
        await signOut();
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result?.status === 'complete') {
        await signOut();
        router.replace('/(auth)/LoginScreen');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.errors?.[0]?.message || 'Failed to reset password');
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the verification code sent to {email}
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={[styles.inputContainer, { gap: 16 }]}>
            <InputField
              label="Verification Code"
              placeholder="Enter code"
              value={code}
              onChange={setCode}
            />
            <InputField
              label="New Password"
              placeholder="Enter new password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <InputField
              label="Confirm Password"
              placeholder="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </View>

          <View style={styles.buttonContainer}>
            <GradientButton 
              text={loading ? "Resetting..." : "Reset Password"}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
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
});
