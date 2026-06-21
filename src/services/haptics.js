import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Thin wrappers that no-op on web and never throw, so call sites stay clean.
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export const tap = () => {
  if (!supported) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export const impact = () => {
  if (!supported) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

export const success = () => {
  if (!supported) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

export const warning = () => {
  if (!supported) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
};

export const error = () => {
  if (!supported) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
};

export default { tap, impact, success, warning, error };
