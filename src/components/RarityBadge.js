import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rarity as RARITY, fonts, radius } from '../theme';

export default function RarityBadge({ tier, size = 'md' }) {
  const r = RARITY[tier] || RARITY.Common;
  const small = size === 'sm';

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: r.glow,
          borderColor: r.color + '66',
          paddingVertical: small ? 3 : 5,
          paddingHorizontal: small ? 8 : 11,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: r.color }]} />
      <Text
        style={[
          styles.label,
          { color: r.color, fontSize: small ? 10 : 11.5, letterSpacing: small ? 0.6 : 0.9 },
        ]}
      >
        {r.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  label: { fontFamily: fonts.bodyBold },
});
