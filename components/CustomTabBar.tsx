import React from 'react';
import { View, TouchableOpacity, Text, Platform, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, BarChart2, Plus, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Squircle } from './ui/Squircle';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Calculate bottom offset to clear the AdBanner
  // AdBanner is usually ~50px + 20px padding + safe area
  // We lift the tab bar above that
  const AD_HEIGHT = 40;
  const bottomOffset = insets.bottom + AD_HEIGHT;

  return (
    <View 
        className="absolute left-0 right-0 px-4 pb-2 pt-2"
        style={{ bottom: bottomOffset }}
    >
        {/* Floating Tab Bar Container */}
        <View 
            style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingHorizontal: spacing.xxxl, // Increased from 20 to bring icons closer to center
                paddingVertical: spacing.xs,
                // Remove background color and border from here, move to BlurView wrapper or absolute background
            }}
        >
            {/* Glass Background */}
            <BlurView
                intensity={400}
                tint="dark"
                style={{
                    ...StyleSheet.absoluteFillObject,
                    borderRadius: spacing.xxl,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: colors.border.highlight,
                    backgroundColor: 'rgba(9, 9, 11, 0.5)', // Stronger dark overlay for better separation
                    shadowColor: colors.background.main,
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            />

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
                            backgroundColor={colors.accent.tertiary} // Neon Green
                            showBorder={true}
                            borderColor="rgba(255,255,255,0.5)"
                        />
                     </View>
                     <Plus color={colors.text.inverse} size={28} />
                </TouchableOpacity>
            );
        }

        let Icon;
        let label = '';
        
        if (route.name === 'index') {
            Icon = Home;
            label = 'Dashboard';
        } else if (route.name === 'stats') {
            Icon = BarChart2;
            label = 'Insights';
        } else if (route.name === 'subscription/[id]' || route.name === 'settings' || route.name === 'onboarding') {
            return null; // Hide detail, settings, and onboarding from tab bar
        } else {
            Icon = CreditCard; // Fallback
        }

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
                minWidth: 60, // Ensure enough width for text
            }}
          >
            <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                {Icon && <Icon color={isFocused ? colors.accent.secondary : colors.text.muted} size={24} />}
            </View>
            <Text style={{ 
                color: isFocused ? colors.accent.secondary : colors.text.muted, 
                fontSize: typography.size.xs, 
                fontWeight: isFocused ? '600' : '400',
                marginTop: -spacing.xxs,
                marginBottom: spacing.xxs 
            }}>
                {label}
            </Text>
          </TouchableOpacity>
        );
      })}
      </View>
    </View>
  );
}
