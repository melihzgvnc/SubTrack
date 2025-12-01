/**
 * Category Spending Bar Chart
 * Available for FREE users (current month)
 * Enhanced for PRO users (with time range selection)
 * Features smooth bar height animations when data changes
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { TimeRangeSelector } from './TimeRangeSelector';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { CategorySpending, TimeRange } from '../../types/insights';
import { useResponsiveValue } from '../../hooks/useResponsive';
import { useTranslation } from 'react-i18next';

// Animated bar component for smooth height transitions
interface AnimatedBarProps {
  height: number;
  color: string;
  label: string;
  value: string;
  categoryLabel: string;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({
  height,
  color,
  label,
  value,
  categoryLabel,
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: height,
      friction: 8,
      tension: 40,
      useNativeDriver: false, // height animation requires non-native driver
    }).start();
  }, [height, heightAnim]);

  return (
    <View style={styles.barWrapper}>
      <Text
        style={styles.barValue}
        allowFontScaling
        maxFontSizeMultiplier={1.2}
      >
        {value}
      </Text>
      <Animated.View
        style={[
          styles.bar,
          {
            height: heightAnim,
            backgroundColor: color,
          },
        ]}
        accessibilityLabel={label}
      />
      <Text
        style={styles.barLabel}
        allowFontScaling
        maxFontSizeMultiplier={1.2}
      >
        {categoryLabel}
      </Text>
    </View>
  );
};

interface CategorySpendingChartProps {
  data: CategorySpending[];
  currency: { code: string; symbol: string };
  totalSpending: number;
  percentageChange: number | null;
  isPro: boolean;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  chartHeight?: number;
}

export const CategorySpendingChart: React.FC<CategorySpendingChartProps> = ({
  data,
  currency,
  totalSpending,
  percentageChange,
  isPro,
  selectedTimeRange,
  onTimeRangeChange,
  chartHeight: customChartHeight,
}) => {
  const { t } = useTranslation();
  // Responsive chart height
  const defaultChartHeight = useResponsiveValue({
    sm: 140,
    md: 160,
    lg: 180,
    xl: 200,
    default: 160,
  });

  const chartHeight = customChartHeight || defaultChartHeight;

  // Calculate max value for scaling bars
  const maxValue = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((c) => c.amount), 1);
  }, [data]);

  // Format percentage change text
  const changeText = useMemo(() => {
    if (percentageChange === null) return null;
    const isIncrease = percentageChange > 0;
    const prefix = isIncrease ? '+' : '';
    return `${prefix}${percentageChange.toFixed(1)}%`;
  }, [percentageChange]);

  const isIncrease = percentageChange !== null && percentageChange > 0;

  return (
    <GlassCard style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text
            style={styles.label}
            allowFontScaling
            maxFontSizeMultiplier={1.3}
          >
            {t('stats.totalSpending')}
          </Text>
          <Text
            style={styles.totalAmount}
            allowFontScaling
            maxFontSizeMultiplier={1.2}
          >
            {currency.symbol}
            {totalSpending.toFixed(2)}
          </Text>
        </View>

        {changeText && (
          <View
            style={[
              styles.changeBadge,
              isIncrease ? styles.changeBadgeIncrease : styles.changeBadgeDecrease,
            ]}
          >
            <Text
              style={[
                styles.changeText,
                isIncrease ? styles.changeTextIncrease : styles.changeTextDecrease,
              ]}
              allowFontScaling
              maxFontSizeMultiplier={1.2}
            >
              {selectedTimeRange === 'current_month' ? t('stats.thisMonth') + ' ' : ''}
              {changeText}
            </Text>
          </View>
        )}
      </View>

      {/* Time Range Selector - Pro Only */}
      {isPro && (
        <View style={styles.selectorContainer}>
          <TimeRangeSelector
            value={selectedTimeRange}
            onChange={onTimeRangeChange}
          />
        </View>
      )}

      {/* Chart Section */}
      {data.length === 0 ? (
        <View style={styles.emptyState}>
          <Text
            style={styles.emptyText}
            allowFontScaling
            maxFontSizeMultiplier={1.3}
          >
            {t('stats.noSubscriptionsYet')}
          </Text>
        </View>
      ) : (
        <View style={[styles.chartContainer, { height: chartHeight }]}>
          {data.map((category) => {
            const heightPercentage = (category.amount / maxValue) * 100;
            const maxBarHeight = chartHeight - 40; // Leave room for labels
            
            // Calculate bar height with proper proportional scaling
            // Use a minimum of 8px for visibility, but maintain proportions
            const calculatedHeight = (heightPercentage / 100) * maxBarHeight;
            const barHeight = Math.max(calculatedHeight, 8);

            const getCategoryKey = (cat: string) => {
              switch (cat) {
                case 'Entertainment': return 'categories.media';
                case 'Productivity': return 'categories.work';
                case 'Utilities': return 'categories.utilities';
                case 'Music': return 'categories.music';
                case 'Shopping': return 'categories.shopping';
                case 'Other': return 'categories.other';
                default: return 'categories.other';
              }
            };

            return (
              <AnimatedBar
                key={category.category}
                height={barHeight}
                color={category.color}
                label={`${category.category}: ${currency.symbol}${category.amount.toFixed(2)}`}
                value={`${currency.symbol}${category.amount.toFixed(0)}`}
                categoryLabel={t(getCategoryKey(category.category))}
              />
            );
          })}
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: '500',
    marginBottom: spacing.xxs,
  },
  totalAmount: {
    color: colors.text.primary,
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -1,
  },
  changeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 20,
  },
  changeBadgeIncrease: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red tint
  },
  changeBadgeDecrease: {
    backgroundColor: 'rgba(181, 255, 205, 0.2)', // Green tint
  },
  changeText: {
    fontSize: typography.size.xs,
    fontWeight: '600',
  },
  changeTextIncrease: {
    color: '#EF4444', // Red
  },
  changeTextDecrease: {
    color: colors.accent.tertiary, // Neon Green
  },
  selectorContainer: {
    marginBottom: spacing.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  barWrapper: {
    alignItems: 'center',
  },
  barValue: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '500',
    marginBottom: spacing.xxs,
  },
  bar: {
    width: 48,
    borderRadius: 24,
    marginBottom: spacing.xs,
  },
  barLabel: {
    color: colors.text.secondary,
    fontSize: typography.size.xs,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
  },
});
