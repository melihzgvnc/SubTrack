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
import { useResponsive, useResponsiveValue } from '../hooks/useResponsive';
import { useTranslation } from 'react-i18next';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const { t } = useTranslation();

  // Responsive add button size
  const addButtonSize = useResponsiveValue({
    sm: 52,
    md: 56,
    lg: 64,
    xl: 72,
    default: 56,
  });

  // Responsive icon sizes
  const iconSize = useResponsiveValue({
    sm: 22,
    md: 24,
    lg: 28,
    xl: 32,
    default: 24,
  });

  // Calculate bottom offset to clear the AdBanner
  // AdBanner is usually ~50px + 20px padding + safe area
  // We lift the tab bar above that
  const AD_HEIGHT = 0;
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
                  width: addButtonSize,
                  height: addButtonSize,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -(addButtonSize / 1.5), // Float up proportionally
                }}
                activeOpacity={0.8}
              >
                {/* Use Squircle for the Add Button */}
                <View style={{ position: 'absolute', width: addButtonSize, height: addButtonSize }}>
                  <Squircle
                    width={addButtonSize}
                    height={addButtonSize}
                    cornerRadius={addButtonSize * 0.36}
                    backgroundColor={colors.accent.tertiary} // Neon Green
                    showBorder={true}
                    borderColor="rgba(255,255,255,0.5)"
                  />
                </View>
                <Plus color={colors.text.inverse} size={addButtonSize * 0.5} />
              </TouchableOpacity>
            );
          }

          let Icon;
          let label = '';

          if (route.name === 'index') {
            Icon = Home;
            label = t('tabBar.dashboard');
          } else if (route.name === 'stats') {
            Icon = BarChart2;
            label = t('tabBar.insights');
          } else if (['subscription/[id]', 'settings', 'onboarding', 'login', '(auth)/login', 'welcome', '(auth)/welcome', '(auth)'].includes(route.name)) {
            return null; // Hide detail, settings, onboarding, and auth from tab bar
          } else {
            console.log('Unhandled route in CustomTabBar:', route.name);
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
                minWidth: isTablet ? 80 : 60, // Ensure enough width for text
              }}
            >
              <View style={{ width: isTablet ? 52 : 44, height: isTablet ? 52 : 44, alignItems: 'center', justifyContent: 'center' }}>
                {Icon && <Icon color={isFocused ? colors.accent.secondary : colors.text.muted} size={iconSize} />}
              </View>
              <Text
                style={{
                  color: isFocused ? colors.accent.secondary : colors.text.muted,
                  fontSize: isTablet ? typography.size.sm : typography.size.xs,
                  fontWeight: isFocused ? '600' : '400',
                  marginTop: -spacing.xxs,
                  marginBottom: spacing.xxs
                }}
                allowFontScaling
                maxFontSizeMultiplier={1.2}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
