import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export const MeshBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background.main }]} />
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="grad1"
            cx="0%"
            cy="0%"
            rx="80%"
            ry="80%"
            fx="0%"
            fy="0%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.accent.primary} stopOpacity="0.3" />
            <Stop offset="1" stopColor={colors.background.main} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="grad2"
            cx="100%"
            cy="0%"
            rx="80%"
            ry="80%"
            fx="100%"
            fy="0%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.accent.secondary} stopOpacity="0.3" />
            <Stop offset="1" stopColor={colors.background.main} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="grad3"
            cx="100%"
            cy="100%"
            rx="80%"
            ry="80%"
            fx="100%"
            fy="100%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.accent.tertiary} stopOpacity="0.2" />
            <Stop offset="1" stopColor={colors.background.main} stopOpacity="0" />
          </RadialGradient>
           <RadialGradient
            id="grad4"
            cx="0%"
            cy="100%"
            rx="80%"
            ry="80%"
            fx="0%"
            fy="100%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.accent.quaternary} stopOpacity="0.2" />
            <Stop offset="1" stopColor={colors.background.main} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad3)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad4)" />
      </Svg>
    </View>
  );
};
