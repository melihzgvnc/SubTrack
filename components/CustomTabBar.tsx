import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, BarChart2, Plus, Settings, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();

  return (
    <View className="flex-row bg-background pb-6 pt-2 px-6 justify-between items-center h-20">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        // Render the central button
        if (route.name === 'add') {
            return (
                <TouchableOpacity
                    key={index}
                    onPress={() => router.push('/add')}
                    className="items-center justify-center w-12 h-12 rounded-full bg-accent-mint"
                    activeOpacity={0.8}
                >
                     <Plus color="black" size={24} />
                </TouchableOpacity>
            );
        }

        let Icon;
        if (route.name === 'index') Icon = Home;
        else if (route.name === 'stats') Icon = BarChart2;
        else if (route.name === 'subscription/[id]') return null; // Hide detail from tab bar
        else Icon = Settings; // Fallback

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            className="items-center justify-center w-12 h-12"
          >
            {Icon && <Icon color={isFocused ? '#FFFFFF' : '#52525B'} size={24} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
