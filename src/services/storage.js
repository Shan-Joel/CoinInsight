import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'coininsight.collection.v1';

export async function loadCollection() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveCollection(coins) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(coins));
  } catch {
    // best-effort persistence; ignore quota / serialization failures
  }
}
