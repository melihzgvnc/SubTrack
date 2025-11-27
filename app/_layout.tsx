import { Tabs, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CustomTabBar } from '../components/CustomTabBar';
import { MeshBackground } from '../components/ui/MeshBackground';
import { View } from 'react-native';
import { AdBanner } from '../components/AdBanner';
import './global.css';

import { useEffect, useState } from 'react';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { useSubStore } from '../store/useSubStore';
import { colors } from '../theme/colors';

export default function Layout() {
  const hasSeenOnboarding = useSubStore((state) => state.hasSeenOnboarding);
  const router = useRouter();
  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Check if store is hydrated
      const hasHydrated = useSubStore.persist.hasHydrated();
      
      if (hasHydrated && !hasSeenOnboarding) {
        // Use a small timeout to ensure navigation is ready
        setTimeout(() => {
            router.replace('/onboarding');
        }, 100);
      }
    }
  }, [isMounted, hasSeenOnboarding]);

  const isOnboarding = segments[0] === 'onboarding';

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
      </Tabs>
      {!isOnboarding && (
        <View className="absolute bottom-0 w-full items-center pb-safe">
            <AdBanner />
        </View>
      )}
      <StatusBar style="light" />
    </View>
  );
}
