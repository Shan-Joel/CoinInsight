import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../theme';

// Warm ember atmosphere — the vault lit from within by firelight.
// variant "hero" burns brighter (Scan); "ambient" is a restrained warm tint.
export default function GlowBackground({ variant = 'ambient' }) {
  const { width, height } = useWindowDimensions();
  const hero = variant === 'hero';

  const coreCy = hero ? height * 0.5 : height * 0.78;
  const coreR = Math.max(width, height) * (hero ? 0.72 : 0.85);

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        {/* Main ember bloom */}
        <RadialGradient id="ember" cx={width / 2} cy={coreCy} r={coreR} gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={hero ? 'rgba(224,138,46,0.34)' : 'rgba(181,97,28,0.20)'} />
          <Stop offset="38%" stopColor={hero ? 'rgba(150,74,22,0.20)' : 'rgba(120,58,18,0.12)'} />
          <Stop offset="72%" stopColor="rgba(60,28,10,0.04)" />
          <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </RadialGradient>
        {/* Faint warm highlight near the top */}
        <RadialGradient id="topglow" cx={width * 0.5} cy={0} r={height * 0.45} gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="rgba(235,184,92,0.10)" />
          <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </RadialGradient>
        {/* Edge vignette for depth */}
        <RadialGradient id="vig" cx={width / 2} cy={height / 2} r={Math.max(width, height) * 0.72} gradientUnits="userSpaceOnUse">
          <Stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <Stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill={colors.base} />
      <Rect x="0" y="0" width={width} height={height} fill="url(#topglow)" />
      <Rect x="0" y="0" width={width} height={height} fill="url(#ember)" />
      <Rect x="0" y="0" width={width} height={height} fill="url(#vig)" />
    </Svg>
  );
}
