import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCoinStore } from '../stores';
import { colors, fonts, radius, moneyRange } from '../theme';
import GlowBackground from '../components/GlowBackground';
import GlassCard from '../components/GlassCard';
import PillButton from '../components/PillButton';
import RarityBadge from '../components/RarityBadge';
import { pickCoinImage } from '../services/imagePicker';
import { identifyCoin, hasApiKey } from '../services/anthropic';
import * as haptics from '../services/haptics';

const RING = Math.min(Dimensions.get('window').width * 0.62, 244);
const DOCK_CLEAR = 120;

const ScanScreen = observer(({ navigation }) => {
  const store = useCoinStore();
  const [phase, setPhase] = useState('idle'); // idle | identifying | result | error | added
  const [photo, setPhoto] = useState(null); // { uri, base64, mediaType }
  const [coin, setCoin] = useState(null);
  const [error, setError] = useState(null); // { code, message }

  const sweep = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const addTimer = useRef(null);

  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraReady = !!permission?.granted;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  // Clear any pending auto-navigate when the screen unmounts.
  useEffect(() => () => addTimer.current && clearTimeout(addTimer.current), []);

  const reveal = () => {
    cardY.setValue(40);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(cardY, { toValue: 0, tension: 60, friction: 9, useNativeDriver: false }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 340, useNativeDriver: false }),
    ]).start();
  };

  const reset = () => {
    if (addTimer.current) clearTimeout(addTimer.current);
    setPhase('idle');
    setPhoto(null);
    setCoin(null);
    setError(null);
  };

  const runIdentify = async (picked) => {
    try {
      setPhoto(picked);
      setError(null);
      setPhase('identifying');
      const result = await identifyCoin(picked.base64, picked.mediaType);
      setCoin(result);
      setPhase('result');
      reveal();
      haptics.success();
    } catch (e) {
      setError({ code: e.code || 'API_ERROR', message: e.message });
      setPhase('error');
      haptics.error();
    }
  };

  // Capture a frame from the live camera feed.
  const onCapture = async () => {
    if (phase === 'identifying' || !cameraRef.current) return;
    haptics.impact();
    try {
      const pic = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (!pic?.base64) throw Object.assign(new Error('Capture failed.'), { code: 'API_ERROR' });
      await runIdentify({ uri: pic.uri, base64: pic.base64, mediaType: 'image/jpeg' });
    } catch (e) {
      setError({ code: e.code || 'API_ERROR', message: e.message });
      setPhase('error');
    }
  };

  // Fallback: pick an existing photo (used on web / when the camera is unavailable).
  const onPickLibrary = async () => {
    if (phase === 'identifying') return;
    try {
      const picked = await pickCoinImage();
      if (picked) await runIdentify(picked);
    } catch (e) {
      setError({ code: e.code || 'API_ERROR', message: e.message });
      setPhase('error');
    }
  };

  const onAdd = () => {
    if (!coin) return;
    store.addCoin(coin);
    haptics.success();
    setPhase('added');
    // Briefly show the confirmation, then return to the collection automatically.
    if (addTimer.current) clearTimeout(addTimer.current);
    addTimer.current = setTimeout(() => {
      reset();
      navigation?.navigate?.('Collection');
    }, 1200);
  };

  const lineTop = sweep.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [RING * 0.12, RING * 0.88, RING * 0.12],
  });

  const showHeadline = phase === 'idle' || phase === 'identifying';
  const photoSize = RING - 26;

  return (
    <View style={styles.root}>
      <GlowBackground variant="hero" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topBar}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>COIN_INSIGHT</Text>
          </View>
          <View style={styles.iconBtn}>
            <Ionicons name="sparkles-outline" size={16} color={colors.gold} />
          </View>
        </View>

        {showHeadline && (
          <View>
            <Text style={styles.kicker}>IDENTIFY</Text>
            <Text style={styles.headline}>
              Know what's in{'\n'}
              <Text style={styles.headlineBold}>your pocket</Text>
            </Text>
          </View>
        )}

        {/* Viewfinder */}
        <View style={styles.viewfinderWrap}>
          <View style={[styles.viewfinder, { width: RING, height: RING }]}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />

            {photo ? (
              <Image
                source={{ uri: photo.uri }}
                style={{ width: photoSize, height: photoSize, borderRadius: photoSize / 2 }}
              />
            ) : cameraReady && phase === 'idle' ? (
              <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
            ) : (
              <Ionicons name="ellipse-outline" size={RING * 0.4} color="rgba(248,221,151,0.16)" />
            )}

            {phase === 'identifying' && (
              <>
                <Animated.View style={[styles.scanLine, { top: lineTop }]} />
                <View style={styles.spinnerOverlay}>
                  <ActivityIndicator color={colors.goldBright} />
                </View>
              </>
            )}
          </View>

          <Text style={styles.prompt}>
            {phase === 'identifying'
              ? 'Claude is analyzing your coin…'
              : phase === 'result'
              ? `Identified · ${coin?.confidence}% confidence`
              : phase === 'added'
              ? 'Added to your vault'
              : phase === 'error'
              ? 'Identification failed'
              : cameraReady
              ? 'Center a coin in the frame'
              : 'Enable the camera to start scanning'}
          </Text>
        </View>

        {/* Bottom action area */}
        <View style={styles.bottom}>
          {phase === 'result' && coin && (
            <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardY }] }}>
              <GlassCard raised style={styles.resultCard}>
                <View style={styles.resultHead}>
                  <Image source={{ uri: photo?.uri }} style={styles.thumb} />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.resultName} numberOfLines={2}>
                      {coin.name}
                    </Text>
                    <Text style={styles.resultMeta} numberOfLines={1}>
                      {coin.flag} {coin.country} · {coin.year} · {coin.metal}
                    </Text>
                  </View>
                  <RarityBadge tier={coin.rarity} size="sm" />
                </View>

                <View style={styles.divider} />

                <View style={styles.valueRow}>
                  <View>
                    <Text style={styles.valueLabel}>ESTIMATED VALUE</Text>
                    <Text style={styles.valueAmount}>{moneyRange(coin.valueLow, coin.valueHigh)}</Text>
                  </View>
                  <View style={styles.confidence}>
                    <Text style={styles.confidencePct}>{coin.confidence}%</Text>
                    <Text style={styles.confidenceLabel}>confidence</Text>
                  </View>
                </View>

                <PillButton label="Add to Collection" icon="add" onPress={onAdd} style={{ marginTop: 22 }} />
              </GlassCard>
              <Text style={styles.linkBtn} onPress={reset}>
                Scan a different coin
              </Text>
            </Animated.View>
          )}

          {phase === 'added' && coin && (
            <GlassCard raised style={styles.addedCard}>
              <View style={styles.addedCheck}>
                <Ionicons name="checkmark" size={26} color={colors.black} />
              </View>
              <Text style={styles.addedTitle}>{coin.name}</Text>
              <Text style={styles.addedSub}>Added · opening your collection…</Text>
            </GlassCard>
          )}

          {phase === 'error' && (
            <View>
              <GlassCard raised style={styles.errorCard}>
                <View style={styles.errorIcon}>
                  <Ionicons
                    name={error?.code === 'NOT_A_COIN' ? 'help-circle-outline' : 'alert-circle-outline'}
                    size={26}
                    color={colors.gold}
                  />
                </View>
                <Text style={styles.errorTitle}>{errorTitle(error)}</Text>
                <Text style={styles.errorMsg}>{errorBody(error)}</Text>
              </GlassCard>
              <PillButton label="Try again" icon="camera" onPress={reset} style={{ marginTop: 16 }} />
            </View>
          )}

          {(phase === 'idle' || phase === 'identifying') && (
            <View>
              <PillButton
                label={phase === 'identifying' ? 'Identifying…' : cameraReady ? 'Capture coin' : 'Enable camera'}
                icon={phase === 'identifying' ? 'sync' : cameraReady ? 'scan' : 'camera'}
                onPress={phase === 'identifying' ? undefined : cameraReady ? onCapture : requestPermission}
              />
              {phase === 'idle' && (
                <Text style={styles.linkBtn} onPress={onPickLibrary}>
                  Upload a photo instead
                </Text>
              )}
            </View>
          )}

          {phase === 'idle' && !hasApiKey() && (
            <Text style={styles.keyHint}>
              Add EXPO_PUBLIC_ANTHROPIC_API_KEY to .env to enable scanning.
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
});

