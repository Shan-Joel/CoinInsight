import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCoinStore } from '../stores';
import { colors, fonts, radius, money as fmt, moneyRange } from '../theme';
import GlowBackground from '../components/GlowBackground';
import GlassCard from '../components/GlassCard';
import ScreenHeader, { headerStyles } from '../components/ScreenHeader';
import CoinAvatar from '../components/CoinAvatar';
import RarityBadge from '../components/RarityBadge';
import PillButton from '../components/PillButton';
import ExpertChat from '../components/ExpertChat';
import ShareSheet from '../components/ShareSheet';
import { coinStory } from '../services/anthropic';
import * as haptics from '../services/haptics';

const SHEET_MAX_H = Dimensions.get('window').height * 0.86;

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'fav', label: '★ Favorites' },
  { key: 'gold', label: 'Gold' },
  { key: 'silver', label: 'Silver' },
  { key: 'rare', label: 'Rare+' },
];

const SORTS = [
  { key: 'recent', label: 'Recent' },
  { key: 'value', label: 'Value' },
  { key: 'year', label: 'Year' },
  { key: 'name', label: 'Name' },
];

const RARE_TIERS = ['Rare', 'Very Rare', 'Legendary'];
const yearNum = (c) => {
  const m = String(c.year).match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 0;
};

function matchesFilter(coin, key) {
  switch (key) {
    case 'fav':
      return !!coin.favorite;
    case 'gold':
      return /gold/i.test(coin.metal);
    case 'silver':
      return /silver/i.test(coin.metal);
    case 'rare':
      return RARE_TIERS.includes(coin.rarity);
    default:
      return true;
  }
}

const CoinCard = ({ coin, estimate, onPress, onToggleFav, highlight, onHighlightDone }) => {
  const glow = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Pop + gold glow when this is the just-added coin.
  useEffect(() => {
    if (!highlight) return;
    glow.setValue(0);
    scale.setValue(0.94);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 260, useNativeDriver: false }),
        Animated.delay(950),
        Animated.timing(glow, { toValue: 0, duration: 700, useNativeDriver: false }),
      ]),
    ]).start(() => onHighlightDone && onHighlightDone());
  }, [highlight]);

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable style={{ flex: 1 }} onPress={onPress}>
        <GlassCard style={styles.card}>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.glowOverlay, { opacity: glow }]}
          />
          <Pressable
            style={styles.star}
            hitSlop={8}
            onPress={(e) => {
              e?.stopPropagation?.();
              onToggleFav();
            }}
          >
            <Ionicons
              name={coin.favorite ? 'star' : 'star-outline'}
              size={18}
              color={coin.favorite ? colors.gold : colors.faint}
            />
          </Pressable>
          <View style={styles.avatarWrap}>
            <CoinAvatar coin={coin} size={84} />
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {coin.name}
          </Text>
          <Text style={styles.origin}>
            {coin.flag} {coin.country} · {coin.year}
          </Text>
          <Text style={styles.value}>{fmt(estimate)}</Text>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
};

const EmptyState = () => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name="scan-outline" size={30} color={colors.gold} />
    </View>
    <Text style={styles.emptyTitle}>Your vault is empty</Text>
    <Text style={styles.emptyBody}>
      Head to the Scan tab to identify a coin and add it to your collection.
    </Text>
  </View>
);

const NoMatches = ({ onClear }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name="search-outline" size={28} color={colors.gold} />
    </View>
    <Text style={styles.emptyTitle}>No coins match</Text>
    <Text style={styles.emptyBody}>Try a different search or filter.</Text>
    <Pressable onPress={onClear} style={{ marginTop: 16 }}>
      <Text style={styles.clearLink}>Clear filters</Text>
    </Pressable>
  </View>
);

