# CoinInsight 🪙

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=000)](https://reactnative.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev)
[![MobX](https://img.shields.io/badge/State-MobX%206-FF9955?logo=mobx&logoColor=white)](https://mobx.js.org)
[![Claude](https://img.shields.io/badge/AI-Claude%20Haiku-D97757)](https://www.anthropic.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-EBB85C.svg)](./LICENSE)

A premium **coin-collector** app — _"the collector's vault."_ Built with **React Native + Expo**
and **MobX**, wrapped in a warm obsidian UI with champagne-gold accents that feels like a
private-bank app for numismatics. Coins are identified for real by **Claude Haiku** vision, every
piece gets an AI-written history, and the whole collection is local-first and gated behind an
in-app passcode.

> Value estimates come from Claude and are illustrative — not a formal appraisal.

---

## ✨ Highlights

### 🔎 AI coin identification
- Snap or upload a coin photo → **`claude-haiku-4-5`** vision identifies it.
- Forced **tool-calling** returns clean, typed fields (name, country, ISO code → flag emoji,
  year, metal, value range, rarity enum, confidence, notes).
- Robust handling for *not-a-coin*, refusals, missing API key, and network errors.

### 📸 Capture
- **Live in-app camera** (`expo-camera`) framed inside the circular viewfinder, with a permission
  gate and an animated scan line.
- **Upload-a-photo** fallback (`expo-image-picker`) for the web preview or when the camera is unavailable.

### 🗂 Collection
- Responsive 2-column grid with glossy, minted-coin avatars (drawn with `react-native-svg`).
- **Search** (name / country), **filter** chips (All · ★ Favorites · Gold · Silver · Rare+),
  cycle-through **sort** (Recent · Value · Year · Name), and per-coin **favorites**.
- **Detail sheet** with the AI story, stats, an expert chat, share, and remove — fully scrollable
  with a "Read more" collapse.
- **Newly-added highlight**: a freshly scanned coin pops in with a gold glow.

### 📊 Dashboard
- Total collection value front-and-center, a **COINS / COUNTRIES / TOP METAL** stat strip,
  a **donut chart** of allocation by country (small countries folded into "Other"), and a
  **Top 5 most valuable** list. Everything is reactive off the store.

### 🧠 AI knowledge
- **Coin story** — Claude auto-writes a short, specific history for each coin (fetched once, cached on the coin).
- **Ask the expert** — a per-coin chat with a numismatic expert that knows _that_ coin: history,
  value drivers, authenticity tips, and care, with suggested starter questions.

### 🔐 Security — in-app passcode
- Optional **4-digit passcode** chosen during onboarding (enter → confirm), with a polished custom PIN pad.
- **Lock screen** on every launch when a passcode is set: shake-on-error, haptics, and a "Start a new vault" escape.
- Passcodes are **SHA-256 hashed** (`expo-crypto`) — never stored in plain text.

### 👤 Profile & settings
- Tap your avatar on the Dashboard → a **Settings sheet**: edit name & crest, **set / change / remove**
  the passcode, **lock now**, view collection stats, and **start a new vault** (with confirmation).

### 📤 Sharing
- A branded, shareable **collectible card** for any coin.
- On **web** it's rendered to a pixel-accurate **PNG** (with the app's embedded fonts) and shared/downloaded;
  on **native** it shares a text summary via the OS share sheet.

### 🎛 Design & feel
- Custom design system: **Fraunces** (serif numerals) + **Plus Jakarta Sans** (UI), glass panels,
  SVG ember-glow backgrounds, a floating pill tab bar, mixed-weight headlines.
- **Haptics** on capture, identify, add, favorite, and errors (`expo-haptics`, web-safe).
- Reveal/shake/pop animations throughout via the `Animated` API.

---

## How the scan works

1. `src/services/imagePicker.js` (or `expo-camera`) returns the chosen photo as base64.
2. `src/services/anthropic.js` sends it to **`claude-haiku-4-5`** with a vision prompt and a forced
   **`record_coin` tool**, so the model returns clean, typed fields.
3. The result is normalized into a coin (metal → gradient, ISO code → flag) and handed to the MobX
   store via `addCoin`, which persists the collection with `AsyncStorage`.

The Claude API is called over plain **`fetch`** (not the Node SDK) so the exact same code runs on
web and native — the official SDK pulls in `node:fs`, which the React Native bundler can't resolve.

---

## Security model

- **Local-first.** The collection and profile live only on-device in `AsyncStorage`; nothing is synced.
- **Passcode.** Stored as a salted SHA-256 hash via `expo-crypto`; the lock state is recomputed on launch.
- **AI access via a serverless proxy.** Claude is reached through a small **Cloudflare Worker**
  (`worker/`) that holds the API key as a **server-side secret** — the client only knows the proxy URL
  and an optional app token, so no credentials ship in the app. The Worker adds CORS and can gate
  requests behind a shared token. A direct-key path remains only as a local-dev fallback.
- **Images** are sent to Claude only for identification; results are stored locally on-device.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Runtime | Expo SDK 54 · React Native 0.81 · React 19 |
| State | MobX 6 + `mobx-react-lite` (observable store, computed analytics) |
| Navigation | React Navigation (bottom tabs) with a custom floating tab bar |
| AI | Claude `claude-haiku-4-5` (vision + tool use + multi-turn chat) over `fetch` |
| Backend | Cloudflare Worker proxy (`worker/`) — keeps the API key server-side |
| Graphics | `react-native-svg` (coin avatars, donut chart, ember backgrounds) |
| Device | `expo-camera`, `expo-image-picker`, `expo-haptics`, `expo-crypto`, `expo-local-authentication`\* |
| Storage | `@react-native-async-storage/async-storage` |
| Sharing | RN `Share` (native) · `html-to-image` (web card export) |
| Type | `@expo-google-fonts` — Fraunces · Plus Jakarta Sans |

<sub>\* `expo-local-authentication` remains wired for an optional future dev-build; the active lock is the in-app passcode.</sub>

---

## Architecture

```
App.js                       # Fonts, providers, AuthGate (onboarding / lock / tabs), nav
app.json · babel.config.js   # Expo config + plugins (camera, crypto, …)
(local env config)           # AI API key & local secrets — git-ignored, never committed
src/
  theme.js                   # Colors, fonts, spacing, radii, rarity tiers, money helpers
  data/coins.js              # Seed collection
  services/
    anthropic.js             # Claude: identifyCoin (vision+tool), coinStory, askExpert (shared fetch)
    imagePicker.js           # expo-image-picker → base64
    haptics.js               # web-safe haptic wrappers
    storage.js               # AsyncStorage load/save
    captureCard.web.js       # Web: render the share card to PNG (fonts embedded)
    captureCard.native.js    # Native no-op (keeps html-to-image out of the native bundle)
  stores/
    CoinStore.js             # Collection, add/remove/favorite, persistence, computed analytics
    SessionStore.js          # Profile, passcode (hashed), lock state, settings mutations
    index.js                 # Store context + hooks
  components/
    GlowBackground.js        # SVG warm-ember atmosphere
    GlassCard.js  PillButton.js  ScreenHeader.js
    CoinAvatar.js  RarityBadge.js  DonutChart.js
    PasscodeEntry.js         # Reusable PIN pad (dots + keypad + shake)
    ExpertChat.js            # Per-coin AI chat modal
    ShareSheet.js            # Shareable collectible card
    SettingsSheet.js         # Profile / security / account
  navigation/TabBar.js       # Floating glass tab bar (center Scan action)
  screens/
    OnboardingScreen.js      # Create vault → set passcode (with Skip)
    LockScreen.js            # Passcode entry on launch
    ScanScreen.js  CollectionScreen.js  DashboardScreen.js
worker/                      # Cloudflare Worker — Anthropic proxy (key stays server-side)
  src/index.js               #   forwards /v1/messages to Claude (CORS + optional app-token)
  wrangler.toml              #   deploy config; secrets via `wrangler secret put`
```

### Notable engineering details
- **Single source of truth.** Total value, per-country allocation, top-5, and top-metal are MobX
  **computeds** — add/remove/favorite a coin and every screen updates reactively; reloads rehydrate from storage.
- **Platform-split capture.** `captureCard.web.js` / `.native.js` let Metro keep `html-to-image` (and any
  web-only deps) entirely out of the native bundle.
- **Structured AI output.** Identification uses forced tool calling for guaranteed, typed JSON instead of prompt-parsing.
- **Key isolation.** All Claude traffic flows through the `worker/` proxy; the client ships only a proxy
  URL, never the API key.
- **Resilient UX.** Friendly error states for every async path (no key, not-a-coin, refusal, network), plus
  loading shimmers, empty states, and confirm-before-destroy on resets.

---

## License

[MIT](./LICENSE) © 2026 Shan Joel
