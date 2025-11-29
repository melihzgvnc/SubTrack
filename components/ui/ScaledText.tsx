import React from 'react';
import { Text, TextProps, TextStyle, StyleSheet } from 'react-native';

interface ScaledTextProps extends TextProps {
  /**
   * Maximum font size multiplier for accessibility scaling
   * @default 1.3
   */
  maxFontSizeMultiplier?: number;
  children?: React.ReactNode;
}

/**
 * Text component with built-in accessibility font scaling support
 * Wraps React Native Text with sensible defaults for font scaling
 */
export const ScaledText: React.FC<ScaledTextProps> = ({
  maxFontSizeMultiplier = 1.3,
  allowFontScaling = true,
  children,
  style,
  ...props
}) => {
  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
};

/**
 * Preset text components for common use cases
 */
export const Heading1: React.FC<ScaledTextProps> = (props) => (
  <ScaledText maxFontSizeMultiplier={1.2} {...props} />
);

export const Heading2: React.FC<ScaledTextProps> = (props) => (
  <ScaledText maxFontSizeMultiplier={1.25} {...props} />
);

export const Body: React.FC<ScaledTextProps> = (props) => (
  <ScaledText maxFontSizeMultiplier={1.35} {...props} />
);

export const Caption: React.FC<ScaledTextProps> = (props) => (
  <ScaledText maxFontSizeMultiplier={1.4} {...props} />
);
