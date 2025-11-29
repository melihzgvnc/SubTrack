# Insights Screen Enhancement - Implementation Plan

## Overview

This document outlines the production-grade implementation plan for enhancing the Insights screen with tiered features for Free and Pro users.

---

## Current State Analysis

### Existing Implementation
- **Chart Library**: `react-native-gifted-charts` v1.4.66 (already installed)
- **State Management**: Zustand with AsyncStorage persistence
- **Pro Status**: Managed via `useProStore` with RevenueCat integration
- **Data Model**: Subscriptions have `startDate`, `price`, `cycle`, `category`

### Current Issue
The spending-per-category bar chart is currently **blocked for free users** but should be **available for free**.

---

## Feature Tier Breakdown

### 🆓 FREE TIER
| Feature | Description |
|---------|-------------|
| Category Spending Chart | Bar chart showing spending per category (current month only) |
| Category Cards | Flip cards showing subscriptions per category |

### 👑 PRO TIER
| Feature | Description |
|---------|-------------|
| Enhanced Category Chart | Time range selector: Current Month, Last 3 Months, 1 Year, Lifetime |
| Spending Trend Chart | Line graph showing spending trend over lifetime |
| Most Spent App | Stat card showing the app with highest total spending |
| Least Spent App | Stat card showing the app with lowest total spending |

---

## Technical Architecture

### 1. New Components Structure

```
SubTrack/
├── components/
│   └── insights/
│       ├── CategorySpendingChart.tsx    # Bar chart (Free + Pro enhanced)
│       ├── SpendingTrendChart.tsx       # Line chart (Pro only)
│       ├── SpendingExtremesCards.tsx    # Most/Least spent cards (Pro only)
│       ├── TimeRangeSelector.tsx        # Dropdown for time range (Pro only)
│       └── index.ts                     # Barrel export
├── hooks/
│   └── useSpendingCalculations.ts       # Centralized spending logic
├── utils/
│   └── spendingCalculations.ts          # Pure calculation functions
└── types/
    └── insights.ts                      # Type definitions
```

### 2. Type Definitions

```typescript
// types/insights.ts

export type TimeRange = 'current_month' | 'last_3_months' | 'last_year' | 'lifetime';

export interface CategorySpending {
  category: string;
  amount: number;
  color: string;
  subscriptionCount: number;
}

export interface SpendingTrendPoint {
  date: Date;
  label: string;        // e.g., "Jan 24", "Feb 24"
  totalSpending: number;
}

export interface SpendingExtreme {
  subscription: Subscription;
  totalSpent: number;   // Lifetime spending
}

export interface InsightsData {
  categorySpending: CategorySpending[];
  spendingTrend: SpendingTrendPoint[];
  mostSpentApp: SpendingExtreme | null;
  leastSpentApp: SpendingExtreme | null;
}
```

### 3. Spending Calculation Logic

```typescript
// utils/spendingCalculations.ts

/**
 * Calculate monthly spending for a subscription based on its cycle
 */
export function getMonthlyPrice(subscription: Subscription): number {
  return subscription.cycle === 'monthly' 
    ? subscription.price 
    : subscription.price / 12;
}

/**
 * Calculate total spending for a subscription from startDate to endDate
 */
export function calculateTotalSpending(
  subscription: Subscription,
  startDate: Date,
  endDate: Date
): number {
  const subStart = new Date(subscription.startDate);
  const effectiveStart = subStart > startDate ? subStart : startDate;
  
  if (effectiveStart > endDate) return 0;
  
  const monthsDiff = differenceInMonths(endDate, effectiveStart) + 1;
  const monthlyPrice = getMonthlyPrice(subscription);
  
  return monthlyPrice * monthsDiff;
}

/**
 * Get spending per category for a given time range
 */
export function getCategorySpending(
  subscriptions: Subscription[],
  timeRange: TimeRange
): CategorySpending[] { ... }

/**
 * Get monthly spending trend data points
 */
export function getSpendingTrend(
  subscriptions: Subscription[]
): SpendingTrendPoint[] { ... }

/**
 * Get most and least spent subscriptions (lifetime)
 */
export function getSpendingExtremes(
  subscriptions: Subscription[]
): { most: SpendingExtreme | null; least: SpendingExtreme | null } { ... }
```

---

## Component Specifications

### 1. CategorySpendingChart (Free + Pro Enhanced)

**Props:**
```typescript
interface CategorySpendingChartProps {
  subscriptions: Subscription[];
  currency: { code: string; symbol: string };
  isPro: boolean;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}
```

