export const typography = {
  size: {
    xs: 12,    // Bumped up from 10px for readability
    sm: 14,
    base: 16,
    lg: 20,    // Rounded from 18/22
    xl: 24,
    xxl: 32,
  },
  weight: {
    regular: '400',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
} as const;
