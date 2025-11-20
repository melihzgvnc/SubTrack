import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CustomTabBar } from '../components/CustomTabBar';
import { MeshBackground } from '../components/ui/MeshBackground';
import { View } from 'react-native';
import './global.css';

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#09090B' }}>
      <MeshBackground />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'transparent', // Make transparent to show mesh
            borderTopWidth: 0,
            elevation: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          sceneStyle: {
            backgroundColor: 'transparent', // Important for mesh to show through screens
          }
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="add" options={{ title: 'Add', presentation: 'modal' }} />
        <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
        <Tabs.Screen name="subscription/[id]" options={{ href: null }} />
      </Tabs>
      <StatusBar style="light" />
    </View>
  );
}
