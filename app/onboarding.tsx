import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubStore } from '../store/useSubStore';
import { Squircle } from '../components/ui/Squircle';
import { CreditCard, TrendingUp, Bell, Check, ArrowRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
  FadeInDown,
  FadeInRight,
  SharedValue,
  withRepeat,
  withSequence,
  Easing,
  useAnimatedProps,
  interpolateColor
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useResponsive } from '../hooks/useResponsive';

const slides = [
  {
    id: '1',
    title: 'CONTROL',
    subtitle: 'Your Subscriptions.\nOne Command Center.',
    icon: CreditCard,
    color: colors.accent.secondary, // Neon Blue
    accent: 'rgba(181, 222, 255, 0.2)',
  },
  {
    id: '2',
    title: 'INSIGHT',
    subtitle: 'Visualize Spending.\nSpot the Leaks.',
    icon: TrendingUp,
    color: colors.accent.quaternary, // Neon Purple
    accent: 'rgba(231, 181, 255, 0.2)',
  },
  {
    id: '3',
    title: 'ALERT',
    subtitle: 'Never Miss a Due Date.\nStay Ahead.',
    icon: Bell,
    color: colors.accent.tertiary, // Neon Green
    accent: 'rgba(181, 255, 205, 0.2)',
  },
  {
    id: '4',
    title: 'LAUNCH',
    subtitle: 'Ready to optimize?  Let\'s go.',
    icon: Check,
    color: colors.accent.primary, // Neon Red/Pink
    accent: 'rgba(255, 181, 181, 0.2)',
    isLast: true,
  },
];

const Dot = ({ index, scrollX, screenWidth }: { index: number; scrollX: SharedValue<number>; screenWidth: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 32, 8], // Expand to 32 when active
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    const color = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
    );

    return {
      width: withSpring(dotWidth, { damping: 15 }),
      opacity: withTiming(opacity, { duration: 200 }),
      backgroundColor: index === 0 ? colors.accent.secondary : index === 1 ? colors.accent.quaternary : index === 2 ? colors.accent.tertiary : colors.accent.primary, // Dynamic color based on index? Or interpolate colors?
      // Let's keep it simple with white/active color or just use the slide color if we want to be fancy.
      // For now, let's use a static color logic or just white for simplicity in "Neon" theme against dark.
      // Actually, let's use the specific neon color for the active dot.
    };
  });

  // To animate color properly we need interpolateColor which is available in reanimated.
  // But for simplicity, let's just use white for inactive and the slide color for active?
  // Or just white for all, changing opacity/width is enough for "Neon Pulse".
  // Let's stick to the slide colors.

  return (
    <Animated.View
      style={[
        { height: 8, borderRadius: 4, marginHorizontal: 4 },
        animatedStyle,
      ]}
    />
  );
};

