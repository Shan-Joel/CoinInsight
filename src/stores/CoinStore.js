import { makeAutoObservable, runInAction } from 'mobx';
import { COINS } from '../data/coins';
import { loadCollection, saveCollection } from '../services/storage';

// A single observable store holding the collection plus derived analytics.
// The collection is hydrated from (and persisted to) device storage.
export class CoinStore {
  coins = [];
  hydrated = false;
  lastAddedId = null; // drives the "newly added" highlight in the Collection

  constructor() {
    this.coins = COINS.map((c) => ({ ...c }));
    makeAutoObservable(this);
    this.hydrate();
  }

  async hydrate() {
    const stored = await loadCollection();
    runInAction(() => {
      // null → first run, keep the seeded mock collection.
      // an array (even empty) → the user's saved collection wins.
      if (Array.isArray(stored)) this.coins = stored;
      this.hydrated = true;
    });
  }

  persist() {
    saveCollection(this.coins);
  }

  addCoin(coin) {
    this.coins = [coin, ...this.coins];
    this.lastAddedId = coin.id;
    this.persist();
  }

  clearLastAdded() {
    this.lastAddedId = null;
  }

  removeCoin(id) {
    this.coins = this.coins.filter((c) => c.id !== id);
    this.persist();
  }

  toggleFavorite(id) {
    this.coins = this.coins.map((c) =>
      c.id === id ? { ...c, favorite: !c.favorite } : c
    );
    this.persist();
  }

  // Cache the AI-generated history blurb on the coin so it's fetched only once.
  setStory(id, story) {
    this.coins = this.coins.map((c) => (c.id === id ? { ...c, story } : c));
    this.persist();
  }

  get favoriteCount() {
    return this.coins.filter((c) => c.favorite).length;
  }

  // Midpoint estimate used for portfolio math.
  estimate(coin) {
    return (coin.valueLow + coin.valueHigh) / 2;
  }

  get totalValue() {
    return this.coins.reduce((sum, c) => sum + this.estimate(c), 0);
  }

  get count() {
    return this.coins.length;
  }

  // Aggregated value grouped by country, sorted high → low.
  get byCountry() {
    const map = new Map();
    for (const c of this.coins) {
      const prev = map.get(c.country) || { country: c.country, flag: c.flag, value: 0, count: 0 };
      prev.value += this.estimate(c);
      prev.count += 1;
      map.set(c.country, prev);
    }
    const total = this.totalValue || 1;
    return Array.from(map.values())
      .map((g) => ({ ...g, pct: g.value / total }))
      .sort((a, b) => b.value - a.value);
  }

  get topValuable() {
    return [...this.coins]
      .sort((a, b) => this.estimate(b) - this.estimate(a))
      .slice(0, 5);
  }

  get mostValuable() {
    return this.topValuable[0];
  }

  getById(id) {
    return this.coins.find((c) => c.id === id);
  }
}
