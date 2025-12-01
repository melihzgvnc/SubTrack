/**
 * Type definitions for the Insights screen
 * Supports both Free and Pro tier features
 */

import type { Subscription } from '../store/useSubStore';

/**
 * Time range options for filtering spending data
 * - current_month: Current calendar month only
 * - last_3_months: Rolling 3 months including current
 * - last_year: Rolling 12 months including current
 * - lifetime: All time since first subscription
 */
export type TimeRange = 'current_month' | 'last_3_months' | 'last_year' | 'lifetime';

/**
 * Spending data aggregated by category
 */
export interface CategorySpending {
  /** Category name (e.g., 'Entertainment', 'Music') */
  category: string;
  /** Short display name for chart labels */
  shortName: string;
  /** Total spending amount for the time period */
  amount: number;
  /** Theme color for the category */
  color: string;
  /** Number of subscriptions in this category */
  subscriptionCount: number;
}

/**
 * Single data point for the spending trend chart
 */
export interface SpendingTrendPoint {
  /** The month/year this point represents */
  date: Date;
  /** Display label (e.g., "Jan 24", "Feb 24") */
  label: string;
  /** Total monthly spending at this point */
  totalSpending: number;
}

/**
 * Subscription with its total lifetime spending
 */
export interface SpendingExtreme {
  /** The subscription */
  subscription: Subscription;
  /** Total amount spent on this subscription since start */
  totalSpent: number;
  /** Number of months the subscription has been active */
  monthsActive: number;
}

/**
 * Complete insights data structure
 */
export interface InsightsData {
  /** Spending broken down by category */
  categorySpending: CategorySpending[];
  /** Monthly spending trend over time */
  spendingTrend: SpendingTrendPoint[];
  /** Subscription with highest lifetime spending */
  mostSpentApp: SpendingExtreme | null;
  /** Subscription with lowest lifetime spending */
  leastSpentApp: SpendingExtreme | null;
  /** Total spending for the selected time range */
  totalSpending: number;
  /** Percentage change from previous period */
  percentageChange: number | null;
}

/**
 * Time range option for the selector UI
 */
export interface TimeRangeOption {
  value: TimeRange;
  labelKey: string;
  shortLabelKey: string;
}

/**
 * Available time range options with translation keys
 */
export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 'current_month', labelKey: 'stats.timeRanges.currentMonth', shortLabelKey: 'stats.timeRanges.currentMonthShort' },
  { value: 'last_3_months', labelKey: 'stats.timeRanges.last3Months', shortLabelKey: 'stats.timeRanges.last3MonthsShort' },
  { value: 'last_year', labelKey: 'stats.timeRanges.lastYear', shortLabelKey: 'stats.timeRanges.lastYearShort' },
  { value: 'lifetime', labelKey: 'stats.timeRanges.lifetime', shortLabelKey: 'stats.timeRanges.lifetimeShort' },
];

/**
 * Category color mapping
 */
export const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment': '#B5DEFF', // Neon Blue
  'Productivity': '#FFB5E8',  // Neon Pink
  'Utilities': '#B5FFCD',     // Neon Green
  'Music': '#E7B5FF',         // Neon Purple
  'Shopping': '#FFB5E8',      // Neon Pink
  'Other': '#FEF3C7',         // Soft Yellow
};

/**
 * Category short names for chart labels
 */
export const CATEGORY_SHORT_NAMES: Record<string, string> = {
  'Entertainment': 'Media',
  'Productivity': 'Work',
  'Utilities': 'Utils',
  'Music': 'Music',
  'Shopping': 'Shop',
  'Other': 'Other',
};
