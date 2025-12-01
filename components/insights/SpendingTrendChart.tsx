/**
 * Spending Trend Line Chart
 * PRO ONLY - Shows lifetime spending history over time
 * 
 * Features:
 * - Displays monthly spending from oldest to current month
 * - Horizontally scrollable when more than 4 months of data
 * - Shows data points on each month with labels
 * - Starts scrolled to the most recent data (scrollToEnd)
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { GlassCard } from '../ui/GlassCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { SpendingTrendPoint } from '../../types/insights';
import { useResponsiveValue } from '../../hooks/useResponsive';
import { useTranslation } from 'react-i18next';

// Constants for chart configuration
const POINT_SPACING = 70; // Fixed spacing between data points for consistent display
const MIN_POINTS_FOR_SCROLL = 4; // Minimum points before enabling scroll behavior
const CHART_PADDING = 20; // Padding at start and end of chart

interface SpendingTrendChartProps {
  data: SpendingTrendPoint[];
  currency: { code: string; symbol: string };
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  currency,
}) => {
  const { t } = useTranslation();
  
  // Responsive chart height
  const chartHeight = useResponsiveValue({
    sm: 160,
    md: 180,
    lg: 200,
    xl: 220,
    default: 180,
  });

  // Transform data for the chart library
  // Data comes in chronological order (oldest first) from getSpendingTrend
  const chartData = useMemo(() => {
    return data.map((point) => ({
      value: point.totalSpending,
      label: point.label, // Show all month labels
      dataPointText: '',
    }));
  }, [data]);

  // Calculate chart bounds
  const { maxValue, avgValue } = useMemo(() => {
    if (data.length === 0) return { maxValue: 100, avgValue: 0 };
    const values = data.map((d) => d.totalSpending);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { maxValue: max, avgValue: avg };
  }, [data]);

  // Determine if chart should be scrollable
  const isScrollable = data.length > MIN_POINTS_FOR_SCROLL;

  // Not enough data to show trend
  if (data.length < 2) {
    return (
      <GlassCard style={styles.container}>
        <Text style={styles.title}>{t('stats.spendingTrend')}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {t('stats.needMoreHistory')}
          </Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} allowFontScaling maxFontSizeMultiplier={1.2}>
          {t('stats.spendingTrend')}
        </Text>
        <View style={styles.avgBadge}>
          <Text style={styles.avgLabel}>{t('stats.avg')}</Text>
          <Text style={styles.avgValue}>
            {currency.symbol}
            {avgValue.toFixed(0)}/mo
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          height={chartHeight}
          // Don't set width to allow natural scrolling when content exceeds container
          areaChart
          curved
          curvature={0.2}
          color={colors.accent.secondary}
          thickness={2.5}
          startFillColor={colors.accent.secondary}
          endFillColor="transparent"
          startOpacity={0.3}
          endOpacity={0}
          initialSpacing={CHART_PADDING}
          endSpacing={CHART_PADDING}
          spacing={POINT_SPACING}
          // Always show data points for clarity
          hideDataPoints={false}
          dataPointsColor={colors.accent.secondary}
          dataPointsRadius={5}
          // X-axis configuration
          xAxisColor={colors.border.subtle}
          xAxisThickness={1}
          xAxisLabelTextStyle={styles.axisText}
          // Y-axis configuration - visible for better data comprehension
          yAxisColor={colors.border.subtle}
          yAxisThickness={1}
          yAxisTextStyle={styles.yAxisText}
          hideYAxisText={false}
          yAxisLabelPrefix={currency.symbol}
          yAxisLabelWidth={50}
          hideRules={false}
          rulesColor={colors.border.subtle}
          rulesType="solid"
          rulesThickness={0.5}
          // Value bounds with padding
          maxValue={maxValue > 0 ? maxValue * 1.2 : 100}
          noOfSections={4}
          // Animation
          animateOnDataChange
          animationDuration={500}
          isAnimated
          // Scroll behavior - start at the end (most recent month) by default
          scrollToEnd={isScrollable}
          // Pointer/tooltip configuration for touch interaction
          pointerConfig={{
            pointerStripHeight: chartHeight,
            pointerStripColor: colors.accent.secondary,
            pointerStripWidth: 1,
            pointerColor: colors.accent.secondary,
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 60,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: any) => {
              const item = items[0];
              if (!item) return null;
              const dataPoint = data[item.index];
              return (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipValue}>
                    {currency.symbol}
                    {item.value.toFixed(2)}
                  </Text>
                  <Text style={styles.tooltipLabel}>
                    {dataPoint?.label || ''}
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>

      {/* Legend showing data range */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          {t('stats.historyLength', { count: data.length })}
          {isScrollable && ' • ' + t('stats.scrollHint', { defaultValue: 'Scroll to see more' })}
        </Text>
      </View>
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  avgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.border.subtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  avgLabel: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
  avgValue: {
    color: colors.text.primary,
    fontSize: typography.size.xs,
    fontWeight: '600',
  },
  chartWrapper: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  axisText: {
    color: colors.text.muted,
    fontSize: 10,
  },
  yAxisText: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '500',
  },
  tooltip: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.highlight,
    alignItems: 'center',
  },
  tooltipValue: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: 'bold',
  },
  tooltipLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
  legend: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  legendText: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
});
