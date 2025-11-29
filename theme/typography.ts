export const typography = {
  // Font families
  fontFamily: {
    display: 'ConcertOne_400Regular',  // For headings and display text
    body: 'System',                     // For body text and labels
  },
  size: {
    xs: 12,    // Bumped up from 10px for readability
    sm: 14,
    base: 16,
    lg: 20,    // Rounded from 18/22
    xl: 24,
    xxl: 32,
    display: 48,  // For hero/display text
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

// Font family constants for easy imports
export const FONT_DISPLAY = 'ConcertOne_400Regular';
export const FONT_BODY = 'System';
