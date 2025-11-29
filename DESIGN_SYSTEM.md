# SubTrack Design System

## 1. Introduction
This document outlines the design system for the SubTrack application. It serves as a single source of truth for colors, typography, spacing, and core UI components.

## 2. Color Palette

The color system is designed for a dark-themed, neon-accented aesthetic.

### Backgrounds
- **Main**: `#1c0012ff` (Deepest black/gray)
- **Surface**: `#c8dbfb12` (Glassy card background)
- **Elevated**: `#0F172A` (Dropdowns / Modals)

### Text
- **Primary**: `#FFFFFF` (Main headings)
- **Secondary**: `#94A3B8` (Subtitles)
- **Muted**: `#64748B` (Placeholders / Disabled)
- **Inverse**: `#09090B` (Text on neon backgrounds)

### Borders
- **Subtle**: `rgba(255, 255, 255, 0.05)`
- **Highlight**: `rgba(255, 255, 255, 0.1)`

### Accents (Neon)
- **Primary**: `#FFB5E8` (Neon Pink)
- **Secondary**: `#B5DEFF` (Neon Blue)
- **Tertiary**: `#B5FFCD` (Neon Green)
- **Quaternary**: `#E7B5FF` (Neon Purple)
- **Neutral**: `#FEF3C7` (Soft Yellow)

### Status
- **Success**: `#B5FFCD`
- **Info**: `#B5DEFF`
- **Warning**: `#FEF3C7`
- **Error**: `#FFB5E8`

## 3. Typography

### Font Families
- **Display**: `ConcertOne_400Regular` (Headings and display text)
- **Body**: `System` (San Francisco on iOS, Roboto on Android)

### Font Sizes
- **xs**: 12
- **sm**: 14
- **base**: 16
- **lg**: 20
- **xl**: 24
- **xxl**: 32
- **display**: 48

### Font Weights
- **Regular**: '400'
- **Semibold**: '600'
- **Bold**: '700'

### Line Heights
- **Tight**: 1.25
- **Normal**: 1.5
- **Relaxed**: 1.75

## 4. Spacing & Layout

### Spacing Scale
- **none**: 0
- **xxs**: 4
- **xs**: 8
- **sm**: 12
- **md**: 16
- **lg**: 20
- **xl**: 24
- **xxl**: 32
- **xxxl**: 48
- **section**: 64

### Layout Constants
- **Screen Padding**: 16
- **Bottom Scroll Padding**: 180

## 5. Core Components

### UI Primitives (`components/ui`)
- **GlassCard**: A card component with a glassy background effect, likely using `colors.background.surface` and `colors.border.highlight`.
- **MeshBackground**: A background component providing the ambient neon glow/mesh effect.
- **Squircle**: A component for rendering squircle shapes, often used for icons or containers.
- **Dropdown**: A custom dropdown component.
- **ScaledText**: A text component that likely handles dynamic sizing.

### Feature Components
- **SubscriptionCard**: Displays subscription details including name, price, cycle, and next bill date.
  - Uses `colors.background.surface` for background.
  - Uses `spacing.md` for padding and `spacing.lg` for border radius.
  - Uses `colors.border.highlight` for borders.
  - Displays a colored icon circle using the subscription's assigned color.

## 6. Usage Guidelines

### Styling
Use the defined tokens from the `theme` directory instead of hardcoded values.

```typescript
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

// Example usage
<View style={{
  backgroundColor: colors.background.surface,
  padding: spacing.md,
  borderRadius: spacing.lg
}}>
  <Text style={{
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display
  }}>
    Hello World
  </Text>
</View>
```

### Tailwind CSS
The project is configured with `nativewind`. You can use Tailwind classes that map to these tokens.
- Colors: `bg-background`, `text-neon-pink`, `border-surface-highlight`
- Spacing: `p-4` (maps to spacing scale), `m-safe`
- Fonts: `font-display`, `font-sans`

Refer to `tailwind.config.js` for the complete mapping.
