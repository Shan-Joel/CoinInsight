// Design tokens for CoinInsight — "the warm vault."
// Espresso-black lit from within by amber firelight, glass panels, gold leaf.

export const colors = {
  // Warm near-black surfaces
  void: '#080604',
  base: '#0E0A07',
  baseWarm: '#140D08',

  // Glass — translucent warm panels that sit over the ember glow
  glass: 'rgba(255, 248, 236, 0.045)',
  glassRaised: 'rgba(255, 246, 232, 0.07)',
  glassBorder: 'rgba(255, 238, 214, 0.10)',
  glassBorderSoft: 'rgba(255, 238, 214, 0.05)',

  // Ember program (used by the atmospheric gradients)
  emberDeep: '#6E2C0C',
  ember: '#B5611C',
  emberBright: '#E08A2E',

  // Gold / amber accents
  gold: '#EBB85C',
  goldBright: '#F8DD97',
  goldDeep: '#A9761F',
  goldGlow: 'rgba(235, 184, 92, 0.20)',

  // Primary CTA — warm white pill
  cta: '#FBF6EC',
  ctaPress: '#ECE3D2',

  // Type
  ivory: '#F7EFE0',
  text: '#EFE6D5',
  muted: '#A99B85',
  faint: '#6C6151',

  // Utility
  positive: '#86C9A0',
  danger: '#E08A6B',
  black: '#16100A',
};

// Rarity tiers
export const rarity = {
  Common: { label: 'Common', color: '#A99B85', glow: 'rgba(169,155,133,0.14)' },
  Uncommon: { label: 'Uncommon', color: '#7FC59B', glow: 'rgba(127,197,155,0.16)' },
  Rare: { label: 'Rare', color: '#7FAEE6', glow: 'rgba(127,174,230,0.16)' },
  'Very Rare': { label: 'Very Rare', color: '#C79BEC', glow: 'rgba(199,155,236,0.18)' },
  Legendary: { label: 'Legendary', color: '#F2C766', glow: 'rgba(242,199,102,0.20)' },
};

export const fonts = {
  // Fraunces — luxury serif, reserved for large numerals.
  serif: 'Fraunces_500Medium',
  serifLight: 'Fraunces_400Regular',
  serifSemi: 'Fraunces_600SemiBold',
  // Plus Jakarta Sans — modern grotesk for everything else, mixed weights.
  light: 'PlusJakartaSans_300Light',
  body: 'PlusJakartaSans_400Regular',
  bodyMed: 'PlusJakartaSans_500Medium',
  bodySemi: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  bodyExtra: 'PlusJakartaSans_800ExtraBold',
  // legacy aliases (kept so older references still resolve)
  display: 'PlusJakartaSans_700Bold',
  displaySemi: 'PlusJakartaSans_600SemiBold',
  bodyRegular: 'PlusJakartaSans_400Regular',
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  xxl: 36,
  pill: 999,
};

export const spacing = (n) => n * 8;

export const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

export const moneyRange = (low, high) => `${money(low)} – ${money(high)}`;
