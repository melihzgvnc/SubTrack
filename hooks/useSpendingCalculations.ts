/**
 * Custom hook for calculating spending insights data
 * Provides memoized calculations for the Insights screen
 */

import { useMemo } from 'react';
import type { Subscription } from '../store/useSubStore';
import type { TimeRange, InsightsData } from '../types/insights';
import {
  getCategorySpending,
  getSpendingTrend,
  getSpendingExtremes,
  getTotalSpending,
  getPercentageChange,
} from '../utils/spendingCalculations';

interface UseSpendingCalculationsOptions {
  /** Whether to calculate Pro-only features (trend, extremes) */
  includePro?: boolean;
  /** Maximum months for trend chart */
  maxTrendMonths?: number;
}

/**
 * Hook that calculates all spending insights data
 * Memoizes calculations to prevent unnecessary recalculations
 */
export function useSpendingCalculations(
  subscriptions: Subscription[],
  timeRange: TimeRange,
  options: UseSpendingCalculationsOptions = {}
): InsightsData {
  const { includePro = true, maxTrendMonths = 24 } = options;

  // Memoize the reference date to prevent recalculations on every render
  // Only update when the component mounts or subscriptions change significantly
  const referenceDate = useMemo(() => new Date(), []);

  // Category spending - calculated for all users
  const categorySpending = useMemo(
    () => getCategorySpending(subscriptions, timeRange, referenceDate),
    [subscriptions, timeRange, referenceDate]
  );

  // Total spending for the selected time range
  const totalSpending = useMemo(
    () => getTotalSpending(subscriptions, timeRange, referenceDate),
    [subscriptions, timeRange, referenceDate]
  );

  // Percentage change from previous period
  const percentageChange = useMemo(
    () => getPercentageChange(subscriptions, timeRange, referenceDate),
    [subscriptions, timeRange, referenceDate]
  );

  // Spending trend - Pro only, but always calculate if includePro is true
  const spendingTrend = useMemo(() => {
    if (!includePro) {
      return [];
    }
    return getSpendingTrend(subscriptions, referenceDate, maxTrendMonths);
  }, [subscriptions, referenceDate, maxTrendMonths, includePro]);

  // Spending extremes - Pro only
  const { most: mostSpentApp, least: leastSpentApp } = useMemo(() => {
    if (!includePro) {
      return { most: null, least: null };
    }
    return getSpendingExtremes(subscriptions, referenceDate);
  }, [subscriptions, referenceDate, includePro]);

  return {
    categorySpending,
    spendingTrend,
    mostSpentApp,
    leastSpentApp,
    totalSpending,
    percentageChange,
  };
}

/**
 * Hook for category spending only (Free tier)
 * Lighter weight version that skips Pro calculations
 */
export function useCategorySpending(
  subscriptions: Subscription[],
  timeRange: TimeRange = 'current_month'
) {
  const referenceDate = useMemo(() => new Date(), []);

  const categorySpending = useMemo(
    () => getCategorySpending(subscriptions, timeRange, referenceDate),
    [subscriptions, timeRange, referenceDate]
  );

  const totalSpending = useMemo(
    () => getTotalSpending(subscriptions, timeRange, referenceDate),
    [subscriptions, timeRange, referenceDate]
  );

  const percentageChange = useMemo(
    () => getPercentageChange(subscriptions, timeRange, referenceDate),
    [subscriptions, timeRange, referenceDate]
  );

  return {
    categorySpending,
    totalSpending,
    percentageChange,
  };
}
