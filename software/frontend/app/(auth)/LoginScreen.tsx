import React, { useState } from 'react';
import { View, Text, Image, SafeAreaView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { InputField } from '../../components/ui/InputField';
import GradientButton from '../../components/ui/GradientButton';
import { router } from 'expo-router';
import { KeyboardAwareView } from '../../components/ui/KeyboardAwareView';
import { useSignIn } from '@clerk/clerk-expo';

const { width, height } = Dimensions.get('window');

export default function LoginScreen(): React.JSX.Element {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(home)/(tabs)/HomePage');
      } else {
        setErrorMessage('Sign in failed. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        setErrorMessage('No account found with this email');
      } else if (err.errors?.[0]?.code === 'form_password_incorrect') {
        setErrorMessage('Incorrect password');
      } else {
        setErrorMessage(err.errors?.[0]?.message || 'An error occurred during sign in');
      }
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
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo_large.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Enter your Email & password to login</Text>
          </View>

          <View style={[styles.inputContainer, { gap: 16 }]}>
            <InputField
              label="Email"
              placeholder="Enter Your Email"
              value={email}
              onChange={setEmail}
            />
            <InputField
              label="Password"
              placeholder="********"
              type="password"
              value={password}
              onChange={setPassword}
            />
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/ForgotPasswordScreen')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <GradientButton 
            text={loading ? "Signing in..." : "Login"} 
            onPress={handleSignIn} 
          />

          <Text 
            style={styles.registerText}
            onPress={() => router.push('/(auth)/SignUpScreen')}
          >
            Don't have an account? Register
          </Text>
        </View>
      </KeyboardAwareView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.6,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 20,
  },
  registerText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  gradientButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    fontSize: 14,
  },
});