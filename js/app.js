import { CLEF_MODES } from './config.js';
import { renderNote } from './staffRenderer.js';
import { QuizManager } from './quizManager.js';
import { UIController } from './uiController.js';
import { MIDIHandler } from './midiHandler.js';
import { MicHandler } from './micHandler.js';
import { ProgressManager } from './progressManager.js';
import { TimerManager } from './timerManager.js';
import { GamificationManager } from './gamificationManager.js';

const staffContainer = document.getElementById('staff');

let currentClef    = CLEF_MODES.TREBLE;
let inputMode      = 'click';
let instrumentMode = 'piano';
let lastNote       = null;
let midiHandler    = null;
let micHandler     = null;
let currentLbTab   = 'history';

const progressManager = new ProgressManager();
const gamificationManager = new GamificationManager();

// Load persisted gamification state
gamificationManager.loadState(progressManager.getGamificationState());

const timerManager = new TimerManager({
  onTick: (remaining, max) => {
    ui.updateTimer(remaining, max);
  },
  onExpired: () => {
    quiz.checkAnswer('__TIMEOUT__');
  },
});

const quiz = new QuizManager({
  clefMode: currentClef,
  inputMode: inputMode,
  progressManager,
  timerManager,
  gamificationManager,
  onNewNote: (note) => {
    lastNote = note;
    renderNote(staffContainer, note, currentClef);
    ui.updateFingeringHint(note);
  },
  onFeedback: (correct, noteName, delay, customText) => {
    ui.showFeedback(correct, noteName, delay, customText);
  },
  onScoreUpdate: (stats) => {
    ui.updateScore(stats);
  },
  onLevelUp: (info) => {
    ui.showLevelUp(info);
    ui.updateLevelDisplay(quiz.getProgressInfo());
    ui.showLevelDropdown(currentClef, quiz.getProgressInfo().currentLevel, quiz.getProgressInfo().unlockedLevel);
  },
  onProgressUpdate: (info) => {
    ui.updateLevelDisplay(info);
  },
  onGamificationUpdate: (result) => {
    // Update HUD
    const xpProgress = gamificationManager.getXPProgress();
    ui.updateGamificationHUD({
      points: gamificationManager.sessionPoints,
      combo: gamificationManager.combo,
      multiplier: gamificationManager.multiplier,
      xpLevel: gamificationManager.playerLevel,
      xpProgress: xpProgress.fraction,
    });

    // Show points popup on correct
    if (result.correct && result.points > 0) {
      ui.showPointsPopup(result.points);
    }

    // Show achievement toasts
    if (result.newAchievements) {
      for (const ach of result.newAchievements) {
        ui.showAchievementToast(ach);
        progressManager.addAchievement(ach.id);
      }
    }

    // Persist gamification state
    progressManager.saveGamificationState(gamificationManager.getState());
  },
});

const ui = new UIController({
  onNoteGuess: (letter) => {
    if (inputMode === 'click') {
      quiz.checkAnswer(letter);
    }
  },
  onClefChange: (clef) => {
    currentClef = clef;
    quiz.setClefMode(clef);
    const info = quiz.getProgressInfo();
    ui.showLevelDropdown(currentClef, info.currentLevel, info.unlockedLevel);
  },
  onInputModeChange: (mode) => {
    inputMode = mode;
    quiz.setInputMode(mode);
    if (mode !== 'midi') midiHandler?.disconnect();
    if (mode !== 'mic')  micHandler?.disconnect();
    if (mode === 'midi') initMidi();
    if (mode === 'mic')  initMic();
  },
  onLevelSelect: (idx) => {
    quiz.setLevel(idx);
    const info = quiz.getProgressInfo();
    ui.showLevelDropdown(currentClef, info.currentLevel, info.unlockedLevel);
  },
  onInstrumentModeChange: (mode) => {
    instrumentMode = mode;
    if (micHandler) micHandler.transpose = mode === 'guitar' ? 12 : 0;
  },
  onMicThresholdChange: (val) => { if (micHandler) micHandler.minRms = val; },
  onTimerToggle: (enabled) => {
    quiz.setTimerEnabled(enabled);
    if (!enabled) {
      ui.updateTimer(0, 0);
    }
  },
  onTimerDurationChange: (seconds) => {
    quiz.setTimerDuration(seconds);
  },
  onLeaderboardTabChange: (tab) => {
    currentLbTab = tab;
    renderLeaderboard();
  },
});

function renderLeaderboard() {
  const sessions = progressManager.getLeaderboard();
  const achievements = gamificationManager.unlockedAchievements;
  ui.renderLeaderboard(sessions, currentLbTab, achievements);
}

async function initMidi() {
  if (!MIDIHandler.isSupported()) { ui.hideMidiOption(); return; }
  if (!midiHandler) midiHandler = new MIDIHandler({
    onNoteOn: (noteInfo) => { if (inputMode === 'midi') quiz.checkAnswer(noteInfo.midi); },
    onStatusChange: (status) => ui.showMidiStatus(status),
  });
  await midiHandler.connect();
}

async function initMic() {
  if (!MicHandler.isSupported()) { ui.hideMicOption(); return; }
  if (!micHandler) micHandler = new MicHandler({
    onNoteOn:      (noteInfo) => { if (inputMode === 'mic') quiz.checkAnswer(noteInfo.midi); },
    onStatusChange: (status)  => ui.showMicStatus(status),
    onLevelUpdate:  (rms)     => ui.updateMicLevel(rms),
  });
  micHandler.transpose = instrumentMode === 'guitar' ? 12 : 0;
  await micHandler.connect();
}

// Save session on page unload
function saveCurrentSession() {
  const record = gamificationManager.getSessionRecord();
  if (record.total > 0) {
    progressManager.saveSession(record);
    progressManager.saveGamificationState(gamificationManager.getState());
  }
}

window.addEventListener('beforeunload', saveCurrentSession);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    saveCurrentSession();
  }
});

// Check MIDI support on load
if (!MIDIHandler.isSupported()) {
  ui.hideMidiOption();
}

// Check microphone support on load
if (!MicHandler.isSupported()) {
  ui.hideMicOption();
}

// Initialize level dropdown, leaderboard, and start the quiz
const initialInfo = quiz.getProgressInfo();
ui.showLevelDropdown(currentClef, initialInfo.currentLevel, initialInfo.unlockedLevel);

// Initialize gamification HUD
const xpProgress = gamificationManager.getXPProgress();
ui.updateGamificationHUD({
  points: 0,
  combo: 0,
  multiplier: 1,
  xpLevel: gamificationManager.playerLevel,
  xpProgress: xpProgress.fraction,
});

renderLeaderboard();

quiz.start();
