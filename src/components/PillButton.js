import React from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

// Premium CTA: a warm-white pill with a circular dark icon badge — inspired
// by the reference's "Continue / Add to my coins" buttons.
export default function PillButton({ label, icon = 'arrow-forward', onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: pressed ? colors.ctaPress : colors.cta },
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.badge}>
        <Ionicons name={icon} size={18} color={colors.cta} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 60,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 26,
    paddingRight: 8,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
    color: colors.black,
    letterSpacing: 0.2,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
