import React from 'react';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { Squircle } from './Squircle';

interface GlassCardProps {
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'highlight' | 'active';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  width = '100%',
  height,
  children,
  style,
  variant = 'default',
}) => {
  // Determine colors based on variant
  let backgroundColor = 'rgba(255, 255, 255, 0.03)';
  let borderColor = 'rgba(255, 255, 255, 0.1)';
  let shadowColor = '#64748B'; // Blue-grey tint

  if (variant === 'highlight') {
    backgroundColor = 'rgba(181, 222, 255, 0.08)'; // Slight blue tint
    borderColor = 'rgba(181, 222, 255, 0.3)';
    shadowColor = '#B5DEFF';
  } else if (variant === 'active') {
    backgroundColor = 'rgba(255, 181, 232, 0.08)'; // Slight pink tint
    borderColor = 'rgba(255, 181, 232, 0.3)';
    shadowColor = '#FFB5E8';
  }

  // We need to resolve width/height to numbers for the Squircle SVG if possible,
  // but Squircle accepts numbers. If width is string (e.g. '100%'), Squircle might need adjustment.
  // For now, let's assume the parent provides concrete dimensions or we wrap it.
  // Actually, my Squircle component took `width` and `height` as numbers. 
  // I need to update Squircle to handle flexible sizing or use a LayoutLayout to get size.
  // For this iteration, I'll wrap it in a View that measures itself? 
  // No, that's too complex for a quick UI iteration.
  // I will modify Squircle to accept '100%' by using `viewBox` logic or just standard View with SVG background.
  
  // Let's use a simpler approach for the "Card" container:
  // We'll use a View with the styles, and if we really need the Squircle shape, we use it.
  // But the user explicitly said "Use Squircles... do NOT use standard border-radius".
  
  // I'll implement a Layout wrapper.
  const [layout, setLayout] = React.useState({ width: 0, height: 0 });

  return (
    <View 
      style={[styles.container, style]} 
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
    >
      {layout.width > 0 && layout.height > 0 && (
        <View style={StyleSheet.absoluteFill}>
            <Squircle
                width={layout.width}
                height={layout.height}
                cornerRadius={24}
                backgroundColor={backgroundColor}
                borderColor={borderColor}
                showBorder={true}
                borderWidth={1}
            />
        </View>
      )}
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Ambient Occlusion / Colored Shadow simulation (simple view behind?) 
          Actually, Squircle can handle the shadow if we add it to SVG, 
          but SVG shadows are expensive. 
          Let's stick to the requested "Colored Shadows (Blue-Grey tint)".
          We can add a view behind with standard shadow if we can't use border-radius?
          Wait, if I use standard shadow on a square view, the shadow will be square.
          I need the shadow to follow the squircle.
          
          For now, I will rely on the Squircle's internal rim light for depth 
          and maybe a subtle standard shadow on the container (which might look slightly off at corners but acceptable).
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // We don't set background here
    // We don't set borderRadius here (user forbidden)
    // We can set shadow here?
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // Android
  },
  content: {
    padding: 16,
    zIndex: 1,
  }
});
