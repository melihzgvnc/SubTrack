import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, BarChart2, Plus, Settings, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Squircle } from './ui/Squircle';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();

  return (
    <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-2">
        {/* Floating Tab Bar Container */}
        <View 
            style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: 'rgba(9, 9, 11, 0.7)', // Semi-transparent dark
                borderRadius: 32, // We can't use Squircle easily for the whole bar without layout, using high radius for now or we can wrap each item.
                // User requested Squircles for "all cards and buttons". 
                // Let's try to make the tab bar itself a GlassCard if possible, or just the buttons?
                // "Frosted Acetate for navigation elements"
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
            }}
        >
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
                    style={{
                        width: 56,
                        height: 56,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: -28, // Float up
                    }}
                    activeOpacity={0.8}
                >
                     {/* Use Squircle for the Add Button */}
                     <View style={{ position: 'absolute', width: 56, height: 56 }}>
                        <Squircle 
                            width={56} 
                            height={56} 
                            cornerRadius={20} 
                            backgroundColor="#B5FFCD" // Neon Green
                            showBorder={true}
                            borderColor="rgba(255,255,255,0.5)"
                        />
                     </View>
                     <Plus color="#000" size={28} />
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
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
            }}
          >
            {/* Active Indicator (Glow) */}
            {isFocused && (
                <View style={{ position: 'absolute', width: 44, height: 44, opacity: 0.2 }}>
                    <Squircle 
                        width={44} 
                        height={44} 
                        cornerRadius={14} 
                        backgroundColor="#B5DEFF" 
                    />
                </View>
            )}
            {Icon && <Icon color={isFocused ? '#B5DEFF' : '#64748B'} size={24} />}
          </TouchableOpacity>
        );
      })}
      </View>
    </View>
  );
}