**Behavior:**
- **Free Users**: Shows current month spending only, no time selector
- **Pro Users**: Shows time range dropdown, chart updates based on selection

**UI:**
- Custom rounded bar chart (keep existing visual style)
- Time range dropdown appears above chart for Pro users
- Smooth animation when data changes

### 2. SpendingTrendChart (Pro Only)

**Props:**
```typescript
interface SpendingTrendChartProps {
  subscriptions: Subscription[];
  currency: { code: string; symbol: string };
}
```

**Features:**
- Line chart using `react-native-gifted-charts` LineChart
- X-axis: Months (from earliest subscription to current)
- Y-axis: Total monthly spending
- Gradient fill under the line
- Interactive: Show tooltip on press
- Curved line for smooth appearance

**Visual Style:**
```typescript
<LineChart
  data={trendData}
  areaChart
  curved
  color={colors.accent.primary}
  startFillColor={colors.accent.primary}
  endFillColor="transparent"
  startOpacity={0.4}
  endOpacity={0}
  thickness={3}
  hideDataPoints={false}
  dataPointsColor={colors.accent.primary}
  // ... responsive sizing
/>
```

### 3. SpendingExtremesCards (Pro Only)

**Props:**
```typescript
interface SpendingExtremesCardsProps {
  mostSpent: SpendingExtreme | null;
  leastSpent: SpendingExtreme | null;
  currency: { code: string; symbol: string };
}
```

**Layout:**
- Two side-by-side GlassCards
- Each shows:
  - Icon/Avatar with subscription color
  - Subscription name
  - Total lifetime spending
  - "Most Spent" / "Least Spent" label

### 4. TimeRangeSelector (Pro Only)

**Props:**
```typescript
interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}
```

**Options:**
- Current Month
- Last 3 Months
- Last Year
- Lifetime

**UI:**
- Pill-style segmented control or dropdown
- Matches existing app design language

---

## Implementation Steps

### Phase 1: Foundation ✅ COMPLETED
1. ✅ Create type definitions (`types/insights.ts`)
2. ✅ Implement calculation utilities (`utils/spendingCalculations.ts`)
3. ✅ Create custom hook (`hooks/useSpendingCalculations.ts`)
4. ⏳ Write unit tests for calculation functions (optional)

### Phase 2: Free Tier Fix ✅ COMPLETED
1. ✅ Extract CategorySpendingChart component
2. ✅ Remove Pro gate from category spending chart
3. ✅ Ensure chart works correctly for free users
4. ⏳ Test free user experience

### Phase 3: Pro Enhancements ✅ COMPLETED
1. ✅ Implement TimeRangeSelector component
2. ✅ Enhance CategorySpendingChart with time range support
3. ✅ Implement SpendingTrendChart component
4. ✅ Implement SpendingExtremesCards component
5. ✅ Implement ProFeatureTeaser component

### Phase 4: Integration ✅ COMPLETED
1. ✅ Refactor stats.tsx to use new components
2. ✅ Add Pro gates to new features
3. ✅ PaywallModal integration maintained
4. ✅ Implement smooth transitions/animations

### Phase 5: Polish & Testing ⏳ PENDING
1. ⏳ Responsive design testing (tablets, various screen sizes)
2. ✅ Performance optimization (memoization, lazy loading)
3. ✅ Edge case handling (no subscriptions, single subscription)
4. ✅ Accessibility audit (labels, roles added)
5. ⏳ Final QA

---

## Detailed Code Examples

### Updated stats.tsx Structure

```tsx
export default function Stats() {
  const { isPro } = useProStore();
  const subscriptions = useSubStore((state) => state.subscriptions);
  const currency = useSubStore((state) => state.currency);
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('current_month');
  const [showPaywall, setShowPaywall] = useState(false);

  const {
    categorySpending,
    spendingTrend,
    mostSpentApp,
    leastSpentApp,
  } = useSpendingCalculations(subscriptions, selectedTimeRange);

  return (
    <SafeAreaView>
      <ScrollView>
        {/* Header */}
        <Header title="Insights" />

        {/* Category Spending Chart - FREE (enhanced for Pro) */}
        <CategorySpendingChart
          data={categorySpending}
          currency={currency}
          isPro={isPro}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
        />

        {/* Pro-Only Section */}
        {isPro ? (
          <>
            {/* Spending Trend Line Chart */}
            <SpendingTrendChart
              data={spendingTrend}
              currency={currency}
            />

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

        {/* Category Cards - FREE */}
        <CategoryGrid subscriptions={subscriptions} />
      </ScrollView>
      
      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
```

### Spending Trend Chart Implementation

