import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

const ICONS = {
  Scan: ['scan-outline', 'scan'],
  Collection: ['albums-outline', 'albums'],
  Dashboard: ['stats-chart-outline', 'stats-chart'],
};

export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const isScan = route.name === 'Scan';
          const [outline, solid] = ICONS[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (isScan) {
            return (
              <Pressable key={route.key} onPress={onPress} style={styles.center}>
                <View style={styles.scanBtn}>
                  <Ionicons name="scan" size={24} color={colors.black} />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              <Ionicons
                name={focused ? solid : outline}
                size={21}
                color={focused ? colors.gold : colors.muted}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>{route.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 15, 9, 0.92)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: '86%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 10.5,
    letterSpacing: 0.4,
    color: colors.muted,
  },
  labelActive: { color: colors.gold },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
});
