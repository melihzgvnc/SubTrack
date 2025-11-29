/**
 * Insights Screen (Stats)
 * 
 * FREE TIER:
 * - Category spending bar chart (current month)
 * - Category flip cards
 * 
 * PRO TIER:
 * - Enhanced category chart with time range selection
 * - Spending trend line chart
 * - Most/Least spent subscription cards
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Music, ShoppingBag, MonitorPlay, Briefcase, Zap } from 'lucide-react-native';
import { useSubStore } from '../store/useSubStore';
import { useProStore } from '../store/useProStore';
import { useSpendingCalculations } from '../hooks/useSpendingCalculations';
import { useResponsiveValue } from '../hooks/useResponsive';
import { GlassCard } from '../components/ui/GlassCard';
import {
  CategorySpendingChart,
  SpendingTrendChart,
  SpendingExtremesCards,
  ProFeatureTeaser,
} from '../components/insights';
import { PaywallModal } from '../components/PaywallModal';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { TimeRange } from '../types/insights';

// ============================================================================
// Category Card Component
// ============================================================================

interface CategoryCardProps {
  title: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
  height?: number;
  category: string;
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  count,
  icon: Icon,
  color,
  height = 200,
  category,
  selectedCategory,
  onSelect,
}) => {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const [flipAnim] = useState(new Animated.Value(0));
  const isFlipped = selectedCategory === title;

  React.useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, flipAnim]);

  const flipToFrontStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const flipToBackStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  const subs = useMemo(() => {
    if (!category) return [];
    return subscriptions.filter((s) => s.category === category);
  }, [category, subscriptions]);

  return (
    <TouchableOpacity
      onPress={() => onSelect(isFlipped ? null : title)}
      activeOpacity={0.8}
      style={{ width: '48%', marginBottom: spacing.md, height }}
      accessibilityRole="button"
      accessibilityLabel={`${title} category with ${count} subscriptions`}
    >
      {/* Front of Card */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
          },
          flipToFrontStyle,
        ]}
      >
        <GlassCard style={{ height: '100%' }}>
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'flex-end' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.border.highlight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon color={color} size={20} />
              </View>
            </View>
            <View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.xl,
                  fontWeight: 'bold',
                  marginBottom: spacing.xxs,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                }}
              >
                {count} subs
              </Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Back of Card */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
          },
          flipToBackStyle,
        ]}
      >
        <GlassCard style={{ height: '100%' }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.sm,
              }}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.lg,
                  fontWeight: 'bold',
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.xs,
                }}
              >
                {subs.length}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {subs.map((sub) => (
                <View
                  key={sub.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: colors.border.subtle,
                    padding: spacing.xs,
                    borderRadius: spacing.sm,
                    marginBottom: 6,
                    borderWidth: 1,
                    borderColor: colors.border.highlight,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: sub.color + '20',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: typography.size.xs,
                          fontWeight: 'bold',
                          color: sub.color,
                        }}
                      >
                        {sub.name[0]}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.text.primary,
                          fontSize: typography.size.xs,
                          fontWeight: '600',
                        }}
                        numberOfLines={1}
                      >
                        {sub.name}
                      </Text>
                      <Text
                        style={{
                          color: colors.text.secondary,
                          fontSize: 10,
                        }}
                      >
                        {sub.cycle}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.xs,
                      fontWeight: 'bold',
                    }}
                  >
                    {sub.currency}
                    {sub.price.toFixed(2)}
                  </Text>
                </View>
              ))}
              {subs.length === 0 && (
                <Text
                  style={{
                    color: colors.text.secondary,
                    textAlign: 'center',
                    marginTop: spacing.lg,
                    fontSize: typography.size.xs,
                  }}
                >
                  No subscriptions
                </Text>
              )}
            </ScrollView>
          </View>
        </GlassCard>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================================
// Main Stats Screen
// ============================================================================

export default function Stats() {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const currency = useSubStore((state) => state.currency);
  const { isPro } = useProStore();

  // State
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('current_month');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Calculate insights data using the custom hook
  const {
    categorySpending,
    spendingTrend,
    mostSpentApp,
    leastSpentApp,
    totalSpending,
    percentageChange,
  } = useSpendingCalculations(subscriptions, selectedTimeRange, {
    includePro: isPro,
  });

  // Responsive category card height
  const categoryCardHeight = useResponsiveValue({
    sm: 150,
    md: 165,
    lg: 200,
    xl: 220,
    default: 165,
  });

  // Calculate category counts
  const getCategoryCount = (cat: string) =>
    subscriptions.filter((s) => s.category === cat).length;

  // Handle time range change - only for Pro users
  const handleTimeRangeChange = (range: TimeRange) => {
    if (isPro) {
      setSelectedTimeRange(range);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView
        className="flex-1 px-4 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.bottomScroll }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <Text 
            className="text-white text-3xl"
            style={{ fontFamily: typography.fontFamily.display }}
          >
            Insights
          </Text>
        </View>

        {/* Category Spending Chart - FREE (enhanced for Pro) */}
        <CategorySpendingChart
          data={categorySpending}
          currency={currency}
          totalSpending={totalSpending}
          percentageChange={percentageChange}
          isPro={isPro}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />

        {/* Pro-Only Features */}
        {isPro ? (
          <>
            {/* Spending Trend Line Chart */}
            <SpendingTrendChart data={spendingTrend} currency={currency} />

            {/* Most/Least Spent Cards */}
            <SpendingExtremesCards
              mostSpent={mostSpentApp}
              leastSpent={leastSpentApp}
              currency={currency}
            />
          </>
        ) : (
          <ProFeatureTeaser onUnlock={() => setShowPaywall(true)} />
        )}

        {/* Categories Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text 
            className="text-white text-xl"
            style={{ fontFamily: typography.fontFamily.display }}
          >
            Categories
          </Text>
        </View>

        {/* Category Grid */}
        <View className="flex-row flex-wrap justify-between pb-24">
          <CategoryCard
            title="Media"
            count={getCategoryCount('Entertainment')}
            icon={MonitorPlay}
            color={colors.accent.secondary}
            height={categoryCardHeight}
            category="Entertainment"
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <CategoryCard
            title="Music"
            count={getCategoryCount('Music')}
            icon={Music}
            color={colors.accent.quaternary}
            height={categoryCardHeight}
            category="Music"
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <CategoryCard
            title="Shopping"
            count={getCategoryCount('Shopping')}
            icon={ShoppingBag}
            color={colors.accent.tertiary}
            height={categoryCardHeight}
            category="Shopping"
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <CategoryCard
            title="Work"
            count={getCategoryCount('Productivity')}
            icon={Briefcase}
            color={colors.accent.primary}
            height={categoryCardHeight}
            category="Productivity"
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <CategoryCard
            title="Utilities"
            count={getCategoryCount('Utilities')}
            icon={Zap}
            color={colors.text.primary}
            height={categoryCardHeight}
            category="Utilities"
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <CategoryCard
            title="Other"
            count={getCategoryCount('Other')}
            icon={Zap}
            color={colors.accent.neutral}
            height={categoryCardHeight}
            category="Other"
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>
      </ScrollView>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