```tsx
// components/insights/SpendingTrendChart.tsx

import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { GlassCard } from '../ui/GlassCard';
import { colors } from '../../theme/colors';

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  currency,
}) => {
  const chartData = useMemo(() => 
    data.map(point => ({
      value: point.totalSpending,
      label: point.label,
      dataPointText: `${currency.symbol}${point.totalSpending.toFixed(0)}`,
    })),
    [data, currency]
  );

  const maxValue = useMemo(() => 
    Math.max(...data.map(d => d.totalSpending), 1),
    [data]
  );

  if (data.length < 2) {
    return (
      <GlassCard>
        <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>
          Need more history to show spending trend
        </Text>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={{ marginBottom: 24 }}>
      <Text style={{ 
        color: colors.text.primary, 
        fontSize: 18, 
        fontWeight: 'bold',
        marginBottom: 16 
      }}>
        Spending Trend
      </Text>
      
      <LineChart
        data={chartData}
        areaChart
        curved
        color={colors.accent.primary}
        thickness={3}
        startFillColor={colors.accent.primary}
        endFillColor="transparent"
        startOpacity={0.3}
        endOpacity={0}
        initialSpacing={20}
        spacing={50}
        hideDataPoints={false}
        dataPointsColor={colors.accent.primary}
        dataPointsRadius={4}
        xAxisColor={colors.border.subtle}
        yAxisColor={colors.border.subtle}
        yAxisTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
        hideRules
        maxValue={maxValue * 1.2}
        noOfSections={4}
        animateOnDataChange
        animationDuration={500}
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: colors.accent.primary,
          pointerStripWidth: 2,
          pointerColor: colors.accent.primary,
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: any) => (
            <View style={{
              backgroundColor: colors.background.card,
              padding: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border.highlight,
            }}>
              <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>
                {currency.symbol}{items[0].value.toFixed(2)}
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 10 }}>
                {items[0].label}
              </Text>
            </View>
          ),
        }}
      />
    </GlassCard>
  );
};
```

---

## Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| No subscriptions | Show empty state with helpful message |
| Single subscription | Show data, disable trend chart (need 2+ months) |
| All same category | Bar chart shows single bar |
| Very old subscriptions | Limit trend chart to last 24 months for performance |
| Currency changes | Recalculate all values, show in current currency |
| Subscription deleted | Recalculate immediately, animate chart update |

---

## Performance Considerations

1. **Memoization**: Use `useMemo` for all calculation results
2. **Lazy Loading**: Only calculate Pro features when `isPro === true`
3. **Chart Optimization**: 
   - Limit data points on trend chart (max 24 months)
   - Use `animateOnDataChange` sparingly
4. **Re-render Prevention**: 
   - Extract components to prevent parent re-renders
   - Use `React.memo` for chart components

---

## Accessibility

- All charts have descriptive labels
- Color contrast meets WCAG AA standards
- Screen reader support for chart data
- Touch targets minimum 44x44 points
- Alternative text descriptions for visual data

---

## Testing Strategy

### Unit Tests
- `spendingCalculations.ts` - All calculation functions
- Edge cases: empty arrays, single items, date boundaries

### Component Tests
- Each chart component renders correctly
- Pro/Free conditional rendering
- Time range selector updates chart

### Integration Tests
- Full Insights screen flow
- Paywall trigger and dismiss
- Data persistence after app restart

### Manual Testing
- Various device sizes
- Light/Dark mode (if applicable)
- Performance on older devices
- Real subscription data scenarios

---

## Migration Notes

### Breaking Changes
- None - existing functionality preserved

### Data Migration
- None required - uses existing subscription data model

### Rollback Plan
- Feature flags can disable new components
- Old implementation preserved in git history

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Free user chart visibility | 100% of free users see category chart |
| Pro conversion from Insights | Track paywall opens from Insights screen |
| Chart render time | < 100ms on mid-range devices |
| Crash rate | 0% related to new features |

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Foundation | 4 hours | None |
| Free Tier Fix | 2 hours | Foundation |
| Pro Enhancements | 8 hours | Foundation |
| Integration | 4 hours | All components |
| Polish & Testing | 6 hours | Integration |
| **Total** | **~24 hours** | |

---

## Appendix: Color Mapping

```typescript
const categoryColors: Record<string, string> = {
  'Entertainment': colors.accent.secondary,  // Purple/Pink
  'Productivity': colors.accent.primary,     // Blue
  'Utilities': colors.accent.tertiary,       // Teal
  'Music': colors.accent.quaternary,         // Green
  'Shopping': colors.accent.primary,         // Blue
  'Other': colors.accent.neutral,            // Gray
};
```
