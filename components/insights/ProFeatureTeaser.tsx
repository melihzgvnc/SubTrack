/**
 * Pro Feature Teaser Component
 * Shows a collapsible preview of Pro features with unlock CTA for free users
 * Initially displays as a button, expands to show full feature list
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { TrendingUp, BarChart3, Crown, ChevronDown } from 'lucide-react-native';
import { GlassCard } from '../ui/GlassCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTranslation } from 'react-i18next';

interface ProFeatureTeaserProps {
  onUnlock: () => void;
}

// Approximate height of expanded content
const EXPANDED_HEIGHT = 340;
const COLLAPSED_HEIGHT = 56;

export const ProFeatureTeaser: React.FC<ProFeatureTeaserProps> = ({ onUnlock }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = useSharedValue(0);

  // Dynamic height measurements
  const headerHeight = useSharedValue(COLLAPSED_HEIGHT);
  const contentHeight = useSharedValue(EXPANDED_HEIGHT - COLLAPSED_HEIGHT);

  const features = [
    {
      icon: BarChart3,
      title: t('stats.pro.features.timeRange.title'),
      description: t('stats.pro.features.timeRange.description'),
    },
    {
      icon: TrendingUp,
      title: t('stats.pro.features.trends.title'),
      description: t('stats.pro.features.trends.description'),
    },
    {
      icon: Crown,
      title: t('stats.pro.features.insights.title'),
      description: t('stats.pro.features.insights.description'),
    },
  ];

  const toggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    progress.value = withTiming(newExpanded ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  };

  // Animated styles for the container height
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const collapsedH = headerHeight.value;
    const expandedH = headerHeight.value + contentHeight.value;

    const height = interpolate(
      progress.value,
      [0, 1],
      [collapsedH, expandedH]
    );

    return {
      height,
      overflow: 'hidden',
    };
  });

  // Animated styles for chevron rotation
  const chevronAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progress.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  // Animated styles for expanded content opacity
  const expandedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.3, 1], [0, 1]);
    const translateY = interpolate(progress.value, [0, 1], [-20, 0]);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Animated styles for collapsed content opacity
  const collapsedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.3], [1, 0]);

    return {
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.wrapper, containerAnimatedStyle]}>
      <View style={styles.container}>
        {/* Collapsed Header - Always visible */}
        <TouchableOpacity
          style={styles.header}
          onPress={toggleExpand}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? "Collapse Pro features" : "Discover advanced stats"}
          accessibilityHint="Tap to toggle Pro features preview"
          onLayout={(e) => {
            headerHeight.value = e.nativeEvent.layout.height;
          }}
        >
          <View style={styles.headerLeft}>
            <Crown color={colors.accent.neutral} size={18} />
            <Animated.View style={collapsedContentStyle}>
              <Text style={styles.headerText}>{t('stats.pro.discover')}</Text>
            </Animated.View>
            <Animated.View style={[styles.proBadgeInline, expandedContentStyle]}>
              <Text style={styles.proBadgeText}>{t('paywall.pro')}</Text>
            </Animated.View>
          </View>
          <Animated.View style={chevronAnimatedStyle}>
            <ChevronDown color={colors.text.secondary} size={20} />
          </Animated.View>
        </TouchableOpacity>

        {/* Expanded Content */}
        <Animated.View
          style={[styles.expandedContent, expandedContentStyle]}
          onLayout={(e) => {
            contentHeight.value = e.nativeEvent.layout.height;
          }}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text
              style={styles.title}
              allowFontScaling
              maxFontSizeMultiplier={1.2}
            >
              {t('stats.pro.unlockTitle')}
            </Text>
            <Text
              style={styles.subtitle}
              allowFontScaling
              maxFontSizeMultiplier={1.3}
            >
              {t('stats.pro.unlockSubtitle')}
            </Text>
          </View>

          {/* Feature List */}
          <View style={styles.featureList}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Icon color={colors.accent.secondary} size={18} />
                  </View>
                  <View style={styles.featureText}>
                    <Text
                      style={styles.featureTitle}
                      allowFontScaling
                      maxFontSizeMultiplier={1.2}
                    >
                      {feature.title}
                    </Text>
                    <Text
                      style={styles.featureDescription}
                      allowFontScaling
                      maxFontSizeMultiplier={1.3}
                    >
                      {feature.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onUnlock}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Unlock Pro features"
          >
            <Text style={styles.ctaText}>{t('stats.pro.unlockButton')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xxl,
    borderRadius: 16,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.highlight,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: COLLAPSED_HEIGHT,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
  proBadgeInline: {
    backgroundColor: 'rgba(254, 243, 199, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    position: 'absolute',
    left: 28,
  },
  proBadgeText: {
    color: colors.accent.neutral,
    fontSize: typography.size.xs,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  expandedContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
  featureList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(181, 222, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    color: colors.text.secondary,
    fontSize: typography.size.xs,
  },
  ctaButton: {
    backgroundColor: colors.accent.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.text.inverse,
    fontSize: typography.size.sm,
    fontWeight: 'bold',
  },
});
