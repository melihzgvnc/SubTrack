import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CustomTabBar } from '../components/CustomTabBar';
import './global.css';

export default function Layout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#09090B',
            borderTopWidth: 0,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="add" options={{ title: 'Add', presentation: 'modal' }} />
        <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
        <Tabs.Screen name="subscription/[id]" options={{ href: null }} />
      </Tabs>
      <StatusBar style="light" />
    </>
  );
}
