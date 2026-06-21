import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../stores';
import { colors, fonts, radius } from '../theme';
import GlowBackground from '../components/GlowBackground';
import GlassCard from '../components/GlassCard';
import PillButton from '../components/PillButton';
import PasscodeEntry from '../components/PasscodeEntry';

const AVATARS = ['🪙', '👑', '🏛️', '💰', '⚜️', '🦅'];

const OnboardingScreen = observer(() => {
  const session = useSessionStore();
  const [step, setStep] = useState(1); // 1: profile, 2: passcode
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  // passcode step
  const [phase, setPhase] = useState('enter'); // enter | confirm
  const [firstCode, setFirstCode] = useState('');
  const [errNonce, setErrNonce] = useState(0);
  const [message, setMessage] = useState(null);

  const finish = (passcode) => session.createProfile(name, avatar, passcode);

  const onPasscode = (code) => {
    if (phase === 'enter') {
      setFirstCode(code);
      setMessage(null);
      setErrNonce(0);
      setPhase('confirm');
    } else {
      if (code === firstCode) {
        finish(code);
      } else {
        setMessage("Passcodes didn't match — try again");
        setErrNonce((n) => n + 1);
        setFirstCode('');
        setPhase('enter');
      }
    }
  };

  return (
    <View style={styles.root}>
      <GlowBackground variant="hero" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {step === 1 ? (
            <View style={styles.content}>
              <View style={styles.hero}>
                <View style={styles.crest}>
                  <Text style={{ fontSize: 40 }}>{avatar}</Text>
                </View>
                <Text style={styles.welcome}>WELCOME TO</Text>
                <Text style={styles.brand}>CoinInsight</Text>
                <Text style={styles.tagline}>Your private collector's vault.</Text>
              </View>

              <GlassCard raised style={styles.card}>
                <Text style={styles.label}>CHOOSE YOUR CREST</Text>
                <View style={styles.avatarRow}>
                  {AVATARS.map((a) => (
                    <Pressable
                      key={a}
                      onPress={() => setAvatar(a)}
                      style={[styles.avatarBtn, avatar === a && styles.avatarBtnActive]}
                    >
                      <Text style={{ fontSize: 22 }}>{a}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.label, { marginTop: 22 }]}>YOUR NAME</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Alex"
                  placeholderTextColor={colors.faint}
                  style={styles.input}
                  returnKeyType="next"
                  maxLength={24}
                  onSubmitEditing={() => setStep(2)}
                />

                <PillButton label="Continue" icon="arrow-forward" onPress={() => setStep(2)} style={{ marginTop: 26 }} />
              </GlassCard>

              <Text style={styles.footnote}>Your collection stays on this device.</Text>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.passHead}>
                <Pressable style={styles.backBtn} hitSlop={10} onPress={() => setStep(1)}>
                  <Ionicons name="chevron-back" size={22} color={colors.muted} />
                </Pressable>
                <View style={styles.lockCrest}>
                  <Ionicons name="lock-closed" size={26} color={colors.gold} />
                </View>
                <Text style={styles.passTitle}>
                  {phase === 'enter' ? 'Set a passcode' : 'Confirm passcode'}
                </Text>
                <Text style={styles.passSub}>
                  {phase === 'enter'
                    ? 'Secure your vault with a 4-digit code.'
                    : 'Re-enter your code to confirm.'}
                </Text>
              </View>

              <PasscodeEntry key={phase} onComplete={onPasscode} errorNonce={errNonce} message={message} />

              <Pressable style={styles.skip} hitSlop={8} onPress={() => finish(null)}>
                <Text style={styles.skipText}>Skip for now</Text>
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
});

export default OnboardingScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

  hero: { alignItems: 'center', marginBottom: 34 },
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
  welcome: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 3, color: colors.gold },
  brand: { fontFamily: fonts.display, fontSize: 40, color: colors.ivory, marginTop: 8 },
  tagline: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 8 },

  card: { padding: 24 },
  label: { fontFamily: fonts.bodySemi, fontSize: 10.5, letterSpacing: 1.8, color: colors.muted },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  avatarBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
  avatarBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(248,221,151,0.10)' },
  input: {
    marginTop: 12,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: 16,
    color: colors.ivory,
    fontFamily: fonts.bodyMed,
    fontSize: 16,
  },
  footnote: { fontFamily: fonts.body, fontSize: 12, color: colors.faint, textAlign: 'center', marginTop: 24 },

  // passcode step
  passHead: { alignItems: 'center', marginBottom: 26 },
  backBtn: { position: 'absolute', left: 0, top: 0 },
  lockCrest: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(248,221,151,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  passTitle: { fontFamily: fonts.display, fontSize: 26, color: colors.ivory },
  passSub: { fontFamily: fonts.body, fontSize: 13.5, color: colors.muted, marginTop: 8, textAlign: 'center' },

  skip: { alignSelf: 'center', marginTop: 24 },
  skipText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.muted },
});
