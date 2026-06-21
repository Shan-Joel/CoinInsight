import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../stores';
import { colors, fonts } from '../theme';
import GlowBackground from '../components/GlowBackground';
import PasscodeEntry from '../components/PasscodeEntry';

const LockScreen = observer(() => {
  const session = useSessionStore();
  const [errNonce, setErrNonce] = useState(0);
  const [message, setMessage] = useState(null);

  const onComplete = async (code) => {
    const ok = await session.unlock(code);
    if (!ok) {
      setMessage('Incorrect passcode');
      setErrNonce((n) => n + 1);
    }
  };

  return (
    <View style={styles.root}>
      <GlowBackground variant="hero" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.crest}>
            <Text style={{ fontSize: 36 }}>{session.profile?.avatar || '🪙'}</Text>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={13} color={colors.black} />
            </View>
          </View>

          <Text style={styles.welcome}>WELCOME BACK</Text>
          <Text style={styles.name}>{session.profile?.name || 'Collector'}</Text>
          <Text style={styles.sub}>Enter your passcode</Text>

          <View style={{ marginTop: 28 }}>
            <PasscodeEntry onComplete={onComplete} errorNonce={errNonce} message={message} />
          </View>

          <Pressable onPress={() => session.signOut()} hitSlop={10} style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot passcode? Start a new vault</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
});

export default LockScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  crest: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(248,221,151,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.base,
  },
  welcome: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 3, color: colors.gold },
  name: { fontFamily: fonts.display, fontSize: 32, color: colors.ivory, marginTop: 8 },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 8 },

  forgot: { marginTop: 28 },
  forgotText: { fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.muted },
});
