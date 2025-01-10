import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import { setApiAuth, clearApiAuth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

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

function InitialLayout() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Handle auth setup
  useEffect(() => {
    const setupAuth = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken();
          if (token) {
            await setApiAuth(token, user.id);
          } else {
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

  // Handle navigation after initial mount
  useEffect(() => {
    if (!isLoaded || !userLoaded || !appReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/OnboardingScreen');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(home)/(tabs)/HomePage');
    }
  }, [isLoaded, userLoaded, isSignedIn, segments, appReady]);

  // Handle layout and splash screen
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isLoaded && userLoaded) {
      try {
        await SplashScreen.hideAsync();
        setAppReady(true);
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    }
  }, [fontsLoaded, isLoaded, userLoaded]);

  if (!fontsLoaded || !isLoaded || !userLoaded) {
    return null;  // Keep the native splash screen visible
  }

  return (
    <View 
      style={{ flex: 1, backgroundColor: '#1a0325' }} 
      onLayout={onLayoutRootView}
    >
      <Slot />
      <StatusBar style="light" />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
          <InitialLayout />
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