const DetailModal = observer(({ coin, onClose, onAsk, onShare }) => {
  const store = useCoinStore();
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);

  // Lazily fetch + cache the AI history blurb the first time a coin is opened.
  useEffect(() => {
    setStoryExpanded(false);
    if (!coin) return;
    const current = store.getById(coin.id) || coin;
    if (current.story) return;
    let cancelled = false;
    setStoryLoading(true);
    coinStory(current)
      .then((s) => {
        if (!cancelled && s) store.setStory(coin.id, s);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setStoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [coin?.id]);

  if (!coin) return null;
  const live = store.getById(coin.id) || coin;

  const remove = () => {
    store.removeCoin(coin.id);
    onClose();
  };

  const longStory = (live.story || '').length > 180;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Tap-outside-to-dismiss lives behind the sheet so it never eats the
            sheet's scroll gesture on a real device. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <GlassCard raised style={styles.sheetCard}>
            <Pressable
              style={styles.favBtn}
              hitSlop={10}
              onPress={() => {
                haptics.tap();
                store.toggleFavorite(coin.id);
              }}
            >
              <Ionicons
                name={live.favorite ? 'star' : 'star-outline'}
                size={20}
                color={live.favorite ? colors.gold : colors.muted}
              />
            </Pressable>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color={colors.muted} />
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8 }}>
              <View style={styles.sheetTop}>
                <CoinAvatar coin={live} size={96} />
                <Text style={styles.sheetName}>{live.name}</Text>
                <Text style={styles.sheetMeta}>
                  {live.flag} {live.country} · {live.year}
                </Text>
                <View style={{ marginTop: 12 }}>
                  <RarityBadge tier={live.rarity} />
                </View>
              </View>

              <View style={styles.storyWrap}>
                <Text style={styles.storyLabel}>THE STORY</Text>
                {live.story ? (
                  <>
                    <Text
                      style={styles.storyText}
                      numberOfLines={!storyExpanded && longStory ? 4 : undefined}
                    >
                      {live.story}
                    </Text>
                    {longStory && (
                      <Pressable onPress={() => setStoryExpanded((v) => !v)} hitSlop={6}>
                        <Text style={styles.readMore}>
                          {storyExpanded ? 'Show less' : 'Read more'}
                        </Text>
                      </Pressable>
                    )}
                  </>
                ) : storyLoading ? (
                  <View style={styles.storyLoading}>
                    <ActivityIndicator color={colors.gold} size="small" />
                    <Text style={styles.storyLoadingText}>Consulting the archives…</Text>
                  </View>
                ) : (
                  <Text style={styles.storyMuted}>Story unavailable right now.</Text>
                )}
              </View>

              <View style={styles.sheetRows}>
                <Row label="Metal" value={live.metal || '—'} />
                <Row label="Estimated value" value={moneyRange(live.valueLow, live.valueHigh)} accent />
                {live.confidence != null && <Row label="Scan confidence" value={`${live.confidence}%`} />}
                {live.notes ? <Row label="Notes" value={live.notes} /> : null}
              </View>

              <PillButton
                label="Ask the expert"
                icon="chatbubbles"
                onPress={() => onAsk(live)}
                style={{ marginTop: 22 }}
              />

              <Pressable style={styles.shareRow} onPress={() => onShare(live)}>
                <Ionicons name="share-social-outline" size={18} color={colors.gold} />
                <Text style={styles.shareText}>Share as card</Text>
              </Pressable>

              <Pressable style={styles.removeBtn} onPress={remove}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={styles.removeText}>Remove from collection</Text>
              </Pressable>
            </ScrollView>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
});

const Row = ({ label, value, accent }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, accent && { color: colors.gold, fontFamily: fonts.serif, fontSize: 17 }]}>
      {value}
    </Text>
  </View>
);

