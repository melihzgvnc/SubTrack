/**
 * Pure utility functions for calculating spending data
 * All functions are stateless and can be easily tested
 */

import {
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInMonths,
  format,
  isAfter,
  isBefore,
  min,
  max,
} from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import i18n from '../lib/i18n';
import type { Subscription } from '../store/useSubStore';
import type {
  TimeRange,
  CategorySpending,
  SpendingTrendPoint,
  SpendingExtreme,
} from '../types/insights';
import { CATEGORY_COLORS, CATEGORY_SHORT_NAMES } from '../types/insights';

/**
 * Get the current date-fns locale based on i18n language
 */
function getDateLocale() {
  const currentLanguage = i18n.language;
  return currentLanguage === 'tr' ? tr : enUS;
}

/**
 * Calculate the monthly equivalent price for a subscription
 */
export function getMonthlyPrice(subscription: Subscription): number {
  return subscription.cycle === 'monthly'
    ? subscription.price
    : subscription.price / 12;
}

/**
 * Get the date range for a given time range option
 */
export function getDateRangeForTimeRange(
  timeRange: TimeRange,
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date } {
  const endDate = endOfMonth(referenceDate);

  switch (timeRange) {
    case 'current_month':
      return {
        startDate: startOfMonth(referenceDate),
        endDate,
      };
    case 'last_3_months':
      return {
        startDate: startOfMonth(subMonths(referenceDate, 2)),
        endDate,
      };
    case 'last_year':
      return {
        startDate: startOfMonth(subMonths(referenceDate, 11)),
        endDate,
      };
    case 'lifetime':
      // Return a very old start date; actual calculation will use subscription start dates
      return {
        startDate: new Date(2000, 0, 1),
        endDate,
      };
  }
}

/**
 * Check if a subscription was active during a specific month
 */
export function wasActiveInMonth(
  subscription: Subscription,
  monthStart: Date,
  monthEnd: Date
): boolean {
  const subStart = new Date(subscription.startDate);
  // Subscription is active if it started before or during the month
  return isBefore(subStart, monthEnd) || subStart <= monthEnd;
}

/**
 * Calculate spending for a subscription within a date range
 * Returns the total amount spent during the period
 */
export function calculateSubscriptionSpending(
  subscription: Subscription,
  startDate: Date,
  endDate: Date
): number {
  const subStart = new Date(subscription.startDate);

  // If subscription started after the end date, no spending
  if (isAfter(subStart, endDate)) {
    return 0;
  }

  // Effective start is the later of subscription start or range start
  const effectiveStart = max([subStart, startDate]);

  // Calculate months of activity (at least 1 if active at all)
  const monthsActive = Math.max(
    1,
    differenceInMonths(endDate, effectiveStart) + 1
  );

  const monthlyPrice = getMonthlyPrice(subscription);
  return monthlyPrice * monthsActive;
}

/**
 * Calculate total lifetime spending for a subscription
 */
export function calculateLifetimeSpending(
  subscription: Subscription,
  referenceDate: Date = new Date()
): { totalSpent: number; monthsActive: number } {
  const subStart = new Date(subscription.startDate);

  if (isAfter(subStart, referenceDate)) {
    return { totalSpent: 0, monthsActive: 0 };
  }

  const monthsActive = Math.max(1, differenceInMonths(referenceDate, subStart) + 1);
  const monthlyPrice = getMonthlyPrice(subscription);

  return {
    totalSpent: monthlyPrice * monthsActive,
    monthsActive,
  };
}

/**
 * Get spending aggregated by category for a given time range
 */
