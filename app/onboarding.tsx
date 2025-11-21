import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
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
  useAnimatedProps
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'CONTROL',
    subtitle: 'Your Subscriptions.\nOne Command Center.',
    icon: CreditCard,
    color: '#B5DEFF', // Neon Blue
    accent: 'rgba(181, 222, 255, 0.2)',
  },
  {
    id: '2',
    title: 'INSIGHT',
    subtitle: 'Visualize Spending.\nSpot the Leaks.',
    icon: TrendingUp,
    color: '#E7B5FF', // Neon Purple
    accent: 'rgba(231, 181, 255, 0.2)',
  },
  {
    id: '3',
    title: 'ALERT',
    subtitle: 'Never Miss a Due Date.\nStay Ahead.',
    icon: Bell,
    color: '#B5FFCD', // Neon Green
    accent: 'rgba(181, 255, 205, 0.2)',
  },
  {
    id: '4',
    title: 'LAUNCH',
    subtitle: 'Ready to optimize?  Let\'s go.',
    icon: Check,
    color: '#FFB5B5', // Neon Red/Pink
    accent: 'rgba(255, 181, 181, 0.2)',
    isLast: true,
  },
];

const Dot = ({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
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
      backgroundColor: index === 0 ? '#B5DEFF' : index === 1 ? '#E7B5FF' : index === 2 ? '#B5FFCD' : '#FFB5B5', // Dynamic color based on index? Or interpolate colors?
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

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleComplete = (route: string) => {
    completeOnboarding();
    router.replace(route as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Background Ambient Glow - Optional, maybe later */}
      
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
            const animatedSlideStyle = useAnimatedStyle(() => {
                const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
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
                <View key={slide.id} style={{ width, height }} className="items-center px-8">
                    {/* Top Spacer */}
                    <View style={{ flex: 1 }} />
                    
                    {/* Main Content - Always Centered */}
                    <Animated.View style={[animatedSlideStyle, { alignItems: 'center', width: '100%' }]}>
                        {/* Icon Container */}
                        <View className="mb-12 relative items-center justify-center">
                            {/* Ground Shadow */}
                            <Animated.View 
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
                            />
                            
                            {/* Bouncing Squircle */}
                            <Animated.View style={squircleBounceStyle}>
                                <Squircle
                                    width={160}
                                    height={160}
                                    cornerRadius={48}
                                    backgroundColor="rgba(255,255,255,0.03)"
                                    showBorder
                                    borderColor={slide.color}
                                    borderWidth={1.5}
                                >
                                    <View className="flex-1 justify-center items-center">
                                        <slide.icon color={slide.color} size={64} />
                                    </View>
                                </Squircle>
                            </Animated.View>
                        </View>

                        {/* Typography */}
                        <View className="w-full items-center mt-8">
                            <Text 
                                className="text-6xl font-black tracking-tighter mb-2 text-center"
                                style={{ color: slide.color, textShadowColor: slide.color, textShadowRadius: 10 }}
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
                                        height={64}
                                        cornerRadius={20}
                                        backgroundColor={slide.color}
                                    >
                                        <View className="flex-1 flex-row justify-center items-center gap-3">
                                            <Text className="text-background font-bold text-xl tracking-wider">ADD SUBSCRIPTION</Text>
                                            <ArrowRight color="#09090B" size={24} strokeWidth={3} />
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
          <Dot key={index} index={index} scrollX={scrollX} />
        ))}
      </View>
    </SafeAreaView>
  );
}
