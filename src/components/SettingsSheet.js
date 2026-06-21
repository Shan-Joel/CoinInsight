import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore, useCoinStore } from '../stores';
import { colors, fonts, radius, money } from '../theme';
import GlowBackground from './GlowBackground';
import GlassCard from './GlassCard';
import PasscodeEntry from './PasscodeEntry';
import * as haptics from '../services/haptics';

const AVATARS = ['🪙', '👑', '🏛️', '💰', '⚜️', '🦅'];

const Row = ({ icon, label, value, onPress, danger, first }) => {
  const tint = danger ? colors.danger : colors.gold;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, !first && styles.rowBorder]}
    >
      <View style={[styles.rowIcon, danger && { backgroundColor: 'rgba(224,138,107,0.10)', borderColor: 'rgba(224,138,107,0.35)' }]}>
        <Ionicons name={icon} size={17} color={tint} />
      </View>
      <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && !value ? <Ionicons name="chevron-forward" size={16} color={colors.faint} /> : null}
    </Pressable>
  );
};

const SettingsSheet = observer(({ onClose }) => {
  const session = useSessionStore();
  const store = useCoinStore();
  const [name, setName] = useState(session.profile?.name || '');

  // passcode set/change flow
  const [pc, setPc] = useState(null); // null | 'enter' | 'confirm'
  const [firstCode, setFirstCode] = useState('');
  const [errNonce, setErrNonce] = useState(0);
  const [pcMessage, setPcMessage] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const hasPass = session.hasPasscode;
  const countries = store.byCountry.length;

  const startPasscode = () => {
    haptics.tap();
    setFirstCode('');
    setErrNonce(0);
    setPcMessage(null);
    setPc('enter');
  };

  const onPasscode = async (code) => {
    if (pc === 'enter') {
      setFirstCode(code);
      setPcMessage(null);
      setErrNonce(0);
      setPc('confirm');
    } else {
      if (code === firstCode) {
        await session.setPasscode(code);
        haptics.success();
        setPc(null);
      } else {
        setPcMessage("Passcodes didn't match — try again");
        setErrNonce((n) => n + 1);
        setFirstCode('');
        setPc('enter');
      }
    }
  };

  const saveName = () => session.updateProfile({ name });

  const pickAvatar = (a) => {
    haptics.tap();
    session.updateProfile({ avatar: a });
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <GlowBackground />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.headerClose}>
              <Ionicons name="close" size={22} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Identity */}
            <GlassCard raised style={styles.identity}>
              <View style={styles.bigCrest}>
                <Text style={{ fontSize: 44 }}>{session.profile?.avatar || '🪙'}</Text>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                onEndEditing={saveName}
                onSubmitEditing={saveName}
                placeholder="Your name"
                placeholderTextColor={colors.faint}
                style={styles.nameInput}
                maxLength={24}
                textAlign="center"
              />
              <Text style={styles.editHint}>Tap your name to edit</Text>

              <Text style={styles.crestLabel}>CREST</Text>
              <View style={styles.avatarRow}>
                {AVATARS.map((a) => {
                  const active = session.profile?.avatar === a;
                  return (
                    <Pressable
                      key={a}
                      onPress={() => pickAvatar(a)}
                      style={[styles.avatarBtn, active && styles.avatarBtnActive]}
                    >
                      <Text style={{ fontSize: 20 }}>{a}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </GlassCard>

            {/* Security */}
            <Text style={styles.section}>SECURITY</Text>
            <GlassCard style={styles.group}>
              <Row
                first
                icon={hasPass ? 'lock-closed' : 'lock-open-outline'}
                label={hasPass ? 'Change passcode' : 'Set a passcode'}
                onPress={startPasscode}
              />
              {hasPass && (
                <Row icon="lock-closed-outline" label="Lock vault now" onPress={() => { haptics.tap(); session.lock(); onClose(); }} />
              )}
              {hasPass && (
                <Row
                  icon="shield-outline"
                  label="Turn off passcode"
                  danger
                  onPress={() => { haptics.warning(); session.removePasscode(); }}
                />
              )}
            </GlassCard>

            {/* Collection summary */}
            <Text style={styles.section}>YOUR COLLECTION</Text>
            <GlassCard style={styles.group}>
              <Row first icon="albums-outline" label="Coins" value={String(store.count)} />
              <Row icon="earth-outline" label="Countries" value={String(countries)} />
              <Row icon="cash-outline" label="Total value" value={money(store.totalValue)} />
            </GlassCard>

            {/* Account */}
            <Text style={styles.section}>ACCOUNT</Text>
            <GlassCard style={styles.group}>
              {confirmReset ? (
                <View style={styles.confirmWrap}>
                  <Text style={styles.confirmText}>
                    This erases your profile and collection on this device.
                  </Text>
                  <View style={styles.confirmRow}>
                    <Pressable style={styles.confirmCancel} onPress={() => setConfirmReset(false)}>
                      <Text style={styles.confirmCancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={styles.confirmErase} onPress={() => { haptics.warning(); session.signOut(); }}>
                      <Text style={styles.confirmEraseText}>Erase</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Row first icon="trash-outline" label="Start a new vault" danger onPress={() => setConfirmReset(true)} />
              )}
            </GlassCard>

            <Text style={styles.footer}>CoinInsight · your private collector's vault</Text>
          </ScrollView>
        </SafeAreaView>

        {/* Passcode set/change overlay */}
        {pc && (
          <View style={styles.pcOverlay}>
            <GlowBackground variant="hero" />
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.pcContent}>
                <Pressable style={styles.pcBack} hitSlop={10} onPress={() => setPc(null)}>
                  <Ionicons name="close" size={24} color={colors.muted} />
                </Pressable>
                <View style={styles.pcCrest}>
                  <Ionicons name="lock-closed" size={26} color={colors.gold} />
                </View>
                <Text style={styles.pcTitle}>
                  {pc === 'enter' ? (hasPass ? 'New passcode' : 'Set a passcode') : 'Confirm passcode'}
                </Text>
                <Text style={styles.pcSub}>
                  {pc === 'enter' ? 'Choose a 4-digit code.' : 'Re-enter to confirm.'}
                </Text>
                <View style={{ marginTop: 26 }}>
                  <PasscodeEntry key={pc} onComplete={onPasscode} errorNonce={errNonce} message={pcMessage} />
                </View>
              </View>
            </SafeAreaView>
          </View>
        )}
      </View>
    </Modal>
  );
});

export default SettingsSheet;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ivory },
  headerClose: { position: 'absolute', right: 18, top: 12 },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  identity: { alignItems: 'center', padding: 24, paddingTop: 26 },
  bigCrest: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(248,221,151,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nameInput: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ivory,
    minWidth: 160,
    paddingVertical: 2,
  },
  editHint: { fontFamily: fonts.body, fontSize: 11.5, color: colors.faint, marginTop: 4 },
  crestLabel: { fontFamily: fonts.bodySemi, fontSize: 10, letterSpacing: 1.8, color: colors.muted, marginTop: 22, alignSelf: 'flex-start' },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, alignSelf: 'stretch' },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
  avatarBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(248,221,151,0.10)' },

  section: {
    fontFamily: fonts.bodySemi,
    fontSize: 10.5,
    letterSpacing: 1.8,
    color: colors.muted,
    marginTop: 26,
    marginBottom: 10,
    marginLeft: 4,
  },
  group: { paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.glassBorderSoft },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,221,151,0.07)',
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
    marginRight: 14,
  },
  rowLabel: { flex: 1, fontFamily: fonts.bodyMed, fontSize: 15, color: colors.ivory },
  rowValue: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold, marginRight: 4 },

  confirmWrap: { padding: 14 },
  confirmText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.muted, lineHeight: 20 },
  confirmRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  confirmCancel: {
    flex: 1,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ivory },
  confirmErase: {
    flex: 1,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmEraseText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.black },

  footer: { fontFamily: fonts.body, fontSize: 11.5, color: colors.faint, textAlign: 'center', marginTop: 28 },

  pcOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.base },
  pcContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  pcBack: { position: 'absolute', top: 8, right: 18 },
  pcCrest: {
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
  pcTitle: { fontFamily: fonts.display, fontSize: 26, color: colors.ivory },
  pcSub: { fontFamily: fonts.body, fontSize: 13.5, color: colors.muted, marginTop: 8 },
});
