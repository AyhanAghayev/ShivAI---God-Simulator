// ============================================================
// UTILS.JS — Random, Helpers, ID Generation
// ============================================================

const Utils = {
  _seed: Date.now(),

  seedRandom(seed) {
    this._seed = seed;
  },

  // Mulberry32 seeded PRNG
  random() {
    let t = this._seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  },

  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  },

  pick(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(this.random() * arr.length)];
  },

  weightedPick(items, weights) {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = this.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  },

  roll(chance) {
    return this.random() * 100 < chance;
  },

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  uuid() {
    return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
      Math.floor(this.random() * 16).toString(16)
    );
  },

  interpolate(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || key);
  },

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  getEra(year) {
    for (const era of DATA.eras) {
      if (year >= era.range[0] && year <= era.range[1]) return era;
    }
    return DATA.eras[DATA.eras.length - 1];
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }
};
