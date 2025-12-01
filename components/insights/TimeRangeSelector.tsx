/**
 * Time range selector component for Pro users
 * Allows switching between different time periods for spending analysis
 * Features smooth sliding indicator animation
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(0);
  const optionWidth = useRef(0);

  // Get the index of the selected option
  const selectedIndex = TIME_RANGE_OPTIONS.findIndex((opt) => opt.value === value);

  // Animate the indicator when selection changes
  useEffect(() => {
    if (optionWidth.current > 0) {
      const targetPosition = selectedIndex * (optionWidth.current + 4); // 4 is the gap
      Animated.spring(slideAnim, {
        toValue: targetPosition,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedIndex, slideAnim]);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    containerWidth.current = width;
    // Calculate option width: (container - padding - gaps) / number of options
    const padding = 8; // 4px on each side
    const gaps = (TIME_RANGE_OPTIONS.length - 1) * 4;
    optionWidth.current = (width - padding - gaps) / TIME_RANGE_OPTIONS.length;
    
    // Set initial position
    const targetPosition = selectedIndex * (optionWidth.current + 4);
    slideAnim.setValue(targetPosition);
  };

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      {/* Animated sliding indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: optionWidth.current || '25%',
            transform: [{ translateX: slideAnim }],
          },
        ]}
      />
      
      {TIME_RANGE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
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
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: colors.accent.secondary,
    borderRadius: 8,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
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
