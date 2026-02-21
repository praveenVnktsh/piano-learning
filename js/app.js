import { CLEF_MODES } from './config.js';
import { renderNote } from './staffRenderer.js';
import { QuizManager } from './quizManager.js';
import { UIController } from './uiController.js';
import { MIDIHandler } from './midiHandler.js';
import { ProgressManager } from './progressManager.js';

const staffContainer = document.getElementById('staff');

let currentClef = CLEF_MODES.TREBLE;
let inputMode = 'click';
let midiHandler = null;

const progressManager = new ProgressManager();

const quiz = new QuizManager({
  clefMode: currentClef,
  inputMode: inputMode,
  progressManager,
  onNewNote: (note) => {
    renderNote(staffContainer, note, currentClef);
  },
  onFeedback: (correct, noteName, delay) => {
    ui.showFeedback(correct, noteName, delay);
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
    if (mode === 'midi' && !midiHandler) {
      initMidi();
    }
    if (mode === 'midi' && midiHandler) {
      midiHandler.connect();
    }
  },
  onLevelSelect: (idx) => {
    quiz.setLevel(idx);
    const info = quiz.getProgressInfo();
    ui.showLevelDropdown(currentClef, info.currentLevel, info.unlockedLevel);
  },
});

async function initMidi() {
  if (!MIDIHandler.isSupported()) {
    ui.hideMidiOption();
    return;
  }

  midiHandler = new MIDIHandler({
    onNoteOn: (noteInfo) => {
      if (inputMode === 'midi') {
        quiz.checkAnswer(noteInfo.midi);
      }
    },
    onStatusChange: (status) => {
      ui.showMidiStatus(status);
    },
  });

  await midiHandler.connect();
}

// Check MIDI support on load
if (!MIDIHandler.isSupported()) {
  ui.hideMidiOption();
}

// Initialize level dropdown and start the quiz
const initialInfo = quiz.getProgressInfo();
ui.showLevelDropdown(currentClef, initialInfo.currentLevel, initialInfo.unlockedLevel);

quiz.start();
