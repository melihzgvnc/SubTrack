import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, useWindowDimensions, FlatList, ViewToken } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubStore } from '../store/useSubStore';
import { Squircle } from '../components/ui/Squircle';
import { MeshBackground } from '../components/ui/MeshBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { Zap, BarChart3, ShieldCheck, Rocket, ArrowRight, ChevronRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
  FadeInDown,
  FadeIn,
  SlideInRight,
  runOnJS,
  SharedValue
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'SubTrack',
    description: 'The ultimate command center for your subscriptions.',
    icon: Zap,
    color: colors.accent.primary,
    highlight: 'Control',
  },
  {
    id: '2',
    title: 'Visualize',
    description: 'See exactly where your money goes with beautiful insights.',
    icon: BarChart3,
    color: colors.accent.secondary,
    highlight: 'Clarity',
  },
  {
    id: '3',
    title: 'Secure',
    description: 'Never miss a payment. Stay ahead of your bills.',
    icon: ShieldCheck,
    color: colors.accent.tertiary,
    highlight: 'Peace',
  },
  {
    id: '4',
    title: 'Ready?',
    description: 'Start optimizing your recurring expenses today.',
    icon: Rocket,
    color: colors.accent.quaternary,
    highlight: 'Launch',
  },
];

const Paginator = ({ data, scrollX, width }: { data: typeof ONBOARDING_DATA, scrollX: SharedValue<number>, width: number }) => {
  return (
    <View className="flex-row h-16 justify-center items-center gap-3">
      {data.map((_, i) => {
        const animatedStyle = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = interpolate(
            scrollX.value,
            inputRange,
            [8, 32, 8],
            Extrapolation.CLAMP
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolation.CLAMP
          );

          const backgroundColor = interpolate(
            scrollX.value,
            inputRange,
            [0, 1, 0] // We'll handle color via opacity/width mostly, but could interpolate colors too
          );

          return {
            width: dotWidth,
            opacity,
            backgroundColor: data[i].color, // Use the slide's color
          };
        });

        return (
          <Animated.View
            key={i.toString()}
            style={[{ height: 8, borderRadius: 4 }, animatedStyle]}
          />
        );
      })}
    </View>
  );
};

const OnboardingItem = ({ item, index, scrollX, width }: { item: typeof ONBOARDING_DATA[0], index: number, scrollX: SharedValue<number>, width: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
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

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, 50],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
      <Animated.View style={[{ width: '100%', alignItems: 'center' }, animatedStyle]}>
        {/* Icon Container with Glow */}
        <View className="mb-12 relative items-center justify-center">
          {/* Glow Effect */}
          <View
            style={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: item.color,
              opacity: 0.2,
              transform: [{ scale: 1.5 }],
            }}
            className="blur-3xl"
          />

          <Squircle
            width={160}
            height={160}
            cornerRadius={48}
            backgroundColor={colors.background.surface}
            borderColor={item.color}
            borderWidth={1}
            showBorder
          >
            <View className="flex-1 justify-center items-center">
              <item.icon size={64} color={item.color} />
            </View>
          </Squircle>
        </View>

        {/* Text Content */}
        <View className="items-center gap-4">
          <Text
            style={{
              fontFamily: typography.fontFamily.display,
              color: item.color,
              fontSize: 48,
              textAlign: 'center',
              textShadowColor: item.color,
              textShadowRadius: 10,
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontFamily: typography.fontFamily.body,
              color: colors.text.secondary,
              fontSize: typography.size.lg,
              textAlign: 'center',
              lineHeight: 28,
              maxWidth: '80%'
            }}
          >
            {item.description}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default function Onboarding() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const completeOnboarding = useSubStore((state) => state.completeOnboarding);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0] && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
      router.replace('/');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/');
  };

  // Calculate button width: Screen width - horizontal padding (spacing.xl * 2)
  const buttonWidth = width - (spacing.xl * 2);

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />

      <SafeAreaView className="flex-1">
        <View style={{ flex: 3 }}>
          <Animated.FlatList
            ref={flatListRef}
            data={ONBOARDING_DATA}
            renderItem={({ item, index }) => <OnboardingItem item={item} index={index} scrollX={scrollX} width={width} />}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            bounces={false}
          />
        </View>

        <View style={{ flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'space-between', paddingBottom: spacing.xl }}>
          <Paginator data={ONBOARDING_DATA} scrollX={scrollX} width={width} />

          <View className="gap-4">
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Squircle
                width={buttonWidth}
                height={64}
                cornerRadius={20}
                backgroundColor={ONBOARDING_DATA[currentIndex].color}
              >
                <View className="flex-1 flex-row justify-center items-center gap-2">
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.display,
                      color: colors.text.inverse,
                      fontSize: typography.size.xl,
                      letterSpacing: 1
                    }}
                  >
                    {currentIndex === ONBOARDING_DATA.length - 1 ? 'GET STARTED' : 'NEXT'}
                  </Text>
                  <ChevronRight size={24} color={colors.text.inverse} strokeWidth={3} />
                </View>
              </Squircle>
            </TouchableOpacity>

            {currentIndex < ONBOARDING_DATA.length - 1 && (
              <TouchableOpacity onPress={handleSkip} className="items-center py-2">
                <Text style={{ color: colors.text.muted, fontFamily: typography.fontFamily.body }}>
                  Skip
                </Text>
              </TouchableOpacity>
            )}
            {currentIndex === ONBOARDING_DATA.length - 1 && (
              <View className="py-2" /> // Spacer to keep layout consistent
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
