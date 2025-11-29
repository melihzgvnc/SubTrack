import { useWindowDimensions, PixelRatio, Platform } from 'react-native';
import { useMemo } from 'react';

// Breakpoint definitions
export const breakpoints = {
  sm: 375,   // Small phones (iPhone SE)
  md: 414,   // Standard phones (iPhone 14)
  lg: 768,   // Tablets
  xl: 1024,  // Large tablets / iPad Pro
} as const;

export type Breakpoint = keyof typeof breakpoints;

export interface ResponsiveInfo {
  width: number;
  height: number;
  isSmall: boolean;      // < 375px
  isMedium: boolean;     // 375-767px
  isLarge: boolean;      // 768-1023px
  isXLarge: boolean;     // >= 1024px
  isTablet: boolean;     // >= 768px
  isLandscape: boolean;
  fontScale: number;
  pixelRatio: number;
  breakpoint: Breakpoint;
}

/**
 * Hook for responsive design utilities
 * Provides screen dimensions, breakpoint info, and scaling utilities
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const fontScale = PixelRatio.getFontScale();
  const pixelRatio = PixelRatio.get();

  return useMemo(() => {
    const isLandscape = width > height;
    
    // Determine current breakpoint
    let breakpoint: Breakpoint = 'sm';
    if (width >= breakpoints.xl) {
      breakpoint = 'xl';
    } else if (width >= breakpoints.lg) {
      breakpoint = 'lg';
    } else if (width >= breakpoints.md) {
      breakpoint = 'md';
    }

    return {
      width,
      height,
      isSmall: width < breakpoints.md,
      isMedium: width >= breakpoints.md && width < breakpoints.lg,
      isLarge: width >= breakpoints.lg && width < breakpoints.xl,
      isXLarge: width >= breakpoints.xl,
      isTablet: width >= breakpoints.lg,
      isLandscape,
      fontScale,
      pixelRatio,
      breakpoint,
    };
  }, [width, height, fontScale, pixelRatio]);
}

/**
 * Scale a value based on screen width relative to design width (375px - iPhone SE)
 */
export function useScaledSize() {
  const { width } = useWindowDimensions();
  const baseWidth = 375;

  return useMemo(() => {
    const scale = width / baseWidth;
    
    return {
      /**
       * Scale a size proportionally to screen width
       * @param size - Base size in pixels (designed for 375px width)
       * @param maxScale - Maximum scale factor (default 1.5)
       */
      scale: (size: number, maxScale = 1.5): number => {
        const scaledSize = size * Math.min(scale, maxScale);
        return Math.round(scaledSize);
      },
      
      /**
       * Scale font size with respect to system font scale
       * @param size - Base font size
       * @param maxMultiplier - Maximum font scale multiplier (default 1.3)
       */
      scaleFont: (size: number, maxMultiplier = 1.3): number => {
        const fontScale = Math.min(PixelRatio.getFontScale(), maxMultiplier);
        const screenScale = Math.min(scale, 1.2); // Less aggressive screen scaling for fonts
        return Math.round(size * screenScale * fontScale);
      },
      
      /**
       * Get a percentage of screen width
       */
      widthPercent: (percent: number): number => {
        return Math.round((width * percent) / 100);
      },
      
      /**
       * Clamp a scaled value between min and max
       */
      clamp: (size: number, min: number, max: number): number => {
        const scaled = size * scale;
        return Math.round(Math.max(min, Math.min(max, scaled)));
      },
    };
  }, [width]);
}

/**
 * Get responsive value based on current breakpoint
 */
export function useResponsiveValue<T>(values: {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T {
  const { breakpoint } = useResponsive();
  
  return useMemo(() => {
    // Try to get value for current breakpoint, fall back to smaller breakpoints
    if (breakpoint === 'xl' && values.xl !== undefined) return values.xl;
    if (breakpoint === 'lg' && values.lg !== undefined) return values.lg;
    if (breakpoint === 'md' && values.md !== undefined) return values.md;
    if (breakpoint === 'sm' && values.sm !== undefined) return values.sm;
    
    // Fallback chain for larger breakpoints
    if (breakpoint === 'xl') {
      return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.default;
    }
    if (breakpoint === 'lg') {
      return values.lg ?? values.md ?? values.sm ?? values.default;
    }
    if (breakpoint === 'md') {
      return values.md ?? values.sm ?? values.default;
    }
    
    return values.sm ?? values.default;
  }, [breakpoint, values]);
}
