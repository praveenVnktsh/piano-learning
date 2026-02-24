import { getRandomNote, resetGenerator } from './noteGenerator.js';
import { resolveNotePool, LEVELS, ADVANCEMENT, FEEDBACK_DELAYS } from './config.js';

export class QuizManager {
  constructor({ clefMode, onNewNote, onFeedback, onScoreUpdate, inputMode, progressManager, onLevelUp, onLevelDown, onProgressUpdate,
                timerManager, gamificationManager, onGamificationUpdate }) {
    this.clefMode = clefMode;
    this.inputMode = inputMode || 'click';
    this.onNewNote = onNewNote;
    this.onFeedback = onFeedback;
    this.onScoreUpdate = onScoreUpdate;
    this.onLevelUp = onLevelUp || (() => {});
    this.onLevelDown = onLevelDown || (() => {});
    this.onProgressUpdate = onProgressUpdate || (() => {});
    this.onGamificationUpdate = onGamificationUpdate || (() => {});
    this.progressManager = progressManager;
    this.timerManager = timerManager || null;
    this.gamificationManager = gamificationManager || null;

    this.currentNote = null;
    this.score = 0;
    this.total = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.waiting = false;

    this.currentLevel = 0;
    this.notePool = [];
    this.noteStats = {};
    this.recentAnswers = [];
    this.consecutiveWrong = 0;

    this.timerDuration = 10;
    this.roundActive = false;
    this.onLevelDown = (() => {});
  }

  start(startRound = true) {
    this.score = 0;
    this.total = 0;
    this.streak = 0;
    this.consecutiveWrong = 0;
    this.recentAnswers = [];
    resetGenerator();

    if (this.progressManager) {
      this.currentLevel = this.progressManager.getLevel(this.clefMode);
      this.noteStats = this.progressManager.getNoteStats(this.clefMode);
      this.bestStreak = this.progressManager.getBestStreak(this.clefMode);
    } else {
      this.currentLevel = 0;
      this.noteStats = {};
      this.bestStreak = 0;
    }

    if (this.gamificationManager) {
      this.gamificationManager.resetSession();
    }

    this.notePool = resolveNotePool(this.clefMode, this.currentLevel);
    this.roundActive = startRound;
    this.onScoreUpdate(this.getStats());
    this.onProgressUpdate(this.getProgressInfo());
    if (startRound) {
      this.nextNote();
    }
  }

  nextNote() {
    this.waiting = false;
    const weights = this.computeWeights();
    this.currentNote = getRandomNote(this.notePool, weights);
    if (this.currentNote) {
      this.onNewNote(this.currentNote);
      if (this.timerManager) {
        this.timerManager.start(this.timerDuration);
      }
    }
  }

