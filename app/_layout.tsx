import { Tabs, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CustomTabBar } from '../components/CustomTabBar';
import { MeshBackground } from '../components/ui/MeshBackground';
import { View, ActivityIndicator } from 'react-native';
import './global.css';

import { useEffect, useState, useCallback } from 'react';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { useSubStore } from '../store/useSubStore';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { colors } from '../theme/colors';

import { useAuth } from '../hooks/useAuth';
import { useCloudSync } from '../hooks/useCloudSync';
import '../lib/i18n'; // Initialize i18n

// Font loading
import { useFonts, ConcertOne_400Regular } from '@expo-google-fonts/concert-one';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding before fonts load
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const hasSeenOnboarding = useSubStore((state) => state.hasSeenOnboarding);
  const router = useRouter();
  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);

  // Load Concert One font
  const [fontsLoaded, fontError] = useFonts({
    ConcertOne_400Regular,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    setIsMounted(true);
    registerForPushNotificationsAsync();
  }, []);

  // Initialize RevenueCat
  useRevenueCat();

  // Initialize Auth
  useAuth();

  // Initialize Cloud Sync
  useCloudSync();

  useEffect(() => {
    if (isMounted && fontsLoaded) {
      // Check if store is hydrated
      const hasHydrated = useSubStore.persist.hasHydrated();

      if (hasHydrated && !hasSeenOnboarding) {
        // Use a small timeout to ensure navigation is ready
        setTimeout(() => {
          router.replace('/onboarding');
        }, 100);
      }
    }
  }, [isMounted, hasSeenOnboarding, fontsLoaded]);

  const isOnboarding = segments[0] === 'onboarding';

  // Don't render until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.main, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent.secondary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.main }}>
      <MeshBackground />
      <Tabs
        tabBar={(props) => isOnboarding ? null : <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: isOnboarding ? 'none' : 'flex',
          },
          sceneStyle: {
            backgroundColor: 'transparent',
          }
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="add" options={{ title: 'Add' }} />
        <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
        <Tabs.Screen name="subscription/[id]" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen
          name="onboarding"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="(auth)"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <StatusBar style="light" />
    </View>
  );
}
