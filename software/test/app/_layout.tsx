import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import { setApiAuth, initializeAuth, clearApiAuth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a simple token cache
const tokenCache = {
  async getToken(key: string) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, token: string) {
    try {
      await AsyncStorage.setItem(key, token);
    } catch (err) {
      console.error('Error saving token:', err);
    }
  }
};

// Configure splash screen
SplashScreen.preventAutoHideAsync();

function AuthenticatedLayout() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const setupAuth = async () => {
      if (isSignedIn && user) {
        try {
          // Get a fresh token
          const token = await getToken();
          if (token) {
            console.log('Got fresh token from Clerk');
            await setApiAuth(token, user.id);
          } else {
            console.warn('No token available');
            clearApiAuth();
          }
        } catch (err) {
          console.error('Error getting token:', err);
          clearApiAuth();
        }
      } else {
        clearApiAuth();
      }
    };

    if (isLoaded && userLoaded) {
      setupAuth();
    }
  }, [isLoaded, userLoaded, isSignedIn, user, getToken]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isLoaded || !userLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    console.log('Navigation check:', { 
      isSignedIn, 
      inAuthGroup, 
      segments,
      hasUser: !!user,
      userId: user?.id 
    });
    
    if (!isSignedIn && !inAuthGroup) {
      console.log('Redirecting to auth');
      router.replace('/(auth)/OnboardingScreen');
    } else if (isSignedIn && inAuthGroup) {
      console.log('Redirecting to home');
      router.replace('/(home)/(tabs)/HomePage');
    }
  }, [isLoaded, userLoaded, isSignedIn, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider 
      publishableKey="pk_test_YnJhdmUtbGFyay0yNS5jbGVyay5hY2NvdW50cy5kZXYk"
      tokenCache={tokenCache}
      afterSignIn={(session) => {
        console.log('Sign in successful, session:', session);
      }}
      afterSignOut={() => {
        console.log('Sign out completed');
        clearApiAuth();
      }}
    >
      <ClerkLoaded>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View 
            style={{ flex: 1, backgroundColor: '#1a0325' }} 
            onLayout={onLayoutRootView}
          >
            <AuthenticatedLayout />
            <StatusBar style="light" />
          </View>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