const CollectionScreen = observer(() => {
  const store = useCoinStore();
  const [selected, setSelected] = useState(null);
  const [chatCoin, setChatCoin] = useState(null);
  const [shareCoin, setShareCoin] = useState(null);
  const [query, setQuery] = useState('');
  const [filterKey, setFilterKey] = useState('all');
  const [sortKey, setSortKey] = useState('recent');

  const hasCoins = store.coins.length > 0;

  // Filter → search → sort. (store.coins is observed; new scans land at the front.)
  let displayed = store.coins.filter((c) => matchesFilter(c, filterKey));
  const q = query.trim().toLowerCase();
  if (q) {
    displayed = displayed.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }
  if (sortKey === 'value') displayed = [...displayed].sort((a, b) => store.estimate(b) - store.estimate(a));
  else if (sortKey === 'year') displayed = [...displayed].sort((a, b) => yearNum(b) - yearNum(a));
  else if (sortKey === 'name') displayed = [...displayed].sort((a, b) => a.name.localeCompare(b.name));

  const cycleSort = () => {
    const i = SORTS.findIndex((s) => s.key === sortKey);
    setSortKey(SORTS[(i + 1) % SORTS.length].key);
  };
  const clearFilters = () => {
    setQuery('');
    setFilterKey('all');
  };

  const Header = (
    <>
      <ScreenHeader
        paddingHorizontal={0}
        eyebrow="THE VAULT"
        title={
          <>
            My <Text style={headerStyles.bold}>Collection</Text>
          </>
        }
        right={
          <View style={styles.countPill}>
            <Text style={styles.countNum}>{store.count}</Text>
            <Text style={styles.countLabel}>coins</Text>
          </View>
        }
      />

      {hasCoins && (
        <>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={17} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search coins or countries"
              placeholderTextColor={colors.faint}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTERS.map((f) => {
              const active = filterKey === f.key;
              const count = f.key === 'fav' ? store.favoriteCount : 0;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilterKey(f.key)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {f.label}
                    {f.key === 'fav' && count ? ` ${count}` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.resultsRow}>
            <Text style={styles.resultsCount}>
              {displayed.length} {displayed.length === 1 ? 'coin' : 'coins'}
            </Text>
            <Pressable style={styles.sortPill} onPress={cycleSort} hitSlop={6}>
              <Ionicons name="swap-vertical" size={14} color={colors.gold} />
              <Text style={styles.sortText}>{SORTS.find((s) => s.key === sortKey).label}</Text>
            </Pressable>
          </View>
        </>
      )}
    </>
  );

  return (
    <View style={styles.root}>
      <GlowBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <FlatList
          data={displayed}
          keyExtractor={(c) => c.id}
          numColumns={2}
          columnWrapperStyle={displayed.length ? styles.column : undefined}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={Header}
          ListEmptyComponent={hasCoins ? <NoMatches onClear={clearFilters} /> : <EmptyState />}
          renderItem={({ item }) => (
            <CoinCard
              coin={item}
              estimate={store.estimate(item)}
              onPress={() => setSelected(item)}
              onToggleFav={() => {
                haptics.tap();
                store.toggleFavorite(item.id);
              }}
              highlight={item.id === store.lastAddedId}
              onHighlightDone={() => store.clearLastAdded()}
            />
          )}
        />
      </SafeAreaView>

      <DetailModal
        coin={selected}
        onClose={() => setSelected(null)}
        onAsk={(c) => {
          setSelected(null);
          setChatCoin(c);
        }}
        onShare={(c) => setShareCoin(c)}
      />
      <ExpertChat coin={chatCoin} onClose={() => setChatCoin(null)} />
      <ShareSheet coin={shareCoin} onClose={() => setShareCoin(null)} />
    </View>
  );
});

export default CollectionScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  list: { paddingHorizontal: 18, paddingBottom: 130 },
  column: { gap: 16, marginBottom: 16 },

  countPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 6,
  },
  countNum: { fontFamily: fonts.serif, fontSize: 24, color: colors.gold },
  countLabel: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginLeft: 7 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.ivory,
    fontFamily: fonts.bodyMed,
    fontSize: 14.5,
  },

  chipsRow: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
  chipActive: { backgroundColor: 'rgba(248,221,151,0.12)', borderColor: colors.gold },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.muted },
  chipTextActive: { color: colors.gold },

  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 14,
  },
  resultsCount: { fontFamily: fonts.bodySemi, fontSize: 12.5, letterSpacing: 0.3, color: colors.muted },
  sortPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.gold },

  card: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  glowOverlay: {
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: 'rgba(248,221,151,0.08)',
    zIndex: 1,
  },
  star: { position: 'absolute', top: 12, right: 12, zIndex: 2, padding: 2 },
  avatarWrap: {
    padding: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(248,221,151,0.05)',
    marginBottom: 20,
  },
  name: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ivory,
    textAlign: 'center',
    minHeight: 40,
  },
  origin: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  value: { fontFamily: fonts.serif, fontSize: 19, color: colors.gold },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ivory },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  clearLink: { fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.gold },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: { width: '100%' },
  sheetCard: { padding: 24, backgroundColor: colors.baseWarm, maxHeight: SHEET_MAX_H },
  favBtn: { position: 'absolute', top: 16, left: 16, zIndex: 2 },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 2 },
  sheetTop: { alignItems: 'center', marginTop: 4 },

  storyWrap: {
    marginTop: 22,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
    borderRadius: radius.md,
    padding: 16,
  },
  storyLabel: { fontFamily: fonts.bodySemi, fontSize: 10, letterSpacing: 1.8, color: colors.gold },
  storyText: {
    fontFamily: fonts.serifLight,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginTop: 10,
  },
  storyMuted: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 10 },
  storyLoading: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  storyLoadingText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  readMore: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.gold, marginTop: 10 },
  sheetName: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ivory,
    textAlign: 'center',
    marginTop: 16,
  },
  sheetMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 6 },

  sheetRows: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorderSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorderSoft,
  },
  rowLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, flex: 1 },
  rowValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ivory,
    flex: 1.4,
    textAlign: 'right',
  },

  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    height: 50,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
  shareText: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.gold, marginLeft: 8 },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    height: 50,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(224,138,107,0.4)',
    backgroundColor: 'rgba(224,138,107,0.08)',
  },
  removeText: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.danger, marginLeft: 8 },
});
