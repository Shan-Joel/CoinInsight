import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { observer } from 'mobx-react-lite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCoinStore, useSessionStore } from '../stores';
import { colors, fonts, radius, money } from '../theme';
import GlowBackground from '../components/GlowBackground';
import GlassCard from '../components/GlassCard';
import ScreenHeader, { headerStyles } from '../components/ScreenHeader';
import CoinAvatar from '../components/CoinAvatar';
import DonutChart, { SEGMENT_COLORS } from '../components/DonutChart';
import SettingsSheet from '../components/SettingsSheet';

function groupCountries(list, max = 4) {
  if (list.length <= max + 1) return list;
  const head = list.slice(0, max);
  const fold = list.slice(max).reduce(
    (acc, c) => ({
      country: 'Other',
      flag: '🌐',
      value: acc.value + c.value,
      pct: acc.pct + c.pct,
      count: acc.count + c.count,
    }),
    { value: 0, pct: 0, count: 0 }
  );
  return [...head, fold];
}

function topMetal(coins, estimate) {
  const m = new Map();
  for (const c of coins) m.set(c.metal, (m.get(c.metal) || 0) + estimate(c));
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

const Stat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const DashboardScreen = observer(() => {
  const store = useCoinStore();
  const session = useSessionStore();
  const [showSettings, setShowSettings] = useState(false);
  const countries = groupCountries(store.byCountry);
  const top = store.topValuable;
  const firstName = (session.profile?.name || 'Collector').split(' ')[0];

  return (
    <View style={styles.root}>
      <GlowBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ScreenHeader
            eyebrow={`HELLO, ${firstName.toUpperCase()}`}
            title={
              <>
                My <Text style={headerStyles.bold}>Portfolio</Text>
              </>
            }
            right={
              <Pressable style={styles.profileBtn} onPress={() => setShowSettings(true)} hitSlop={8}>
                <Text style={{ fontSize: 20 }}>{session.profile?.avatar || '🪙'}</Text>
                {session.hasPasscode && (
                  <View style={styles.lockDot}>
                    <Ionicons name="lock-closed" size={9} color={colors.black} />
                  </View>
                )}
              </Pressable>
            }
          />

          {/* Hero net-worth panel */}
          <GlassCard raised style={styles.hero}>
            <Text style={styles.heroLabel}>TOTAL COLLECTION VALUE</Text>
            <View style={styles.heroValueRow}>
              <Text style={styles.heroValue}>{money(store.totalValue)}</Text>
              <View style={styles.trendTag}>
                <Ionicons name="trending-up" size={13} color={colors.positive} />
                <Text style={styles.trendText}>8.4%</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <Stat label="COINS" value={String(store.count)} />
              <View style={styles.statDivider} />
              <Stat label="COUNTRIES" value={String(store.byCountry.length)} />
              <View style={styles.statDivider} />
              <Stat label="TOP METAL" value={topMetal(store.coins, (c) => store.estimate(c))} />
            </View>
          </GlassCard>

          {/* Allocation by country */}
          <GlassCard style={styles.panel}>
            <Text style={styles.panelTitle}>Allocation by Country</Text>

            <View style={styles.donutWrap}>
              <DonutChart
                data={countries}
                size={196}
                centerSub="HOLDINGS"
                centerLabel={String(store.count)}
              />
            </View>

            {countries.map((c, i) => (
              <View key={c.country} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }]} />
                <Text style={styles.legendFlag}>{c.flag}</Text>
                <Text style={styles.legendName} numberOfLines={1}>
                  {c.country}
                </Text>
                <Text style={styles.legendPct}>{Math.round(c.pct * 100)}%</Text>
              </View>
            ))}
          </GlassCard>

          {/* Top 5 most valuable */}
          <GlassCard style={styles.panel}>
            <Text style={styles.panelTitle}>Top 5 Most Valuable</Text>
            {top.map((coin, idx) => (
              <View key={coin.id} style={[styles.rankRow, idx === 0 && { marginTop: 10 }]}>
                <Text style={styles.rank}>{idx + 1}</Text>
                <CoinAvatar coin={coin} size={44} />
                <View style={styles.rankBody}>
                  <Text style={styles.rankName} numberOfLines={1}>
                    {coin.name}
                  </Text>
                  <Text style={styles.rankMeta} numberOfLines={1}>
                    {coin.flag} {coin.country} · {coin.year}
                  </Text>
                </View>
                <Text style={styles.rankValue}>{money(store.estimate(coin))}</Text>
              </View>
            ))}
          </GlassCard>

          <Text style={styles.footnote}>
            Estimates derived from recent auction comparables. Not a formal appraisal.
          </Text>
        </ScrollView>
      </SafeAreaView>

      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </View>
  );
});

export default DashboardScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  scroll: { paddingBottom: 130 },

  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  lockDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.base,
  },

  hero: { marginHorizontal: 20, padding: 26 },
  heroLabel: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 2.4, color: colors.gold },
  heroValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 14 },
  heroValue: {
    fontFamily: fonts.serifLight,
    fontSize: 54,
    lineHeight: 58,
    color: colors.ivory,
    letterSpacing: 0.5,
  },
  trendTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(134,201,160,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginLeft: 14,
    marginBottom: 12,
  },
  trendText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.positive, marginLeft: 4 },

  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorderSoft,
  },
  stat: { flex: 1 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.glassBorderSoft },
  statLabel: { fontFamily: fonts.bodySemi, fontSize: 9.5, letterSpacing: 1.4, color: colors.muted },
  statValue: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ivory, marginTop: 7 },

  panel: { marginHorizontal: 20, marginTop: 18, paddingVertical: 26, paddingHorizontal: 24 },
  panelTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.ivory,
    letterSpacing: 0.2,
  },

  donutWrap: { alignItems: 'center', marginTop: 22, marginBottom: 26 },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginRight: 12 },
  legendFlag: { fontSize: 14, marginRight: 10 },
  legendName: { flex: 1, fontFamily: fonts.bodyMed, fontSize: 14, color: colors.text },
  legendPct: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ivory },

  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rank: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.gold,
    width: 22,
    textAlign: 'center',
    marginRight: 12,
  },
  rankBody: { flex: 1, marginLeft: 16, marginRight: 12 },
  rankName: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ivory },
  rankMeta: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 3 },
  rankValue: { fontFamily: fonts.serif, fontSize: 17, color: colors.gold, flexShrink: 0 },

  footnote: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 26,
    marginHorizontal: 36,
    lineHeight: 18,
  },
});
