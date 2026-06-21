import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform, Share } from 'react-native';
import { colors, fonts, radius, moneyRange } from '../theme';
import CoinAvatar from './CoinAvatar';
import RarityBadge from './RarityBadge';
import PillButton from './PillButton';
import * as haptics from '../services/haptics';
import { captureToImage } from '../services/captureCard';

// A premium, shareable "card" for a coin. On web it's captured to a PNG image
// (shared or downloaded); on native (Expo Go) it shares a text summary, since
// view-to-image capture needs a custom dev build.
export default function ShareSheet({ coin, onClose }) {
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef(null);

  if (!coin) return null;

  const fileName = `${coin.name.replace(/\s+/g, '-')}.png`;
  const message =
    `${coin.name} — ${coin.flag} ${coin.country}, ${coin.year}\n` +
    `Estimated value: ${moneyRange(coin.valueLow, coin.valueHigh)} · ${coin.rarity}\n` +
    `Identified with CoinInsight.`;

  const shareImageWeb = async () => {
    const dataUrl = await captureToImage(cardRef.current);
    if (!dataUrl) {
      setNote('Could not create the image.');
      return;
    }
    // Try the Web Share API with the file first…
    try {
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: coin.name });
          return;
        }
      }
    } catch {
      // fall through to download
    }
    // …otherwise download the PNG.
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setNote('Saved the card image to your downloads.');
  };

  const onShare = async () => {
    haptics.tap();
    setNote(null);
    setBusy(true);
    try {
      if (Platform.OS === 'web') {
        await shareImageWeb();
      } else {
        await Share.share({ message, title: coin.name });
      }
    } catch {
      // user dismissed the share sheet — nothing to do
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.center}>
          <View ref={cardRef} style={styles.card}>
            <View style={styles.sheen} />
            <View style={styles.brandRow}>
              <Text style={styles.brandMark}>✦</Text>
              <Text style={styles.brand}>COININSIGHT</Text>
            </View>

            <View style={styles.coinWrap}>
              <CoinAvatar coin={coin} size={132} />
            </View>

            <Text style={styles.name} numberOfLines={2}>
              {coin.name}
            </Text>
            <Text style={styles.meta}>
              {coin.flag} {coin.country} · {coin.year}
            </Text>
            <View style={{ marginTop: 14 }}>
              <RarityBadge tier={coin.rarity} />
            </View>

            <Text style={styles.valueLabel}>ESTIMATED VALUE</Text>
            <Text style={styles.value}>{moneyRange(coin.valueLow, coin.valueHigh)}</Text>

            <View style={styles.rule} />
            <Text style={styles.tagline}>Identified with CoinInsight</Text>
          </View>

          <PillButton
            label={busy ? 'Preparing…' : Platform.OS === 'web' ? 'Save card image' : 'Share coin'}
            icon={Platform.OS === 'web' ? 'download' : 'share-social'}
            onPress={onShare}
            style={styles.shareBtn}
          />
          {note ? <Text style={styles.note}>{note}</Text> : null}
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center' },
  center: { alignItems: 'center', paddingHorizontal: 24 },

  card: {
    width: 300,
    borderRadius: 26,
    backgroundColor: colors.baseWarm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  sheen: {
    position: 'absolute',
    top: -120,
    width: 360,
    height: 240,
    borderRadius: 180,
    backgroundColor: 'rgba(224,138,46,0.16)',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 22 },
  brandMark: { fontSize: 13, color: colors.gold, marginTop: -1 },
  brand: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2.5, color: colors.gold },

  coinWrap: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(248,221,151,0.05)',
    marginBottom: 20,
  },
  name: { fontFamily: fonts.display, fontSize: 24, color: colors.ivory, textAlign: 'center' },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 8 },

  valueLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.muted,
    marginTop: 24,
  },
  value: { fontFamily: fonts.serif, fontSize: 30, color: colors.gold, marginTop: 6 },

  rule: { width: 40, height: 2, borderRadius: 1, backgroundColor: colors.glassBorder, marginTop: 24 },
  tagline: { fontFamily: fonts.body, fontSize: 11.5, color: colors.faint, marginTop: 16 },

  shareBtn: { alignSelf: 'stretch', marginTop: 26 },
  note: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 12,
  },
  closeText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.muted, marginTop: 18 },
});