  checkAnswer(answer) {
    if (!this.roundActive || this.waiting || !this.currentNote) return;

    this.waiting = true;
    this.total++;

    let remainingSeconds = 0;
    if (this.timerManager) {
      remainingSeconds = this.timerManager.getRemaining();
      this.timerManager.stop();
    }

    const isTimeout = answer === '__TIMEOUT__';
    let correct;
    if (isTimeout) {
      correct = false;
    } else if (this.inputMode === 'midi' || this.inputMode === 'mic') {
      correct = answer === this.currentNote.midi;
    } else {
      const noteLetter = this.currentNote.name.charAt(0).toUpperCase();
      correct = answer.toUpperCase() === noteLetter;
    }

    // Track per-note stats
    const noteName = this.currentNote.name;
    if (!this.noteStats[noteName]) {
      this.noteStats[noteName] = { correct: 0, total: 0 };
    }
    this.noteStats[noteName].total++;
    if (correct) {
      this.noteStats[noteName].correct++;
    }

    // Save note stats
    if (this.progressManager) {
      this.progressManager.saveNoteStats(this.clefMode, this.noteStats);
    }

    // Push to rolling window
    this.recentAnswers.push(correct);

    // Get feedback delay based on level
    const levelIdx = Math.min(this.currentLevel, FEEDBACK_DELAYS.correct.length - 1);
    const correctDelay = FEEDBACK_DELAYS.correct[levelIdx];
    const wrongDelay = FEEDBACK_DELAYS.wrong[levelIdx];

    // Process gamification
    let gamResult = null;
    if (this.gamificationManager) {
      gamResult = this.gamificationManager.processAnswer({
        correct,
        remainingSeconds,
        maxSeconds: this.timerManager && this.timerManager.isRunning() ? this.timerDuration : 0,
        musicLevel: this.currentLevel,
      });

      // Check century achievement
      const centuryAch = this.gamificationManager.notifyCentury();
      if (centuryAch.length > 0) {
        gamResult.newAchievements = [...(gamResult.newAchievements || []), ...centuryAch];
      }

      this.onGamificationUpdate(gamResult);
    }

    if (correct) {
      this.score++;
      this.streak++;
      this.consecutiveWrong = 0;
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
        if (this.progressManager) {
          this.progressManager.saveBestStreak(this.clefMode, this.bestStreak);
        }
      }
      this.onFeedback(true, this.currentNote.name, correctDelay);
      this.onScoreUpdate(this.getStats());
      this.onProgressUpdate(this.getProgressInfo());

      if (this.checkAdvancement()) {
        this.advanceLevel();
        return;
      }

      setTimeout(() => this.nextNote(), correctDelay);
    } else {
      this.streak = 0;
      this.consecutiveWrong++;
      const feedbackText = isTimeout ? 'Time\'s up!' : null;
      this.onFeedback(false, this.currentNote.name, wrongDelay, feedbackText);
      this.onScoreUpdate(this.getStats());
      this.onProgressUpdate(this.getProgressInfo());

      if (this.consecutiveWrong >= 3 && this.currentLevel > 0) {
        this.demoteLevel();
        return;
      }

      setTimeout(() => this.nextNote(), wrongDelay);
    }
  }

  computeWeights() {
    const weights = {};
    for (const note of this.notePool) {
      const stats = this.noteStats[note.name];
      if (!stats || stats.total === 0) {
        weights[note.name] = 1.5; // unseen notes
      } else {
        const accuracy = stats.correct / stats.total;
        if (accuracy >= 0.85) {
          weights[note.name] = 1.0; // well-known
        } else {
          // Linear scale: 0% accuracy -> 4.0, 85% accuracy -> 1.0
          weights[note.name] = 4.0 - (accuracy / 0.85) * 3.0;
        }
      }
    }
    return weights;
  }

  checkAdvancement() {
    const levels = LEVELS[this.clefMode];
    if (!levels) return false;
    if (this.currentLevel >= levels.length - 1) return false; // already at max

    const window = this.recentAnswers.slice(-ADVANCEMENT.minNotes);
    if (window.length < ADVANCEMENT.minNotes) return false;

    const correctCount = window.filter(Boolean).length;
    return (correctCount / window.length) >= ADVANCEMENT.minAccuracy;
  }

  advanceLevel() {
    if (this.timerManager) this.timerManager.stop();
    this.currentLevel++;
    this.recentAnswers = [];
    resetGenerator();

    if (this.progressManager) {
      this.progressManager.saveLevel(this.clefMode, this.currentLevel);
    }

    this.notePool = resolveNotePool(this.clefMode, this.currentLevel);

    const levels = LEVELS[this.clefMode];
    const levelInfo = levels[this.currentLevel];
    const isMaxLevel = this.currentLevel >= levels.length - 1;

    // Notify gamification of level advance
    if (this.gamificationManager) {
      const achievements = this.gamificationManager.notifyLevelAdvance(isMaxLevel);
      if (achievements.length > 0) {
        this.onGamificationUpdate({ newAchievements: achievements });
      }
    }

    this.onLevelUp({
      level: this.currentLevel + 1,
      name: levelInfo.name,
      description: levelInfo.description,
      totalLevels: levels.length,
    });

    this.onProgressUpdate(this.getProgressInfo());

    // Resume after a delay for the celebration
    setTimeout(() => this.nextNote(), 2200);
  }

  demoteLevel() {
    if (this.timerManager) this.timerManager.stop();
    this.currentLevel--;
    this.consecutiveWrong = 0;
    this.recentAnswers = [];
    resetGenerator();

    if (this.progressManager) {
      this.progressManager.saveLevel(this.clefMode, this.currentLevel);
    }

    this.notePool = resolveNotePool(this.clefMode, this.currentLevel);

    const levels = LEVELS[this.clefMode];
    const levelInfo = levels[this.currentLevel];

    this.onLevelDown({
      level: this.currentLevel + 1,
      name: levelInfo.name,
      description: levelInfo.description,
    });

    this.onProgressUpdate(this.getProgressInfo());

    setTimeout(() => this.nextNote(), 2200);
  }

  setLevel(idx) {
    const levels = LEVELS[this.clefMode];
    if (!levels || idx < 0 || idx >= levels.length) return;

    const unlocked = this.progressManager ? this.progressManager.getUnlockedLevel(this.clefMode) : 0;
    if (idx > unlocked) return; // can't select locked levels

    this.currentLevel = idx;
    this.recentAnswers = [];
    resetGenerator();

    if (this.progressManager) {
      this.progressManager.saveLevel(this.clefMode, idx);
    }

    this.notePool = resolveNotePool(this.clefMode, this.currentLevel);
    this.score = 0;
    this.total = 0;
    this.streak = 0;
    this.consecutiveWrong = 0;

    this.onScoreUpdate(this.getStats());
    this.onProgressUpdate(this.getProgressInfo());
    this.nextNote();
  }

  setClefMode(mode) {
    this.clefMode = mode;
    resetGenerator();
    this.start(this.roundActive);
  }

  setInputMode(mode) {
    this.inputMode = mode;
  }

  setTimerDuration(seconds) {
    this.timerDuration = seconds;
  }

  isRoundActive() {
    return this.timerManager && this.timerManager.isRunning();
  }

  getStats() {
    return {
      score: this.score,
      total: this.total,
      streak: this.streak,
      bestStreak: this.bestStreak,
      accuracy: this.total > 0 ? Math.round((this.score / this.total) * 100) : 0,
    };
  }

  getProgressInfo() {
    const levels = LEVELS[this.clefMode] || [];
    const level = levels[this.currentLevel] || {};
    const unlocked = this.progressManager ? this.progressManager.getUnlockedLevel(this.clefMode) : 0;
    const isMaxLevel = this.currentLevel >= levels.length - 1;

    const window = this.recentAnswers.slice(-ADVANCEMENT.minNotes);
    const recentCount = window.length;
    const recentCorrect = window.filter(Boolean).length;
    const recentAccuracy = recentCount > 0 ? recentCorrect / recentCount : 0;

    return {
      currentLevel: this.currentLevel,
      totalLevels: levels.length,
      levelName: level.name || '',
      levelDescription: level.description || '',
      unlockedLevel: unlocked,
      isMaxLevel,
      recentCount,
      recentAccuracy,
      minNotes: ADVANCEMENT.minNotes,
      minAccuracy: ADVANCEMENT.minAccuracy,
    };
  }
}
