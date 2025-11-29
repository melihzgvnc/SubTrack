/**
 * Spending Extremes Cards
 * PRO ONLY - Shows most and least spent subscriptions
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { GlassCard } from '../ui/GlassCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { SpendingExtreme } from '../../types/insights';

interface SpendingExtremesCardsProps {
  mostSpent: SpendingExtreme | null;
  leastSpent: SpendingExtreme | null;
  currency: { code: string; symbol: string };
}

interface ExtremeCardProps {
  type: 'most' | 'least';
  data: SpendingExtreme | null;
  currency: { code: string; symbol: string };
}

const ExtremeCard: React.FC<ExtremeCardProps> = ({ type, data, currency }) => {
  const isMost = type === 'most';
  const Icon = isMost ? TrendingUp : TrendingDown;
  const iconColor = isMost ? colors.accent.primary : colors.accent.tertiary;
  const label = isMost ? 'Most Spent' : 'Least Spent';

  if (!data) {
    return (
      <GlassCard style={styles.card}>
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <Icon color={iconColor} size={20} />
          </View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.emptyText}>No data</Text>
        </View>
      </GlassCard>
    );
  }

  const { subscription, totalSpent, monthsActive } = data;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardContent}>
        {/* Icon Badge */}
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Icon color={iconColor} size={20} />
        </View>

        {/* Label */}
        <Text
          style={styles.label}
          allowFontScaling
          maxFontSizeMultiplier={1.2}
        >
          {label}
        </Text>

        {/* Subscription Avatar */}
        <View
          style={[
            styles.avatar,
            { backgroundColor: `${subscription.color || colors.accent.secondary}30` },
          ]}
        >
          <Text
            style={[styles.avatarText, { color: subscription.color || colors.accent.secondary }]}
          >
            {subscription.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Subscription Name */}
        <Text
          style={styles.subscriptionName}
          numberOfLines={1}
          allowFontScaling
          maxFontSizeMultiplier={1.2}
        >
          {subscription.name}
        </Text>

        {/* Total Spent */}
        <Text
          style={styles.totalSpent}
          allowFontScaling
          maxFontSizeMultiplier={1.2}
        >
          {currency.symbol}
          {totalSpent.toFixed(2)}
        </Text>

        {/* Duration */}
        <Text
          style={styles.duration}
          allowFontScaling
          maxFontSizeMultiplier={1.3}
        >
          {monthsActive} {monthsActive === 1 ? 'month' : 'months'}
        </Text>
      </View>
    </GlassCard>
  );
};

export const SpendingExtremesCards: React.FC<SpendingExtremesCardsProps> = ({
  mostSpent,
  leastSpent,
  currency,
}) => {
  // Don't render if no data at all
  if (!mostSpent && !leastSpent) {
    return null;
  }

  // If only one subscription, most and least are the same - show only most
  const showBoth = mostSpent?.subscription.id !== leastSpent?.subscription.id;

  return (
    <View style={styles.container}>
      <Text
        style={styles.sectionTitle}
        allowFontScaling
        maxFontSizeMultiplier={1.2}
      >
        Spending Insights
      </Text>
      <View style={styles.cardsRow}>
        <ExtremeCard type="most" data={mostSpent} currency={currency} />
        {showBoth && (
          <ExtremeCard type="least" data={leastSpent} currency={currency} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    minHeight: 180,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: '500',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  subscriptionName: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: '600',
    marginBottom: spacing.xxs,
    textAlign: 'center',
    maxWidth: '90%',
  },
  totalSpent: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  duration: {
    color: colors.text.secondary,
    fontSize: typography.size.xs,
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    marginTop: spacing.md,
  },
});
