import { GAMIFICATION, ACHIEVEMENTS } from './config.js';

export class GamificationManager {
  constructor() {
    this.sessionPoints = 0;
    this.sessionTotal = 0;
    this.combo = 0;
    this.multiplier = 1;
    this.totalXP = 0;
    this.playerLevel = 0;
    this.unlockedAchievements = [];
    this.sessionStartTime = Date.now();
    this.hasAdvancedLevel = false;
    this.reachedMaxLevel = false;
  }

  processAnswer({ correct, remainingSeconds, maxSeconds, musicLevel }) {
    this.sessionTotal++;
    const newAchievements = [];

    if (correct) {
      this.combo++;
      this._updateMultiplier();

      const timeBonus = maxSeconds > 0
        ? Math.floor((remainingSeconds / maxSeconds) * 100)
        : 50; // default bonus when timer disabled
      const levelBonus = (musicLevel || 0) * 25;
      const raw = GAMIFICATION.basePoints + timeBonus + levelBonus;
      const points = Math.round(raw * this.multiplier);

      this.sessionPoints += points;
      this.totalXP += points;
      this.playerLevel = this._computeXPLevel(this.totalXP);

      // Check achievements
      if (this._checkAndUnlock('first_correct')) newAchievements.push(this._getAchievement('first_correct'));
      if (this.combo >= 5 && this._checkAndUnlock('streak_5')) newAchievements.push(this._getAchievement('streak_5'));
      if (this.combo >= 10 && this._checkAndUnlock('streak_10')) newAchievements.push(this._getAchievement('streak_10'));
      if (this.combo >= 25 && this._checkAndUnlock('streak_25')) newAchievements.push(this._getAchievement('streak_25'));
      if (remainingSeconds > 0 && maxSeconds > 0 && (maxSeconds - remainingSeconds) < 2 && this._checkAndUnlock('speed_demon')) {
        newAchievements.push(this._getAchievement('speed_demon'));
      }
      if (this.multiplier >= 4 && this._checkAndUnlock('combo_4x')) newAchievements.push(this._getAchievement('combo_4x'));
      if (this.sessionPoints >= 10000 && this._checkAndUnlock('points_10k')) newAchievements.push(this._getAchievement('points_10k'));
      if (this.playerLevel >= 5 && this._checkAndUnlock('xp_level_5')) newAchievements.push(this._getAchievement('xp_level_5'));
      if (this.playerLevel >= 10 && this._checkAndUnlock('xp_level_10')) newAchievements.push(this._getAchievement('xp_level_10'));

      return { correct: true, points, combo: this.combo, multiplier: this.multiplier, newAchievements };
    } else {
      this.combo = 0;
      this.multiplier = 1;
      return { correct: false, points: 0, combo: 0, multiplier: 1, newAchievements };
    }
  }

  notifyLevelAdvance(isMaxLevel) {
    const newAchievements = [];
    this.hasAdvancedLevel = true;
    if (this._checkAndUnlock('scholar')) newAchievements.push(this._getAchievement('scholar'));
    if (isMaxLevel) {
      this.reachedMaxLevel = true;
      if (this._checkAndUnlock('full_range')) newAchievements.push(this._getAchievement('full_range'));
    }
    return newAchievements;
  }

  notifyCentury() {
    if (this.sessionTotal >= 100 && this._checkAndUnlock('century')) {
      return [this._getAchievement('century')];
    }
    return [];
  }

  _updateMultiplier() {
    const thresholds = GAMIFICATION.comboThresholds;
    this.multiplier = 1;
    for (const t of thresholds) {
      if (this.combo >= t.streak) this.multiplier = t.multiplier;
    }
  }

  _computeXPLevel(xp) {
    let level = 0;
    while (true) {
      const needed = GAMIFICATION.xpBase * (level + 1) * (level + 2) / 2;
      if (xp < needed) break;
      level++;
    }
    return level;
  }

  getXPForLevel(level) {
    if (level <= 0) return 0;
    return GAMIFICATION.xpBase * level * (level + 1) / 2;
  }

  getXPProgress() {
    const currentLevelXP = this.getXPForLevel(this.playerLevel);
    const nextLevelXP = this.getXPForLevel(this.playerLevel + 1);
    const progressXP = this.totalXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    return { current: progressXP, needed: neededXP, fraction: neededXP > 0 ? progressXP / neededXP : 0 };
  }

  _checkAndUnlock(id) {
    if (this.unlockedAchievements.includes(id)) return false;
    this.unlockedAchievements.push(id);
    return true;
  }

  _getAchievement(id) {
    return ACHIEVEMENTS.find(a => a.id === id);
  }

  resetSession() {
    this.sessionPoints = 0;
    this.sessionTotal = 0;
    this.combo = 0;
    this.multiplier = 1;
    this.sessionStartTime = Date.now();
    this.hasAdvancedLevel = false;
    this.reachedMaxLevel = false;
  }

  getSessionRecord() {
    return {
      date: new Date().toISOString(),
      points: this.sessionPoints,
      total: this.sessionTotal,
      duration: Math.round((Date.now() - this.sessionStartTime) / 1000),
    };
  }

  getState() {
    return {
      totalXP: this.totalXP,
      playerLevel: this.playerLevel,
      unlockedAchievements: [...this.unlockedAchievements],
    };
  }

  loadState(state) {
    if (!state) return;
    this.totalXP = state.totalXP || 0;
    this.playerLevel = state.playerLevel || 0;
    this.unlockedAchievements = state.unlockedAchievements || [];
  }
}
