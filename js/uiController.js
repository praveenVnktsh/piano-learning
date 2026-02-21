import { LEVELS } from './config.js';

export class UIController {
  constructor({ onNoteGuess, onClefChange, onInputModeChange, onLevelSelect }) {
    this.onNoteGuess = onNoteGuess;
    this.onClefChange = onClefChange;
    this.onInputModeChange = onInputModeChange;
    this.onLevelSelect = onLevelSelect || (() => {});

    this.feedbackEl = document.getElementById('feedback');
    this.scoreEl = document.getElementById('score');
    this.accuracyEl = document.getElementById('accuracy');
    this.streakEl = document.getElementById('streak');
    this.bestStreakEl = document.getElementById('best-streak');

    // Level UI elements
    this.levelBadgeEl = document.getElementById('level-badge');
    this.levelNameEl = document.getElementById('level-name');
    this.levelDescEl = document.getElementById('level-description');
    this.progressBarEl = document.getElementById('progress-bar');
    this.progressTextEl = document.getElementById('progress-text');
    this.levelDropdownEl = document.getElementById('level-dropdown');
    this.levelSelectorBtn = document.getElementById('level-selector-btn');
    this.levelUpOverlay = document.getElementById('level-up-overlay');
    this.levelUpLevel = document.getElementById('level-up-level');
    this.levelUpName = document.getElementById('level-up-name');
    this.levelUpDesc = document.getElementById('level-up-desc');

    this.setupNoteButtons();
    this.setupClefButtons();
    this.setupKeyboard();
    this.setupInputModeToggle();
    this.setupLevelSelector();
  }

  setupNoteButtons() {
    const buttons = document.querySelectorAll('.note-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        this.onNoteGuess(btn.dataset.note);
      });
    });
  }

  setupClefButtons() {
    const buttons = document.querySelectorAll('.clef-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.onClefChange(btn.dataset.clef);
      });
    });
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      if ('ABCDEFG'.includes(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.onNoteGuess(key);

        const btn = document.querySelector(`.note-btn[data-note="${key}"]`);
        if (btn) {
          btn.classList.add('pressed');
          setTimeout(() => btn.classList.remove('pressed'), 150);
        }
      }
    });
  }

  setupInputModeToggle() {
    const toggle = document.getElementById('midi-toggle');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        const mode = e.target.checked ? 'midi' : 'click';
        this.onInputModeChange(mode);
        document.getElementById('note-buttons').classList.toggle('hidden', mode === 'midi');
      });
    }
  }

  setupLevelSelector() {
    if (this.levelSelectorBtn) {
      this.levelSelectorBtn.addEventListener('click', () => {
        this.levelDropdownEl.classList.toggle('hidden');
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.levelDropdownEl.classList.contains('hidden') &&
          !this.levelDropdownEl.contains(e.target) &&
          e.target !== this.levelSelectorBtn &&
          !this.levelSelectorBtn.contains(e.target)) {
        this.levelDropdownEl.classList.add('hidden');
      }
    });
  }

  showFeedback(correct, noteName, delay) {
    this.feedbackEl.textContent = correct ? 'Correct!' : `Wrong — it was ${noteName}`;
    this.feedbackEl.className = 'feedback ' + (correct ? 'correct' : 'wrong');

    const buttons = document.querySelectorAll('.note-btn');
    buttons.forEach(b => b.disabled = true);

    const feedbackDelay = delay || (correct ? 800 : 2000);
    setTimeout(() => {
      this.feedbackEl.className = 'feedback';
      this.feedbackEl.textContent = '\u00A0';
      buttons.forEach(b => b.disabled = false);
    }, feedbackDelay);
  }

  updateScore(stats) {
    this.scoreEl.textContent = `${stats.score} / ${stats.total}`;
    this.accuracyEl.textContent = `${stats.accuracy}%`;
    this.streakEl.textContent = stats.streak;
    this.bestStreakEl.textContent = stats.bestStreak;
  }

  updateLevelDisplay(info) {
    if (!info) return;

    this.levelBadgeEl.textContent = `Level ${info.currentLevel + 1}`;
    this.levelNameEl.textContent = info.levelName;
    this.levelDescEl.textContent = info.levelDescription;

    if (info.isMaxLevel) {
      this.progressBarEl.style.width = '100%';
      this.progressBarEl.classList.add('met');
      this.progressTextEl.textContent = 'Max level reached!';
    } else {
      const progressPct = Math.min((info.recentCount / info.minNotes) * 100, 100);
      const accuracyMet = info.recentCount >= info.minNotes && info.recentAccuracy >= info.minAccuracy;
      this.progressBarEl.style.width = `${progressPct}%`;
      this.progressBarEl.classList.toggle('met', accuracyMet);

      if (info.recentCount < info.minNotes) {
        this.progressTextEl.textContent = `${info.recentCount}/${info.minNotes} notes — need 85%+ accuracy to advance`;
      } else {
        const pct = Math.round(info.recentAccuracy * 100);
        this.progressTextEl.textContent = `Last ${info.minNotes}: ${pct}% accuracy (need 85%)`;
      }
    }
  }

  showLevelDropdown(clefMode, currentIdx, unlockedIdx) {
    const levels = LEVELS[clefMode];
    if (!levels) return;

    this.levelDropdownEl.innerHTML = '';

    levels.forEach((level, i) => {
      const isLocked = i > unlockedIdx;
      const isCurrent = i === currentIdx;

      const el = document.createElement('div');
      el.className = 'level-option' + (isCurrent ? ' current' : '') + (isLocked ? ' locked' : '');

      el.innerHTML = `
        <span class="level-option-num">${i + 1}</span>
        <span class="level-option-name">${level.name}</span>
        ${isLocked ? '<span class="level-option-lock">&#128274;</span>' : ''}
      `;

      if (!isLocked) {
        el.addEventListener('click', () => {
          this.onLevelSelect(i);
          this.levelDropdownEl.classList.add('hidden');
        });
      }

      this.levelDropdownEl.appendChild(el);
    });
  }

  showLevelUp(info) {
    this.levelUpLevel.textContent = `Level ${info.level}`;
    this.levelUpName.textContent = info.name;
    this.levelUpDesc.textContent = info.description;
    this.levelUpOverlay.classList.remove('hidden');

    const dismiss = () => {
      this.levelUpOverlay.classList.add('hidden');
      this.levelUpOverlay.removeEventListener('click', dismiss);
    };

    this.levelUpOverlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 2000);
  }

  showMidiStatus(status) {
    const el = document.getElementById('midi-status');
    if (!el) return;
    el.textContent = status;
    el.className = 'midi-status ' + (status === 'Connected' ? 'connected' : 'disconnected');
  }

  hideMidiOption() {
    const midiSection = document.getElementById('midi-section');
    if (midiSection) {
      midiSection.classList.add('hidden');
    }
  }
}
