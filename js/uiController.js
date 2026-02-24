import { LEVELS, GUITAR_TABS, ACHIEVEMENTS } from './config.js';

export class UIController {
  constructor({ onNoteGuess, onClefChange, onInputModeChange, onLevelSelect, onInstrumentModeChange, onMicThresholdChange,
                onStartGame, onTimerDurationChange, onLeaderboardTabChange }) {
    this.onNoteGuess            = onNoteGuess;
    this.onClefChange           = onClefChange;
    this.onInputModeChange      = onInputModeChange;
    this.onLevelSelect          = onLevelSelect          || (() => {});
    this.onInstrumentModeChange = onInstrumentModeChange || (() => {});
    this.onMicThresholdChange   = onMicThresholdChange   || (() => {});
    this.onStartGame            = onStartGame            || (() => {});
    this.onTimerDurationChange  = onTimerDurationChange   || (() => {});
    this.onLeaderboardTabChange = onLeaderboardTabChange  || (() => {});
    this._currentHintNote       = null;
    this._instrumentMode        = 'piano';

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

    this.levelDownOverlay = document.getElementById('level-down-overlay');
    this.levelDownLevel = document.getElementById('level-down-level');
    this.levelDownName = document.getElementById('level-down-name');
    this.levelDownDesc = document.getElementById('level-down-desc');

    // Timer UI elements
    this.timerRingFg = document.getElementById('timer-ring-fg');
    this.timerText = document.getElementById('timer-text');
    this.timerRingContainer = document.getElementById('timer-ring-container');
    this.overallTimerValue = document.getElementById('overall-timer-text');
    this.overallTimerRingFg = document.getElementById('overall-timer-ring-fg');
    this.overallTimerEl = document.getElementById('overall-timer');

    // Gamification HUD elements
    this.hudPoints = document.getElementById('hud-points');
    this.hudCombo = document.getElementById('hud-combo');
    this.hudMultiplier = document.getElementById('hud-multiplier');
    this.hudXpLevel = document.getElementById('hud-xp-level');
    this.xpBarFill = document.getElementById('xp-bar-fill');
    this.pointsPopup = document.getElementById('points-popup');

    // Achievement toast elements
    this.achievementToast = document.getElementById('achievement-toast');
    this.achievementIcon = document.getElementById('achievement-icon');
    this.achievementTitle = document.getElementById('achievement-title');
    this.achievementDesc = document.getElementById('achievement-desc');

    this.scoresContent = document.getElementById('scores-content');
    this.achievementsContent = document.getElementById('achievements-content');
    this.scoresPrevBtn = document.getElementById('scores-prev');
    this.scoresNextBtn = document.getElementById('scores-next');
    this.scoresPageInfo = document.getElementById('scores-page-info');
    this._scoresPage = 0;
    this._scoresPageSize = 10;

    this.setupNoteButtons();
    this.setupClefButtons();
    this.setupKeyboard();
    this.setupInputModeToggle();
    this.setupLevelSelector();
    this.setupInstrumentMode();
    this.setupHintToggle();
    this.setupPianoVisualization();
    this.setupMicControls();
    this.setupTimerControls();
    this.setupLeaderboardTabs();
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
    const midiToggle  = document.getElementById('midi-toggle');
    const micToggle   = document.getElementById('mic-toggle');

    // Note buttons always visible — no hiding

    const setMode = (mode) => {
      this.onInputModeChange(mode);
    };

    if (midiToggle) {
      midiToggle.addEventListener('change', (e) => {
        if (e.target.checked && micToggle) {
          micToggle.checked = false;
          document.getElementById('mic-controls')?.classList.add('hidden');
        }
        setMode(e.target.checked ? 'midi' : 'click');
      });
    }

    if (micToggle) {
      micToggle.addEventListener('change', (e) => {
        if (e.target.checked && midiToggle) midiToggle.checked = false;
        document.getElementById('mic-controls')?.classList.toggle('hidden', !e.target.checked);
        setMode(e.target.checked ? 'mic' : 'click');
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

  setupTimerControls() {
    const startBtn = document.getElementById('start-game-btn');
    const durationInput = document.getElementById('start-game-duration');
    const overallDurationInput = document.getElementById('start-game-overall-duration');
    const timerDurationInput = document.getElementById('timer-duration');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.onStartGame());
    }

    const syncDuration = (val) => {
      const v = Math.min(300, Math.max(10, val));
      if (durationInput) durationInput.value = v;
      if (timerDurationInput) timerDurationInput.value = v;
      this.onTimerDurationChange(v);
    };

    if (durationInput) {
      durationInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 10) val = 10;
        if (val > 300) val = 300;
        syncDuration(val);
      });
    }
    if (timerDurationInput) {
      timerDurationInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 10) val = 10;
        if (val > 300) val = 300;
        syncDuration(val);
      });
    }
    if (overallDurationInput) {
      overallDurationInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 60) val = 60;
        if (val > 3600) val = 3600;
        e.target.value = val;
      });
    }
  }

  setRoundState(active) {
    const overlay = document.getElementById('start-game-overlay');
    if (overlay) {
      overlay.classList.toggle('hidden', active);
    }
    if (this.timerRingContainer) {
      this.timerRingContainer.style.opacity = active ? '1' : '0.4';
    }
    const overallRingContainer = document.getElementById('overall-timer-ring-container');
    if (overallRingContainer) {
      overallRingContainer.style.opacity = active ? '1' : '0.6';
    }
    if (this.overallTimerEl) {
      this.overallTimerEl.style.opacity = active ? '1' : '0.6';
    }
  }

  setupLeaderboardTabs() {
    if (this.scoresPrevBtn) {
      this.scoresPrevBtn.addEventListener('click', () => {
        if (this._scoresPage > 0) {
          this._scoresPage--;
          this.onLeaderboardTabChange();
        }
      });
    }
    if (this.scoresNextBtn) {
      this.scoresNextBtn.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil((this._scoresTotal || 0) / this._scoresPageSize));
        if (this._scoresPage < totalPages - 1) {
          this._scoresPage++;
          this.onLeaderboardTabChange();
        }
      });
    }
  }

  showFeedback(correct, noteName, delay, customText) {
    this.feedbackEl.textContent = customText
      ? `${customText} It was ${noteName}`
      : (correct ? 'Correct!' : `Wrong \u2014 it was ${noteName}`);
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
        this.progressTextEl.textContent = `${info.recentCount}/${info.minNotes} notes \u2014 need 85%+ accuracy to advance`;
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

  showLevelDown(info) {
    this.levelDownLevel.textContent = `Level ${info.level}`;
    this.levelDownName.textContent = info.name;
    this.levelDownDesc.textContent = '3 wrong in a row — let\'s review';
    this.levelDownOverlay.classList.remove('hidden');

    const dismiss = () => {
      this.levelDownOverlay.classList.add('hidden');
      this.levelDownOverlay.removeEventListener('click', dismiss);
    };

    this.levelDownOverlay.addEventListener('click', dismiss);
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
    if (midiSection) midiSection.classList.add('hidden');
  }

  showMicStatus(status) {
    const el = document.getElementById('mic-status');
    if (!el) return;
    el.textContent = status;
    el.className = 'midi-status ' + (status === 'Listening' ? 'connected' : 'disconnected');
  }

  hideMicOption() {
    const micSection = document.getElementById('mic-section');
    if (micSection) micSection.classList.add('hidden');
  }

  updateMicLevel(rms) {
    const fill = document.getElementById('mic-meter-fill');
    if (fill) fill.style.width = `${Math.min(rms / 0.3, 1) * 100}%`;
  }

  setupMicControls() {
    const slider = document.getElementById('mic-threshold');
    if (!slider) return;
    const updateMarker = () => {
      const el = document.getElementById('mic-meter-threshold');
      if (el) el.style.left = `${(slider.value / slider.max) * 100}%`;
      this.onMicThresholdChange(parseFloat(slider.value));
    };
    slider.addEventListener('input', updateMarker);
    updateMarker();  // position marker at initial value
  }

  setupInstrumentMode() {
    document.querySelectorAll('.instrument-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.instrument-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._instrumentMode = btn.dataset.mode;
        this._updateHintToggleLabel();
        const hintEl = document.getElementById('fingering-hint');
        if (hintEl && !hintEl.classList.contains('hidden')) this._renderHint(hintEl);
        this.onInstrumentModeChange(btn.dataset.mode);
      });
    });
  }

  setupHintToggle() {
    const btn  = document.getElementById('hint-toggle');
    const hint = document.getElementById('fingering-hint');
    if (!btn || !hint) return;
    btn.addEventListener('click', () => {
      const nowHidden = hint.classList.toggle('hidden');
      btn.textContent  = this._hintLabel(!nowHidden);
      if (!nowHidden) this._renderHint(hint);
    });
  }

  updateFingeringHint(note) {
    this._currentHintNote = note;
    const hintEl = document.getElementById('fingering-hint');
    if (!hintEl || hintEl.classList.contains('hidden')) return;
    this._renderHint(hintEl);
  }

  setupPianoVisualization() {
    this.pianoVizEl = document.getElementById('piano-viz');
    if (!this.pianoVizEl) return;
    this._renderPianoViz(null);
  }

  updatePianoVisualization(note) {
    if (!this.pianoVizEl) return;
    this._renderPianoViz(note);
  }

  _renderPianoViz(note) {
    if (!this.pianoVizEl) return;
    const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const WHITE_COUNT = 20;
    const BLACK_PER_OCTAVE = [0, 1, 3, 4, 5];

    let target = -1;
    let letter = null;
    let octave = null;
    if (note) {
      letter = note.name.replace(/\d/g, '');
      octave = parseInt(note.name.replace(/\D/g, ''), 10);
      const letterIdx = NAMES.indexOf(letter);
      if (letterIdx >= 0 && octave >= 3 && octave <= 5) {
        if (octave === 3) target = letterIdx;
        else if (octave === 4) target = 7 + letterIdx;
        else target = letterIdx <= 5 ? 14 + letterIdx : -1;
      }
    }

    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#4361ee';
    const pianoWhite = getComputedStyle(document.documentElement)
      .getPropertyValue('--piano-white').trim() || '#fff';
    const pianoBlack = getComputedStyle(document.documentElement)
      .getPropertyValue('--piano-black').trim() || '#222';
    const pianoStroke = getComputedStyle(document.documentElement)
      .getPropertyValue('--piano-stroke').trim() || '#bbb';
    const whiteKeyFill = (i) => (i === target ? primary : pianoWhite);
    const blackKeyFill = (i) => (i === target ? primary : pianoBlack);

    const W = 18;
    const H = 52;
    const BW = 12;
    const BH = 32;
    const totalW = WHITE_COUNT * W;

    const blackKeyPositions = [];
    for (let oct = 0; oct < 2; oct++) {
      for (const wi of BLACK_PER_OCTAVE) {
        blackKeyPositions.push((oct * 7 + wi) * W + W - BW / 2);
      }
    }
    for (const wi of [0, 1, 3, 4]) {
      blackKeyPositions.push((14 + wi) * W + W - BW / 2);
    }

    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${H + 12}" viewBox="0 0 ${totalW} ${H + 12}">`];
    for (let i = 0; i < WHITE_COUNT; i++) {
      const fill = whiteKeyFill(i);
      parts.push(`<rect x="${i * W + 0.5}" y="0.5" width="${W - 1}" height="${H}" rx="2" fill="${fill}" stroke="${pianoStroke}" stroke-width="1"/>`);
    }
    for (const bx of blackKeyPositions) {
      parts.push(`<rect x="${bx}" y="0.5" width="${BW}" height="${BH}" rx="2" fill="${pianoBlack}"/>`);
    }
    if (target >= 0 && letter && octave) {
      const lx = target * W + W / 2;
      parts.push(`<text x="${lx}" y="${H + 10}" text-anchor="middle" font-size="10" fill="${primary}" font-weight="700" font-family="sans-serif">${letter}${octave}</text>`);
    }
    parts.push('</svg>');
    this.pianoVizEl.innerHTML = parts.join('');
  }

  updateOverallTimer(remaining, max) {
    if (!this.overallTimerValue || !this.overallTimerEl) return;
    const m = Math.floor(remaining / 60);
    const s = Math.floor(remaining % 60);
    this.overallTimerValue.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    this.overallTimerEl.classList.toggle('hidden', max <= 0);

    if (this.overallTimerRingFg) {
      const CIRCUMFERENCE = 2 * Math.PI * 20;
      const fraction = max > 0 ? remaining / max : 0;
      const offset = CIRCUMFERENCE * (1 - fraction);
      this.overallTimerRingFg.setAttribute('stroke-dashoffset', offset.toFixed(1));

      this.overallTimerRingFg.classList.remove('warning', 'danger');
      if (remaining <= 30) {
        this.overallTimerRingFg.classList.add('danger');
      } else if (remaining <= max * 0.2) {
        this.overallTimerRingFg.classList.add('warning');
      }
    }
  }

  // Timer display
  updateTimer(remaining, max) {
    if (!this.timerRingFg || !this.timerText) return;

    const CIRCUMFERENCE = 2 * Math.PI * 20; // r=20
    const fraction = max > 0 ? remaining / max : 0;
    const offset = CIRCUMFERENCE * (1 - fraction);
    this.timerRingFg.setAttribute('stroke-dashoffset', offset.toFixed(1));

    this.timerText.textContent = Math.ceil(remaining);

    // Color states
    this.timerRingFg.classList.remove('warning', 'danger');
    if (remaining <= 3) {
      this.timerRingFg.classList.add('danger');
    } else if (remaining <= max * 0.3) {
      this.timerRingFg.classList.add('warning');
    }
  }

  // Gamification HUD
  updateGamificationHUD({ points, combo, multiplier, xpLevel, xpProgress }) {
    if (this.hudPoints) this.hudPoints.textContent = points.toLocaleString();
    if (this.hudCombo) this.hudCombo.textContent = combo;
    if (this.hudMultiplier) {
      this.hudMultiplier.textContent = `${multiplier}x`;
      this.hudMultiplier.className = 'hud-multiplier m' + multiplier + 'x';
    }
    if (this.hudXpLevel) this.hudXpLevel.textContent = xpLevel;
    if (this.xpBarFill) this.xpBarFill.style.width = `${Math.round(xpProgress * 100)}%`;
  }

  showPointsPopup(points) {
    if (!this.pointsPopup) return;

    // Position near the HUD
    const hud = document.getElementById('game-hud');
    if (hud) {
      const rect = hud.getBoundingClientRect();
      this.pointsPopup.style.left = `${rect.left + rect.width / 2 - 30}px`;
      this.pointsPopup.style.top = `${rect.top - 10}px`;
    }

    this.pointsPopup.textContent = `+${points}`;
    this.pointsPopup.classList.remove('active');
    // Force reflow to restart animation
    void this.pointsPopup.offsetWidth;
    this.pointsPopup.classList.add('active');

    setTimeout(() => this.pointsPopup.classList.remove('active'), 1000);
  }

  _achievementQueue = [];
  _achievementShowing = false;

  showAchievementToast(achievement) {
    this._achievementQueue.push(achievement);
    if (!this._achievementShowing) this._showNextAchievement();
  }

  _showNextAchievement() {
    if (this._achievementQueue.length === 0) {
      this._achievementShowing = false;
      return;
    }
    this._achievementShowing = true;
    const achievement = this._achievementQueue.shift();

    if (!this.achievementToast) return;
    this.achievementIcon.textContent = achievement.icon;
    this.achievementTitle.textContent = achievement.name;
    this.achievementDesc.textContent = achievement.desc;
    this.achievementToast.classList.remove('hidden', 'hiding');

    setTimeout(() => {
      this.achievementToast.classList.add('hiding');
      setTimeout(() => {
        this.achievementToast.classList.add('hidden');
        this.achievementToast.classList.remove('hiding');
        this._showNextAchievement();
      }, 400);
    }, 2500);
  }

  renderLeaderboard(sessions, mode, unlockedAchievements) {
    const unlocked = unlockedAchievements || [];

    if (this.scoresContent) {
      const paginationEl = document.getElementById('scores-pagination');
      if (sessions.length === 0) {
        this.scoresContent.innerHTML = '<div class="lb-empty">No sessions yet. Start playing!</div>';
        this._scoresTotal = 0;
        this._scoresPage = 0;
        if (paginationEl) paginationEl.classList.add('hidden');
      } else {
        const sorted = [...sessions].sort((a, b) => b.points - a.points);
        this._scoresTotal = sorted.length;
        const totalPages = Math.max(1, Math.ceil(sorted.length / this._scoresPageSize));
        this._scoresPage = Math.min(this._scoresPage, totalPages - 1);
        const start = this._scoresPage * this._scoresPageSize;
        const pageSessions = sorted.slice(start, start + this._scoresPageSize);
        const rows = pageSessions.map((s, i) => {
          const rank = start + i + 1;
          const date = new Date(s.date);
          const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          const durMin = Math.floor(s.duration / 60);
          const durSec = s.duration % 60;
          const durStr = durMin > 0 ? `${durMin}m ${durSec}s` : `${durSec}s`;
          return `<div class="lb-session-row">
            <span class="lb-rank">#${rank}</span>
            <span class="lb-session-date">${dateStr} ${timeStr}</span>
            <span class="lb-session-points">${s.points.toLocaleString()} pts</span>
            <span class="lb-session-total">${s.total} Q</span>
            <span class="lb-session-duration">${durStr}</span>
          </div>`;
        }).join('');
        this.scoresContent.innerHTML = rows;

        if (this.scoresPrevBtn) this.scoresPrevBtn.disabled = this._scoresPage <= 0;
        if (this.scoresNextBtn) this.scoresNextBtn.disabled = this._scoresPage >= totalPages - 1;
        if (this.scoresPageInfo) this.scoresPageInfo.textContent = `${this._scoresPage + 1} / ${totalPages}`;
        if (paginationEl) paginationEl.classList.toggle('hidden', totalPages <= 1);
      }
    }

    if (this.achievementsContent) {
      const items = ACHIEVEMENTS.map(a => {
        const isUnlocked = unlocked.includes(a.id);
        return `<div class="lb-achievement ${isUnlocked ? '' : 'locked'}">
          <span class="lb-achievement-icon">${a.icon}</span>
          <div>
            <div class="lb-achievement-name">${a.name}</div>
            <div class="lb-achievement-desc">${a.desc}</div>
          </div>
        </div>`;
      }).join('');
      this.achievementsContent.innerHTML = `<div class="lb-achievement-grid">${items}</div>`;
    }
  }

  _renderHint(el) {
    if (!this._currentHintNote) { el.innerHTML = ''; return; }
    el.innerHTML = this._instrumentMode === 'guitar'
      ? this._buildGuitarTabSVG(this._currentHintNote.name)
      : this._buildPianoSVG(this._currentHintNote.name);
  }

  _hintLabel(visible) {
    const icon = this._instrumentMode === 'guitar' ? '\uD83C\uDFB8' : '\uD83C\uDFB9';
    return `${icon} ${visible ? 'Hide' : 'Show'} hint`;
  }

  _updateHintToggleLabel() {
    const btn  = document.getElementById('hint-toggle');
    const hint = document.getElementById('fingering-hint');
    if (!btn) return;
    btn.textContent = this._hintLabel(hint && !hint.classList.contains('hidden'));
  }

  // Mini piano keyboard SVG — one octave, highlights the target key
  _buildPianoSVG(noteName) {
    const NAMES   = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const W = 24, H = 70, BW = 15, BH = 44;
    const letter  = noteName.replace(/\d/g, '');
    const octave  = noteName.replace(/\D/g, '');
    const target  = NAMES.indexOf(letter);
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#4361ee';
    // x-position of each black key (centered in the white-key gap)
    const BLACK_X = [16.5, 40.5, -1, 88.5, 112.5, 136.5, -1];

    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${7 * W}" height="${H + 18}">`];
    for (let i = 0; i < 7; i++) {
      const fill = i === target ? primary : '#fff';
      parts.push(`<rect x="${i * W + 0.5}" y="0.5" width="${W - 1}" height="${H}" rx="3" fill="${fill}" stroke="#bbb" stroke-width="1"/>`);
    }
    for (let i = 0; i < 7; i++) {
      if (BLACK_X[i] >= 0)
        parts.push(`<rect x="${BLACK_X[i]}" y="0.5" width="${BW}" height="${BH}" rx="2" fill="#222"/>`);
    }
    if (target >= 0) {
      const lx = target * W + W / 2;
      parts.push(`<text x="${lx}" y="${H + 13}" text-anchor="middle" font-size="10" fill="${primary}" font-weight="700" font-family="sans-serif">${letter}${octave}</text>`);
    }
    parts.push('</svg>');
    return parts.join('');
  }

  // Guitar tab SVG — 6 strings, frets 1-5, circle on target position
  _buildGuitarTabSVG(noteName) {
    const tab = GUITAR_TABS[noteName];
    if (!tab) return `<span style="font-size:0.8rem;color:var(--text-secondary)">No tab for ${noteName}</span>`;

    const STR_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
    const LW = 14, OW = 22, NW = 4, FW = 28, SH = 18;
    const totalW = LW + OW + NW + 5 * FW;
    const totalH = 5 * SH + 26;
    const nutX   = LW + OW;
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#4361ee';

    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">`];
    for (let s = 0; s < 6; s++) {
      const y  = s * SH + 10;
      const sw = [1, 1, 1.5, 1.5, 2, 2][s];
      parts.push(`<text x="${LW - 2}" y="${y + 4}" text-anchor="end" font-size="11" fill="#999" font-family="monospace">${STR_NAMES[s]}</text>`);
      // Line spans from before the nut (for open-string markers) to end
      parts.push(`<line x1="${LW}" y1="${y}" x2="${totalW}" y2="${y}" stroke="#bbb" stroke-width="${sw}"/>`);
    }
    // Nut bar
    parts.push(`<rect x="${nutX}" y="4" width="${NW}" height="${5 * SH + 12}" fill="#333" rx="1"/>`);
    // Fret dividers
    for (let f = 1; f <= 5; f++) {
      const x = nutX + NW + f * FW;
      parts.push(`<line x1="${x}" y1="4" x2="${x}" y2="${5 * SH + 16}" stroke="#ddd" stroke-width="1"/>`);
    }
    // Note marker
    const sy = (tab.str - 1) * SH + 10;
    if (tab.fret === 0) {
      const ox = nutX - OW / 2;
      parts.push(`<circle cx="${ox}" cy="${sy}" r="6" fill="none" stroke="${primary}" stroke-width="2"/>`);
      parts.push(`<text x="${ox}" y="${totalH - 4}" text-anchor="middle" font-size="9" fill="${primary}" font-family="sans-serif">open</text>`);
    } else {
      const cx = nutX + NW + (tab.fret - 0.5) * FW;
      parts.push(`<circle cx="${cx}" cy="${sy}" r="8" fill="${primary}"/>`);
      parts.push(`<text x="${cx}" y="${sy + 4}" text-anchor="middle" font-size="11" fill="white" font-weight="bold" font-family="sans-serif">${tab.fret}</text>`);
    }
    parts.push('</svg>');
    return parts.join('');
  }
}
