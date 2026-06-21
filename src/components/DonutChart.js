import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';

// Segment palette — a graded gold-to-bronze ramp with two cool accents
// so adjacent countries stay legible on the dark vault background.
export const SEGMENT_COLORS = [
  '#F4DD8B',
  '#D4AF37',
  '#B5832B',
  '#8C97A8',
  '#A877E0',
  '#56B589',
  '#7E5A20',
  '#5B92D6',
];

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export default function DonutChart({ data, size = 188, thickness = 22, centerLabel, centerSub }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;
  const gap = data.length > 1 ? 3 : 0; // degrees between segments

  let angle = 0;
  const segments = data.map((d, i) => {
    const sweep = d.pct * 360;
    const start = angle + gap / 2;
    const end = Math.max(start, angle + sweep - gap / 2);
    angle += sweep;
    return {
      key: d.country,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      d: arcPath(cx, cy, r, start, end),
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* track */}
        <Circle cx={cx} cy={cy} r={r} stroke={colors.surfaceHigh} strokeWidth={thickness} fill="none" />
        <G>
          {segments.map((s) => (
            <Path
              key={s.key}
              d={s.d}
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </G>
      </Svg>

      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        {centerSub ? <Text style={styles.sub}>{centerSub}</Text> : null}
        <Text style={styles.value}>{centerLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: fonts.display, fontSize: 30, color: colors.ivory },
  sub: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    letterSpacing: 1.6,
    color: colors.muted,
    marginBottom: 2,
  },
});