function errorTitle(error) {
  switch (error?.code) {
    case 'NO_API_KEY':
      return 'API key needed';
    case 'NOT_A_COIN':
      return "That's not a coin";
    case 'NO_PERMISSION':
      return 'Permission needed';
    default:
      return 'Something went wrong';
  }
}

function errorBody(error) {
  switch (error?.code) {
    case 'NO_API_KEY':
      return 'Paste your Anthropic API key into the .env file (EXPO_PUBLIC_ANTHROPIC_API_KEY) and reload.';
    case 'NOT_A_COIN':
      return 'Claude couldn’t find a coin in that photo. Try a clearer, well-lit shot.';
    case 'NO_PERMISSION':
      return 'Allow photo access so the app can read your coin image.';
    default:
      return error?.message || 'Please try again in a moment.';
  }
}

export default ScanScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 6,
  },
  liveTag: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.positive, marginRight: 8 },
  liveText: { fontFamily: fonts.bodySemi, fontSize: 10.5, letterSpacing: 1.8, color: colors.muted },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },

  kicker: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.gold,
    marginTop: 22,
    marginLeft: 26,
  },
  headline: {
    fontFamily: fonts.light,
    fontSize: 30,
    lineHeight: 36,
    color: colors.ivory,
    marginTop: 10,
    marginLeft: 26,
  },
  headlineBold: { fontFamily: fonts.bodyExtra, color: colors.ivory },

  viewfinderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  viewfinder: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(248,221,151,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: colors.gold, zIndex: 2 },
  tl: { top: 14, left: 14, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 },
  tr: { top: 14, right: 14, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 },
  bl: { bottom: 14, left: 14, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 },
  br: { bottom: 14, right: 14, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 },
  scanLine: {
    position: 'absolute',
    left: 18,
    right: 18,
    height: 2,
    backgroundColor: colors.goldBright,
    shadowColor: colors.goldBright,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    zIndex: 3,
  },
  spinnerOverlay: { position: 'absolute', bottom: 22 },
  prompt: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 30, textAlign: 'center', paddingHorizontal: 24 },

  bottom: { paddingHorizontal: 24, paddingBottom: DOCK_CLEAR },

  resultCard: { padding: 22 },
  resultHead: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.surface },
  resultName: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 22, color: colors.ivory },
  resultMeta: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 5 },
  divider: { height: 1, backgroundColor: colors.glassBorderSoft, marginVertical: 20 },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  valueLabel: { fontFamily: fonts.bodySemi, fontSize: 10, letterSpacing: 1.8, color: colors.muted },
  valueAmount: { fontFamily: fonts.serif, fontSize: 27, color: colors.gold, marginTop: 8 },
  confidence: { alignItems: 'flex-end' },
  confidencePct: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.positive },
  confidenceLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2 },

  addedCard: { padding: 26, alignItems: 'center' },
  addedCheck: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addedTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ivory, textAlign: 'center' },
  addedSub: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 4 },

  errorCard: { padding: 24, alignItems: 'center' },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorTitle: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ivory, textAlign: 'center' },
  errorMsg: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },

  linkBtn: {
    fontFamily: fonts.bodySemi,
    fontSize: 13.5,
    color: colors.gold,
    textAlign: 'center',
    marginTop: 18,
  },
  keyHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
