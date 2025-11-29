export const colors = {
  background: {
    main: '#1c0012ff',      // Deepest black/gray
    // main: '#09090B',      // Deepest black/gray
    // surface: '#1E293B',   // Card background
    surface: '#c8dbfb12',   // Card background
    elevated: '#0F172A',  // Dropdowns / Modals
  },
  text: {
    primary: '#FFFFFF',   // Main headings
    secondary: '#94A3B8', // Subtitles
    muted: '#64748B',     // Placeholders / Disabled
    inverse: '#09090B',   // Text on neon backgrounds
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    highlight: 'rgba(255, 255, 255, 0.1)',
  },
  accent: {
    primary: '#FFB5E8',   // Neon Pink
    secondary: '#B5DEFF', // Neon Blue
    tertiary: '#B5FFCD',  // Neon Green
    quaternary: '#E7B5FF',// Neon Purple
    neutral: '#FEF3C7',   // Soft Yellow
  },
  status: {
    success: '#B5FFCD',
    info: '#B5DEFF',
    warning: '#FEF3C7',
    error: '#FFB5E8',     // Using the pink for error/attention in this theme
  }
} as const;
