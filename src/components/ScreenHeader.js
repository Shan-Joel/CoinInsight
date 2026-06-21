import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

// `title` accepts a node so screens can mix a light + extra-bold word.
export default function ScreenHeader({ eyebrow, title, right, paddingHorizontal = 26 }) {
  return (
    <View style={[styles.wrap, { paddingHorizontal }]}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export const headerStyles = StyleSheet.create({
  bold: { fontFamily: fonts.bodyExtra, color: colors.ivory },
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 26,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.gold,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.light,
    fontSize: 34,
    lineHeight: 38,
    color: colors.ivory,
    letterSpacing: 0.2,
  },
});
