import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const KEY = 'coininsight.profile.v1';

// Hash the passcode so we never store it in plain text. Falls back to a marked
// value if crypto is unavailable for any reason.
async function hashCode(code) {
  try {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `coininsight:${code}`
    );
  } catch {
    return `plain:${code}`;
  }
}

// Holds the collector's local profile and the vault lock state, gated by an
// optional in-app 4-digit passcode (chosen during onboarding).
export class SessionStore {
  profile = null; // { name, avatar, passcodeHash }
  locked = false;
  hydrated = false;

  constructor() {
    makeAutoObservable(this);
    this.hydrate();
  }

  async hydrate() {
    let profile = null;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) profile = JSON.parse(raw);
    } catch {}
    runInAction(() => {
      this.profile = profile;
      // Lock on launch only when a passcode was set.
      this.locked = !!profile?.passcodeHash;
      this.hydrated = true;
    });
  }

  get onboarded() {
    return !!this.profile;
  }

  get hasPasscode() {
    return !!this.profile?.passcodeHash;
  }

  async createProfile(name, avatar, passcode) {
    const clean = (name || '').trim() || 'Collector';
    const passcodeHash = passcode ? await hashCode(passcode) : null;
    const profile = { name: clean, avatar: avatar || '🪙', passcodeHash };
    runInAction(() => {
      this.profile = profile;
      this.locked = false;
    });
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(profile));
    } catch {}
  }

  async updateProfile({ name, avatar }) {
    if (!this.profile) return;
    const next = { ...this.profile };
    if (name != null) next.name = name.trim() || 'Collector';
    if (avatar != null) next.avatar = avatar;
    runInAction(() => {
      this.profile = next;
    });
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  async setPasscode(code) {
    if (!this.profile) return;
    const passcodeHash = await hashCode(code);
    const next = { ...this.profile, passcodeHash };
    runInAction(() => {
      this.profile = next;
    });
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  async removePasscode() {
    if (!this.profile) return;
    const next = { ...this.profile, passcodeHash: null };
    runInAction(() => {
      this.profile = next;
      this.locked = false;
    });
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  // Returns true if the passcode matches (or none is set).
  async unlock(passcode) {
    if (!this.hasPasscode) {
      runInAction(() => {
        this.locked = false;
      });
      return true;
    }
    const h = await hashCode(passcode);
    if (h === this.profile.passcodeHash) {
      runInAction(() => {
        this.locked = false;
      });
      return true;
    }
    return false;
  }

  lock() {
    if (this.hasPasscode) {
      runInAction(() => {
        this.locked = true;
      });
    }
  }

  async signOut() {
    runInAction(() => {
      this.profile = null;
      this.locked = false;
    });
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {}
  }
}