export function getCategorySpending(
  subscriptions: Subscription[],
  timeRange: TimeRange,
  referenceDate: Date = new Date()
): CategorySpending[] {
  if (subscriptions.length === 0) {
    return [];
  }

  const { startDate, endDate } = getDateRangeForTimeRange(timeRange, referenceDate);

  // Aggregate spending by category
  const categoryMap = new Map<string, { amount: number; count: number }>();

  subscriptions.forEach((sub) => {
    const spending = calculateSubscriptionSpending(sub, startDate, endDate);

    if (spending > 0) {
      const existing = categoryMap.get(sub.category) || { amount: 0, count: 0 };
      categoryMap.set(sub.category, {
        amount: existing.amount + spending,
        count: existing.count + 1,
      });
    }
  });

  // Convert to array and sort by amount (descending)
  const result: CategorySpending[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      shortName: CATEGORY_SHORT_NAMES[category] || category,
      amount: data.amount,
      color: CATEGORY_COLORS[category] || '#94A3B8',
      subscriptionCount: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  return result;
}

/**
 * Get monthly spending trend data points
 * Returns data for each month from the earliest subscription to now
 * Limited to last 24 months for performance by default
 * @param subscriptions - Array of subscriptions
 * @param referenceDate - The current reference date (usually today)
 * @param maxMonths - Maximum number of months to show (default: 24)
 * @param limitToTimeRange - Optional time range to limit the trend data
 */
export function getSpendingTrend(
  subscriptions: Subscription[],
  referenceDate: Date = new Date(),
  maxMonths: number = 24,
  limitToTimeRange?: TimeRange
): SpendingTrendPoint[] {
  if (subscriptions.length === 0) {
    return [];
  }

  // Find the earliest subscription start date
  const earliestStart = subscriptions.reduce((earliest, sub) => {
    const subStart = new Date(sub.startDate);
    return subStart < earliest ? subStart : earliest;
  }, new Date(subscriptions[0].startDate));

  // If a time range is specified, limit the trend to that range
  let effectiveStartDate = earliestStart;
  if (limitToTimeRange) {
    const { startDate } = getDateRangeForTimeRange(limitToTimeRange, referenceDate);
    effectiveStartDate = max([earliestStart, startDate]);
  }

  // Calculate how many months to show (capped at maxMonths)
  const totalMonths = Math.min(
    maxMonths,
    differenceInMonths(referenceDate, effectiveStartDate) + 1
  );

  const trendData: SpendingTrendPoint[] = [];

  for (let i = totalMonths - 1; i >= 0; i--) {
    const monthDate = subMonths(referenceDate, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    // Calculate total spending for this month
    // Only count subscriptions that were active for at least part of this month
    let monthlyTotal = 0;
    subscriptions.forEach((sub) => {
      const subStart = new Date(sub.startDate);

      // Skip if subscription started after this month
      if (isAfter(subStart, monthEnd)) {
        return;
      }

      // If subscription started this month or earlier, count it
      // This gives a more accurate representation of actual spending commitment
      if (isBefore(subStart, monthEnd) || subStart <= monthEnd) {
        monthlyTotal += getMonthlyPrice(sub);
      }
    });

    trendData.push({
      date: monthStart,
      label: format(monthStart, 'MMM yy', { locale: getDateLocale() }),
      totalSpending: monthlyTotal,
    });
  }

  return trendData;
}

/**
 * Get the subscriptions with highest and lowest lifetime spending
 */
export function getSpendingExtremes(
  subscriptions: Subscription[],
  referenceDate: Date = new Date()
): { most: SpendingExtreme | null; least: SpendingExtreme | null } {
  if (subscriptions.length === 0) {
    return { most: null, least: null };
  }

  const withSpending = subscriptions.map((sub) => {
    const { totalSpent, monthsActive } = calculateLifetimeSpending(sub, referenceDate);
    return {
      subscription: sub,
      totalSpent,
      monthsActive,
    };
  });

  // Sort by total spent
  const sorted = [...withSpending].sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    most: sorted[0] || null,
    least: sorted[sorted.length - 1] || null,
  };
}

/**
 * Calculate total spending for a time range
 */
export function getTotalSpending(
  subscriptions: Subscription[],
  timeRange: TimeRange,
  referenceDate: Date = new Date()
): number {
  const { startDate, endDate } = getDateRangeForTimeRange(timeRange, referenceDate);

  return subscriptions.reduce((total, sub) => {
    return total + calculateSubscriptionSpending(sub, startDate, endDate);
  }, 0);
}

/**
 * Calculate percentage change from previous period
 */
export function getPercentageChange(
  subscriptions: Subscription[],
  timeRange: TimeRange,
  referenceDate: Date = new Date()
): number | null {
  // For lifetime, there's no "previous period"
  if (timeRange === 'lifetime') {
    return null;
  }

  const currentSpending = getTotalSpending(subscriptions, timeRange, referenceDate);

  // Calculate previous period
  let previousReferenceDate: Date;
  switch (timeRange) {
    case 'current_month':
      previousReferenceDate = subMonths(referenceDate, 1);
      break;
    case 'last_3_months':
      previousReferenceDate = subMonths(referenceDate, 3);
      break;
    case 'last_year':
      previousReferenceDate = subMonths(referenceDate, 12);
      break;
    default:
      return null;
  }

  const previousSpending = getTotalSpending(subscriptions, timeRange, previousReferenceDate);

  if (previousSpending === 0) {
    return currentSpending > 0 ? 100 : null;
  }

  return ((currentSpending - previousSpending) / previousSpending) * 100;
}
