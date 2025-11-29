/**
 * Spending Trend Line Chart
 * PRO ONLY - Shows spending history over time
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

interface SpendingTrendChartProps {
  data: SpendingTrendPoint[];
  currency: { code: string; symbol: string };
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  currency,
}) => {
  // Responsive chart dimensions
  const chartHeight = useResponsiveValue({
    sm: 160,
    md: 180,
    lg: 200,
    xl: 220,
    default: 180,
  });

  const chartWidth = useResponsiveValue({
    sm: 280,
    md: 320,
    lg: 360,
    xl: 400,
    default: 320,
  });

  // Transform data for the chart library
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      value: point.totalSpending,
      label: index % 3 === 0 ? point.label : '', // Show every 3rd label to avoid crowding
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

  // Not enough data to show trend
  if (data.length < 2) {
    return (
      <GlassCard style={styles.container}>
        <Text style={styles.title}>Spending Trend</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Need at least 2 months of history to show spending trend
          </Text>
        </View>
      </GlassCard>
    );
  }

  // Calculate spacing based on data points
  const spacing = Math.max(30, Math.min(60, chartWidth / data.length));

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} allowFontScaling maxFontSizeMultiplier={1.2}>
          Spending Trend
        </Text>
        <View style={styles.avgBadge}>
          <Text style={styles.avgLabel}>Avg</Text>
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
          width={chartWidth}
          areaChart
          curved
          curvature={0.2}
          color={colors.accent.secondary}
          thickness={3}
          startFillColor={colors.accent.secondary}
          endFillColor="transparent"
          startOpacity={0.4}
          endOpacity={0}
          initialSpacing={20}
          endSpacing={20}
          spacing={spacing}
          hideDataPoints={data.length > 12}
          dataPointsColor={colors.accent.secondary}
          dataPointsRadius={4}
          xAxisColor="transparent"
          yAxisColor="transparent"
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          hideRules
          hideYAxisText
          maxValue={maxValue * 1.2}
          noOfSections={4}
          animateOnDataChange
          animationDuration={500}
          isAnimated
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

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          {data.length} months of spending history
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