export default function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useSubStore((state) => state.completeOnboarding);
  const scrollX = useSharedValue(0);

  // Use dynamic dimensions that update on rotation/resize
  const { width, height, isTablet } = useResponsive();

  // Responsive sizing
  const iconSize = isTablet ? 80 : 64;
  const squircleSize = isTablet ? 200 : 160;
  const buttonHeight = isTablet ? 72 : 64;

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleComplete = (route: string) => {
    completeOnboarding();
    router.replace(route as any);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background.main }}>
      {/* Animated Background Gradient */}
      <Animated.View style={[StyleSheet.absoluteFill]}>
        <LinearGradient
          colors={[
            '#1a0010',                  // Slightly lighter than base
            colors.background.main,     // Deep burgundy base
            '#0d0008',                  // Very dark
            colors.background.main,     // Back to base
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Orbiting Accent Glow - Bubble 1 (Clockwise Rotation) */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: 200,
              opacity: 0.25,
            },
            useAnimatedStyle(() => {
              const inputRange = [0, width, width * 2, width * 3];

              // Interpolate background color
              const backgroundColor = interpolateColor(
                scrollX.value,
                inputRange,
                [
                  colors.accent.secondary,  // Blue for slide 1
                  colors.accent.quaternary, // Purple for slide 2
                  colors.accent.tertiary,   // Green for slide 3
                  colors.accent.primary,    // Pink for slide 4
                ]
              );

              // Orbital rotation: Top-Right → Bottom-Right → Bottom-Left → Top-Left
              const top = interpolate(
                scrollX.value,
                inputRange,
                [-150, height - 250, height - 250, -150],
                Extrapolation.CLAMP
              );

              const left = interpolate(
                scrollX.value,
                inputRange,
                [width - 250, width - 250, -150, -150],
                Extrapolation.CLAMP
              );

              return {
                backgroundColor,
                top: withSpring(top, { damping: 20, stiffness: 90 }),
                left: withSpring(left, { damping: 20, stiffness: 90 }),
              };
            }),
          ]}
        />

        {/* Orbiting Accent Glow - Bubble 2 (Counter-Clockwise Rotation) */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 450,
              height: 450,
              borderRadius: 225,
              opacity: 0.2,
            },
            useAnimatedStyle(() => {
              const inputRange = [0, width, width * 2, width * 3];

              // Interpolate background color
              const backgroundColor = interpolateColor(
                scrollX.value,
                inputRange,
                [
                  colors.accent.tertiary,   // Green for slide 1
                  colors.accent.secondary,  // Blue for slide 2
                  colors.accent.primary,    // Pink for slide 3
                  colors.accent.quaternary, // Purple for slide 4
                ]
              );

              // Orbital rotation: Bottom-Left → Top-Left → Top-Right → Bottom-Right
              const top = interpolate(
                scrollX.value,
                inputRange,
                [height - 300, -200, -200, height - 300],
                Extrapolation.CLAMP
              );

              const left = interpolate(
                scrollX.value,
                inputRange,
                [-150, -150, width - 300, width - 300],
                Extrapolation.CLAMP
              );

              return {
                backgroundColor,
                top: withSpring(top, { damping: 20, stiffness: 90 }),
                left: withSpring(left, { damping: 20, stiffness: 90 }),
              };
            }),
          ]}
        />
      </Animated.View>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide, index) => {
          // Parallax or scale effects for content
          // Capture width in closure for animation
          const slideWidth = width;
          const animatedSlideStyle = useAnimatedStyle(() => {
            const inputRange = [(index - 1) * slideWidth, index * slideWidth, (index + 1) * slideWidth];
            const scale = interpolate(
              scrollX.value,
              inputRange,
              [0.8, 1, 0.8],
              Extrapolation.CLAMP
            );
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0, 1, 0],
              Extrapolation.CLAMP
            );
            return {
              transform: [{ scale }],
              opacity,
            };
          });

          // Bounce animation
          const bounceY = useSharedValue(0);

          React.useEffect(() => {
            bounceY.value = withRepeat(
              withSequence(
                withTiming(-20, { duration: 700, easing: Easing.out(Easing.quad) }),
                withTiming(0, { duration: 700, easing: Easing.in(Easing.quad) })
              ),
              -1,
              false
            );
          }, []);

          const squircleBounceStyle = useAnimatedStyle(() => {
            return {
              transform: [{ translateY: bounceY.value }],
            };
          });

          const shadowStyle = useAnimatedStyle(() => {
            // Shadow compresses when squircle is at ground, expands when up
            const scale = interpolate(
              bounceY.value,
              [-20, 0],
              [0.6, 1],
              Extrapolation.CLAMP
            );
            const opacity = interpolate(
              bounceY.value,
              [-20, 0],
              [0.2, 0.5],
              Extrapolation.CLAMP
            );
            return {
              transform: [{ scaleX: scale }],
              opacity,
            };
          });

          return (
            <View key={slide.id} style={{ width: width, height: height }} className="items-center px-8">
              {/* Top Spacer */}
              <View style={{ flex: 1 }} />

              {/* Main Content - Always Centered */}
              <Animated.View style={[animatedSlideStyle, { alignItems: 'center', width: '100%' }]}>
                {/* Icon Container */}
                <View className="mb-12 relative items-center justify-center">
                  {/* Ground Shadow */}
                  {/* <Animated.View 
                                style={[
                                    {
                                        position: 'absolute',
                                        bottom: -15,
                                        width: 80,
                                        height: 12,
                                        backgroundColor: slide.color,
                                        borderRadius: 40,
                                    },
                                    shadowStyle
                                ]}
                            /> */}

                  {/* Bouncing Squircle */}
                  <Animated.View style={squircleBounceStyle}>
                    <Squircle
                      width={squircleSize}
                      height={squircleSize}
                      cornerRadius={squircleSize * 0.3}
                      backgroundColor={colors.border.subtle}
                      showBorder
                      borderColor={slide.color}
                      borderWidth={1.5}
                    >
                      <View className="flex-1 justify-center items-center">
                        <slide.icon color={slide.color} size={iconSize} />
                      </View>
                    </Squircle>
                  </Animated.View>
                </View>

                {/* Typography */}
                <View className="w-full items-center mt-8">
                  <Text
                    className="text-6xl tracking-tighter mb-2 text-center"
                    style={{
                      fontFamily: typography.fontFamily.display,
                      color: slide.color,
                      textShadowColor: slide.color,
                      textShadowRadius: 10
                    }}
                  >
                    {slide.title}
                  </Text>
                  <Text className="text-white text-2xl font-light tracking-wide leading-8 opacity-90 text-center">
                    {slide.subtitle}
                  </Text>
                </View>
              </Animated.View>

              {/* Bottom Spacer / Buttons Container */}
              <View style={{ flex: 1 }} className="w-full justify-start items-center pt-16">
                {/* Actions for Last Slide */}
                {slide.isLast && (
                  <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    className="w-full gap-4"
                  >
                    <TouchableOpacity
                      onPress={() => handleComplete('/add')}
                      activeOpacity={0.8}
                    >
                      <Squircle
                        width={width - 64} // Full width minus padding
                        height={buttonHeight}
                        cornerRadius={20}
                        backgroundColor={slide.color}
                      >
                        <View className="flex-1 flex-row justify-center items-center gap-3">
                          <Text
                            className="text-background text-xl tracking-wider"
                            style={{ fontFamily: typography.fontFamily.display }}
                          >
                            ADD SUBSCRIPTION
                          </Text>
                          <ArrowRight color={colors.text.inverse} size={24} strokeWidth={3} />
                        </View>
                      </Squircle>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleComplete('/')}
                      className="py-4 items-center"
                    >
                      <Text className="text-gray-500 font-medium text-sm tracking-widest uppercase">Skip for now</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Animated Progress Bar */}
      <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center h-8">
        {slides.map((_, index) => (
          <Dot key={index} index={index} scrollX={scrollX} screenWidth={width} />
        ))}
      </View>
    </SafeAreaView>
  );
}
