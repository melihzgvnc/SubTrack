/**
 * Time range selector component for Pro users
 * Allows switching between different time periods for spending analysis
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { TimeRange } from '../../types/insights';
import { TIME_RANGE_OPTIONS } from '../../types/insights';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  disabled?: boolean;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {TIME_RANGE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              disabled && styles.optionDisabled,
            ]}
            onPress={() => !disabled && onChange(option.value)}
            activeOpacity={disabled ? 1 : 0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled }}
            accessibilityLabel={`Select ${option.label}`}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
                disabled && styles.optionTextDisabled,
              ]}
              allowFontScaling
              maxFontSizeMultiplier={1.2}
            >
              {option.shortLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.border.subtle,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.accent.secondary,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: typography.size.xs,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  optionTextSelected: {
    color: colors.text.inverse,
  },
  optionTextDisabled: {
    color: colors.text.muted,
  },
});
