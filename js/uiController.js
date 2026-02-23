import { LEVELS, GUITAR_TABS } from './config.js';

export class UIController {
  constructor({ onNoteGuess, onClefChange, onInputModeChange, onLevelSelect, onInstrumentModeChange, onMicThresholdChange }) {
    this.onNoteGuess            = onNoteGuess;
    this.onClefChange           = onClefChange;
    this.onInputModeChange      = onInputModeChange;
    this.onLevelSelect          = onLevelSelect          || (() => {});
    this.onInstrumentModeChange = onInstrumentModeChange || (() => {});
    this.onMicThresholdChange   = onMicThresholdChange   || (() => {});
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

    this.setupNoteButtons();
    this.setupClefButtons();
    this.setupKeyboard();
    this.setupInputModeToggle();
    this.setupLevelSelector();
    this.setupInstrumentMode();
    this.setupHintToggle();
    this.setupMicControls();
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
    const noteButtons = document.getElementById('note-buttons');

    const setMode = (mode) => {
      this.onInputModeChange(mode);
      noteButtons?.classList.toggle('hidden', mode !== 'click');
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
