import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

// Translucent warm panel that floats over the ember glow.
export default function GlassCard({ style, raised, children, ...rest }) {
  return (
    <View
      style={[styles.card, raised && styles.raised, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  raised: {
    backgroundColor: colors.glassRaised,
  },
});
