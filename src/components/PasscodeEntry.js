import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import * as haptics from '../services/haptics';

export const PASSCODE_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

// A self-contained passcode pad: shows the dots and a numeric keypad, and calls
// onComplete(code) once all digits are entered. Bump `errorNonce` to shake +
// clear (used for a wrong / mismatched entry).
export default function PasscodeEntry({ onComplete, errorNonce = 0, message }) {
  const [code, setCode] = useState('');
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!errorNonce) return;
    haptics.error();
    setCode('');
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0.6, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [errorNonce]);

  const press = (k) => {
    if (k === '') return;
    if (k === 'back') {
      setCode((c) => c.slice(0, -1));
      return;
    }
    setCode((c) => {
      if (c.length >= PASSCODE_LENGTH) return c;
      const next = c + k;
      haptics.tap();
      if (next.length === PASSCODE_LENGTH) {
        // small delay so the final dot fills before validation
        setTimeout(() => onComplete(next), 130);
      }
      return next;
    });
  };

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.dots, { transform: [{ translateX }] }]}>
        {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => (
          <View key={i} style={[styles.dot, i < code.length && styles.dotFilled]} />
        ))}
      </Animated.View>

      <Text style={[styles.message, message ? styles.messageError : null]}>
        {message || ' '}
      </Text>

      <View style={styles.pad}>
        {KEYS.map((k, idx) => (
          <View key={idx} style={styles.cell}>
            {k === '' ? (
              <View style={styles.key} />
            ) : (
              <Pressable
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                onPress={() => press(k)}
              >
                {k === 'back' ? (
                  <Ionicons name="backspace-outline" size={24} color={colors.ivory} />
                ) : (
                  <Text style={styles.keyText}>{k}</Text>
                )}
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 18, marginBottom: 12 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: colors.gold, borderColor: colors.gold },

  message: { fontFamily: fonts.body, fontSize: 13, color: 'transparent', marginBottom: 14, height: 18 },
  messageError: { color: colors.danger },

  pad: { width: 264, flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '33.33%', alignItems: 'center', marginVertical: 9 },
  key: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
  keyPressed: { backgroundColor: 'rgba(248,221,151,0.12)', borderColor: colors.gold },
  keyText: { fontFamily: fonts.bodyMed, fontSize: 26, color: colors.ivory },
});
