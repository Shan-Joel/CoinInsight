import * as htmlToImage from 'html-to-image';
import { Asset } from 'expo-asset';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces';

// Exactly the font families the share card renders with. The @font-face
// family name must match what react-native-web applies (the useFonts key).
const FONTS = [
  ['PlusJakartaSans_400Regular', PlusJakartaSans_400Regular],
  ['PlusJakartaSans_600SemiBold', PlusJakartaSans_600SemiBold],
  ['PlusJakartaSans_700Bold', PlusJakartaSans_700Bold],
  ['Fraunces_500Medium', Fraunces_500Medium],
];

function bufferToBase64(buf) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

let cachedCss = null;

// Build a self-contained @font-face stylesheet (fonts inlined as base64) for
// only the families the card uses. Passing this to html-to-image stops it from
// scanning/fetching every stylesheet on the page — which is what hung before.
async function buildFontEmbedCSS() {
  if (cachedCss != null) return cachedCss;
  const parts = await Promise.all(
    FONTS.map(async ([family, mod]) => {
      try {
        const asset = Asset.fromModule(mod);
        if (!asset.downloaded) await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        const buf = await (await fetch(uri)).arrayBuffer();
        const b64 = bufferToBase64(buf);
        return `@font-face{font-family:'${family}';font-style:normal;font-weight:400;src:url(data:font/ttf;base64,${b64}) format('truetype');}`;
      } catch {
        return '';
      }
    })
  );
  cachedCss = parts.filter(Boolean).join('\n');
  return cachedCss;
}

// Pre-warm the font CSS so the first share is fast.
buildFontEmbedCSS().catch(() => {});

export async function captureToImage(node) {
  if (!node) return null;
  const el = node.nodeType ? node : node?._node || node;

  let fontEmbedCSS = '';
  try {
    fontEmbedCSS = await buildFontEmbedCSS();
  } catch {}

  const shot = htmlToImage
    .toPng(el, {
      pixelRatio: 2,
      cacheBust: false,
      fontEmbedCSS,
      backgroundColor: '#140d08',
    })
    .catch(() => null);

  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 20000));
  return Promise.race([shot, timeout]);
}

export const canCaptureImage = true;
