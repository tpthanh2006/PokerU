import React, { useState } from 'react';
import { View, Text, Image, SafeAreaView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { InputField } from '../../components/ui/InputField';
import GradientButton from '../../components/ui/GradientButton';
import { CheckBox } from '../../components/ui/CheckBox';
import { router } from 'expo-router';
import { KeyboardAwareView } from '../../components/ui/KeyboardAwareView';
import { useSignUp } from '@clerk/clerk-expo';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen(): React.JSX.Element {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    
    setErrorMessage(null);
    setLoading(true);

    if (!termsAccepted) {
      setErrorMessage('Please accept the Terms and Conditions to continue');
      setLoading(false);
      return;
    }

    try {
      await signUp.create({
        emailAddress: email,
        password,
        username: name,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', JSON.stringify(err, null, 2));
      
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        setErrorMessage('An account with this email already exists');
      } else if (err.errors?.[0]?.code === 'form_password_length_too_short') {
        setErrorMessage('Password must be at least 8 characters long');
      } else if (err.errors?.[0]?.code === 'form_password_insufficient_complexity') {
        setErrorMessage('Password must contain at least one number and one letter');
      } else {
        setErrorMessage(err.errors?.[0]?.message || 'An error occurred during sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!isLoaded || loading) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== 'complete') {
        console.error('Verification status:', completeSignUp.status);
        setErrorMessage('Verification failed. Please try again.');
        return;
      }

      try {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(home)/(tabs)/HomePage');
      } catch (err: any) {
        console.error('Session error:', JSON.stringify(err, null, 2));
        setErrorMessage('Account created but failed to sign in. Please try logging in.');
      }
    } catch (err: any) {
      console.error('Verification error:', JSON.stringify(err, null, 2));
      
      if (err.errors?.[0]?.code === 'form_code_incorrect') {
        setErrorMessage('Incorrect verification code. Please try again.');
      } else if (err.errors?.[0]?.code === 'verification_expired') {
        setErrorMessage('Verification code has expired. Please request a new one.');
      } else {
        setErrorMessage(err.errors?.[0]?.message || 'An error occurred during verification');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || loading) return;

    setLoading(true);
    setErrorMessage(null);
    setCode('');

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setErrorMessage('A new verification code has been sent to your email.');
    } catch (err: any) {
      console.error('Resend code error:', JSON.stringify(err, null, 2));
      setErrorMessage('Failed to send new code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={require('../../assets/images/circle_bg.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
        
        <KeyboardAwareView>
          <View style={styles.verificationWrapper}>
            <View style={styles.verificationContainer}>
              <Image
                source={require('../../assets/images/logo_large.png')}
                style={styles.verificationLogo}
                resizeMode="contain"
              />
              
              <View style={styles.verificationContent}>
                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>
                  Enter the verification code sent to {email}
                </Text>
                
                {errorMessage && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                <InputField
                  label="Verification Code"
                  placeholder="Enter code"
                  value={code}
                  onChange={setCode}
                />
                
                <GradientButton 
                  text={loading ? "Verifying..." : "Verify"} 
                  onPress={handleVerification}
                />

                <TouchableOpacity 
                  style={styles.resendButton} 
                  onPress={handleResendCode}
                  disabled={loading}
                >
                  <Text style={[
                    styles.resendText,
                    loading && styles.resendTextDisabled
                  ]}>
                    Didn't receive the code? Resend
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAwareView>
      </SafeAreaView>
    );
  }

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
          
          {!pendingVerification ? (
            <>
              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/logo_large.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.title}>Sign Up</Text>
                <Text style={styles.subtitle}>Create an account to get started</Text>
              </View>

              <View style={[styles.inputContainer, { gap: 16 }]}>
                <InputField
                  label="Name"
                  placeholder="Enter Your Name"
                  value={name}
                  onChange={setName}
                />
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

              <View style={styles.termsContainer}>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    checked={termsAccepted}
                    onPress={() => {
                      setTermsAccepted(!termsAccepted);
                      if (!termsAccepted) {
                        setErrorMessage(null);
                      }
                    }}
                  />
                </View>
                <View style={styles.termsTextContainer}>
                  <View style={styles.termsTextWrapper}>
                    <Text style={styles.termsText}>I agree to the </Text>
                    <TouchableOpacity 
                      onPress={() => router.push({
                        pathname: '/(home)/(screens)/TermsOfServiceScreen',
                        params: { returnTo: 'signup' }
                      })}
                    >
                      <Text style={styles.termsLink}>Terms of Service</Text>
                    </TouchableOpacity>
                    <Text style={styles.termsText}> and </Text>
                    <TouchableOpacity 
                      onPress={() => router.push({
                        pathname: '/(home)/(screens)/PrivacyPolicyScreen',
                        params: { returnTo: 'signup' }
                      })}
                    >
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <GradientButton 
                text={loading ? "Creating Account..." : "Sign Up"} 
                onPress={handleSignUp}
              />

              <TouchableOpacity onPress={() => router.push('/(auth)/LoginScreen')}>
                <Text style={styles.loginText}>
                  Already have an account? Log In
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // Verification View
            <View style={styles.verificationContainer}>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>Enter the code sent to your email</Text>
              <InputField
                label="Verification Code"
                placeholder="Enter code"
                value={code}
                onChange={setCode}
              />
              <GradientButton text="Verify" onPress={handleVerification} />
            </View>
          )}
        </View>
      </KeyboardAwareView>
    </SafeAreaView>
  );
};

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
  registerText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    opacity: 0.8,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  checkboxContainer: {
    marginTop: 2,
  },
  loginText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    opacity: 0.8,
  },
  verificationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
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
  termsTextContainer: {
    flex: 1,
  },
  termsTextWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termsText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  termsLink: {
    color: '#BB86FC',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  resendButton: {
    marginTop: 16,
    padding: 8,
  },
  resendText: {
    color: '#BB86FC',
    textAlign: 'center',
    fontSize: 14,
  },
  verificationWrapper: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -40,
  },
  verificationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  verificationLogo: {
    width: 80,
    height: 80,
    marginBottom: 32,
  },
  verificationContent: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  resendButton: {
    marginTop: 8,
    padding: 8,
  },
  resendText: {
    color: '#BB86FC',
    textAlign: 'center',
    fontSize: 14,
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
});
