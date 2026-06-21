import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';

// A minted-coin photo placeholder: layered radial sheen + milled edge ring,
// with the country flag struck in the center.
export default function CoinAvatar({ coin, size = 72, showYear = false }) {
  const r = size / 2;
  const inner = r - size * 0.085;
  const [c1, c2] = coin.disc;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`face-${coin.id}`} cx="38%" cy="32%" r="80%">
            <Stop offset="0%" stopColor={c1} />
            <Stop offset="58%" stopColor={c1} />
            <Stop offset="100%" stopColor={c2} />
          </RadialGradient>
          <LinearGradient id={`edge-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.goldBright} />
            <Stop offset="50%" stopColor={colors.gold} />
            <Stop offset="100%" stopColor={colors.goldDeep} />
          </LinearGradient>
        </Defs>
        {/* milled edge ring */}
        <Circle cx={r} cy={r} r={r - 1} fill={`url(#edge-${coin.id})`} />
        {/* struck face */}
        <Circle cx={r} cy={r} r={inner} fill={`url(#face-${coin.id})`} />
        {/* inner bevel highlight */}
        <Circle
          cx={r}
          cy={r}
          r={inner}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1}
        />
        {/* top sheen + bright specular */}
        <Circle cx={r * 0.7} cy={r * 0.58} r={inner * 0.55} fill="rgba(255,255,255,0.14)" />
        <Circle cx={r * 0.62} cy={r * 0.48} r={inner * 0.16} fill="rgba(255,255,255,0.40)" />
      </Svg>

      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Text style={{ fontSize: size * 0.4 }}>{coin.flag}</Text>
        {showYear && (
          <Text style={[styles.year, { fontSize: size * 0.13 }]}>{coin.year}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  year: {
    fontFamily: fonts.bodySemi,
    color: 'rgba(0,0,0,0.55)',
    marginTop: 2,
    letterSpacing: 1,
  },
});
