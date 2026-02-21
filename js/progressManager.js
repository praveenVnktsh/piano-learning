const STORAGE_KEY = 'sightReadingProgress';
const SCHEMA_VERSION = 1;

function defaultData() {
  return {
    version: SCHEMA_VERSION,
    levels: {
      treble: { current: 0, unlocked: 0 },
      bass: { current: 0, unlocked: 0 },
      grand: { current: 0, unlocked: 0 },
    },
    noteStats: {
      treble: {},
      bass: {},
      grand: {},
    },
    bestStreaks: {
      treble: 0,
      bass: 0,
      grand: 0,
    },
  };
}

export class ProgressManager {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      if (parsed.version !== SCHEMA_VERSION) return defaultData();
      return parsed;
    } catch {
      return defaultData();
    }
  }

  _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  getLevel(clef) {
    return this.data.levels[clef]?.current ?? 0;
  }

  saveLevel(clef, idx) {
    if (!this.data.levels[clef]) return;
    this.data.levels[clef].current = idx;
    if (idx > this.data.levels[clef].unlocked) {
      this.data.levels[clef].unlocked = idx;
    }
    this._save();
  }

  getUnlockedLevel(clef) {
    return this.data.levels[clef]?.unlocked ?? 0;
  }

  getNoteStats(clef) {
    return this.data.noteStats[clef] || {};
  }

  saveNoteStats(clef, stats) {
    this.data.noteStats[clef] = stats;
    this._save();
  }

  getBestStreak(clef) {
    return this.data.bestStreaks[clef] || 0;
  }

  saveBestStreak(clef, n) {
    if (n > (this.data.bestStreaks[clef] || 0)) {
      this.data.bestStreaks[clef] = n;
      this._save();
    }
  }

  resetAll() {
    this.data = defaultData();
    this._save();
  }
}
