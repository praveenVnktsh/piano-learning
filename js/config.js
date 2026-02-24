// Note definitions for treble and bass clef
// key: VexFlow format (lowercase "note/octave")
// midi: MIDI note number
// name: display name (letter + octave)

// Treble clef: middle C (1 ledger line below) up to A5 (1 ledger line above)
export const TREBLE_NOTES = [
  { key: 'c/4', midi: 60, name: 'C4' },
  { key: 'd/4', midi: 62, name: 'D4' },
  { key: 'e/4', midi: 64, name: 'E4' },
  { key: 'f/4', midi: 65, name: 'F4' },
  { key: 'g/4', midi: 67, name: 'G4' },
  { key: 'a/4', midi: 69, name: 'A4' },
  { key: 'b/4', midi: 71, name: 'B4' },
  { key: 'c/5', midi: 72, name: 'C5' },
  { key: 'd/5', midi: 74, name: 'D5' },
  { key: 'e/5', midi: 76, name: 'E5' },
  { key: 'f/5', midi: 77, name: 'F5' },
  { key: 'g/5', midi: 79, name: 'G5' },
  { key: 'a/5', midi: 81, name: 'A5' },
];

// Bass clef: G2 up to middle C (1 ledger line above)
export const BASS_NOTES = [
  { key: 'g/2', midi: 43, name: 'G2' },
  { key: 'a/2', midi: 45, name: 'A2' },
  { key: 'b/2', midi: 47, name: 'B2' },
  { key: 'c/3', midi: 48, name: 'C3' },
  { key: 'd/3', midi: 50, name: 'D3' },
  { key: 'e/3', midi: 52, name: 'E3' },
  { key: 'f/3', midi: 53, name: 'F3' },
  { key: 'g/3', midi: 55, name: 'G3' },
  { key: 'a/3', midi: 57, name: 'A3' },
  { key: 'b/3', midi: 59, name: 'B3' },
  { key: 'c/4', midi: 60, name: 'C4' },
];

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CLEF_MODES = {
  TREBLE: 'treble',
  BASS: 'bass',
  GRAND: 'grand',
};

export const LEVELS = {
  treble: [
    { id: 'treble-1', name: 'Staff Lines', description: 'Every Good Boy Does Fine', noteNames: ['E4', 'G4', 'B4', 'D5', 'F5'] },
    { id: 'treble-2', name: 'Staff Spaces', description: 'FACE', noteNames: ['F4', 'A4', 'C5', 'E5'] },
    { id: 'treble-3', name: 'Lower Staff', description: 'Notes below middle B', noteNames: ['E4', 'F4', 'G4', 'A4', 'B4'] },
    { id: 'treble-4', name: 'Upper Staff', description: 'Notes above middle B', noteNames: ['C5', 'D5', 'E5', 'F5'] },
    { id: 'treble-5', name: 'Full Staff', description: 'All staff notes, no ledger lines', noteNames: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'] },
    { id: 'treble-6', name: 'Ledger Below', description: 'Add middle C and D below the staff', noteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'] },
    { id: 'treble-7', name: 'Ledger Above', description: 'Add G5 and A5 above the staff', noteNames: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'] },
    { id: 'treble-8', name: 'Full Range', description: 'All treble notes including ledger lines', noteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'] },
    { id: 'treble-9', name: 'Skip Reading', description: 'Only notes a 3rd apart — line to line, space to space', noteNames: ['E4', 'G4', 'B4', 'D5', 'F5', 'F4', 'A4', 'C5', 'E5'] },
    { id: 'treble-10', name: 'Mastery', description: 'Full range, prove you know them all', noteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'] },
  ],
  bass: [
    { id: 'bass-1', name: 'Staff Lines', description: 'Good Boys Do Fine Always', noteNames: ['G2', 'B2', 'D3', 'F3', 'A3'] },
    { id: 'bass-2', name: 'Staff Spaces', description: 'All Cows Eat Grass', noteNames: ['A2', 'C3', 'E3', 'G3'] },
    { id: 'bass-3', name: 'Lower Staff', description: 'Notes in the lower half', noteNames: ['G2', 'A2', 'B2', 'C3', 'D3'] },
    { id: 'bass-4', name: 'Upper Staff', description: 'Notes in the upper half', noteNames: ['D3', 'E3', 'F3', 'G3', 'A3'] },
    { id: 'bass-5', name: 'Full Staff', description: 'All staff notes, no ledger lines', noteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'] },
    { id: 'bass-6', name: 'Ledger Above', description: 'Add B3 and middle C above the staff', noteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
    { id: 'bass-7', name: 'Skip Reading', description: 'Notes a 3rd apart — line to line, space to space', noteNames: ['G2', 'B2', 'D3', 'F3', 'A3', 'A2', 'C3', 'E3', 'G3'] },
    { id: 'bass-8', name: 'Full Range', description: 'All bass notes including ledger lines', noteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
    { id: 'bass-9', name: 'Mastery', description: 'Full range, prove you know them all', noteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
  ],
  grand: [
    { id: 'grand-1', name: 'Treble Lines', description: 'Line notes in treble clef only', trebleNoteNames: ['E4', 'G4', 'B4', 'D5', 'F5'], bassNoteNames: [] },
    { id: 'grand-2', name: 'Bass Lines', description: 'Line notes in bass clef only', trebleNoteNames: [], bassNoteNames: ['G2', 'B2', 'D3', 'F3', 'A3'] },
    { id: 'grand-3', name: 'Lines Both Clefs', description: 'Line notes across both staves', trebleNoteNames: ['E4', 'G4', 'B4', 'D5', 'F5'], bassNoteNames: ['G2', 'B2', 'D3', 'F3', 'A3'] },
    { id: 'grand-4', name: 'Treble Spaces', description: 'Space notes in treble clef', trebleNoteNames: ['F4', 'A4', 'C5', 'E5'], bassNoteNames: [] },
    { id: 'grand-5', name: 'Bass Spaces', description: 'Space notes in bass clef', trebleNoteNames: [], bassNoteNames: ['A2', 'C3', 'E3', 'G3'] },
    { id: 'grand-6', name: 'Spaces Both Clefs', description: 'Space notes across both staves', trebleNoteNames: ['F4', 'A4', 'C5', 'E5'], bassNoteNames: ['A2', 'C3', 'E3', 'G3'] },
    { id: 'grand-7', name: 'Treble Full Staff', description: 'All treble staff notes', trebleNoteNames: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'], bassNoteNames: [] },
    { id: 'grand-8', name: 'Bass Full Staff', description: 'All bass staff notes', trebleNoteNames: [], bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'] },
    { id: 'grand-9', name: 'Both Staves', description: 'All staff notes, no ledger lines', trebleNoteNames: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'], bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'] },
    { id: 'grand-10', name: 'Middle C Zone', description: 'Notes around middle C — the shared territory', trebleNoteNames: ['C4', 'D4', 'E4'], bassNoteNames: ['A3', 'B3', 'C4'] },
    { id: 'grand-11', name: 'Ledger Lines', description: 'Ledger line notes in both clefs', trebleNoteNames: ['C4', 'D4', 'G5', 'A5'], bassNoteNames: ['B3', 'C4'] },
    { id: 'grand-12', name: 'Full Range', description: 'Everything including ledger lines', trebleNoteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
    { id: 'grand-13', name: 'Skip Reading', description: 'Notes a 3rd apart across both clefs', trebleNoteNames: ['E4', 'G4', 'B4', 'D5', 'F5', 'F4', 'A4', 'C5', 'E5'], bassNoteNames: ['G2', 'B2', 'D3', 'F3', 'A3', 'A2', 'C3', 'E3', 'G3'] },
    { id: 'grand-14', name: 'Mastery', description: 'Full range — the ultimate test', trebleNoteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
  ],
};

export const ADVANCEMENT = { minNotes: 10, minAccuracy: 0.85 };

// Guitar tab positions for treble clef notes.
// Key = written note name (as shown on staff).
// Guitar sounds one octave below written, so each position gives the sounding pitch.
// str: 1 = high e, 6 = low E.  fret: 0 = open string.
export const GUITAR_TABS = {
  C4: { str: 5, fret: 3 },  // A-string 3rd fret  → C3
  D4: { str: 4, fret: 0 },  // D-string open      → D3
  E4: { str: 4, fret: 2 },  // D-string 2nd fret  → E3
  F4: { str: 4, fret: 3 },  // D-string 3rd fret  → F3
  G4: { str: 3, fret: 0 },  // G-string open      → G3
  A4: { str: 3, fret: 2 },  // G-string 2nd fret  → A3
  B4: { str: 2, fret: 0 },  // B-string open      → B3
  C5: { str: 2, fret: 1 },  // B-string 1st fret  → C4
  D5: { str: 2, fret: 3 },  // B-string 3rd fret  → D4
  E5: { str: 1, fret: 0 },  // e-string open      → E4
  F5: { str: 1, fret: 1 },  // e-string 1st fret  → F4
  G5: { str: 1, fret: 3 },  // e-string 3rd fret  → G4
  A5: { str: 1, fret: 5 },  // e-string 5th fret  → A4
};

export const FEEDBACK_DELAYS = {
  correct: [800, 800, 700, 700, 600, 600, 500, 500, 400, 400, 350, 350, 300, 300],
  wrong:   [2000, 2000, 1800, 1800, 1500, 1500, 1200, 1200, 1000, 1000, 900, 900, 800, 800],
};

export const TIMER_DEFAULTS = {
  enabled: true,
  duration: 10,
  min: 2,
  max: 60,
};

export const GAMIFICATION = {
  basePoints: 100,
  comboThresholds: [
    { streak: 3, multiplier: 2 },
    { streak: 6, multiplier: 3 },
    { streak: 10, multiplier: 4 },
  ],
  xpBase: 500, // XP for level N = xpBase * N * (N+1) / 2
};

export const ACHIEVEMENTS = [
  { id: 'first_correct', name: 'First Note', desc: 'Get your first correct answer', icon: '\u2B50' },
  { id: 'streak_5', name: 'On a Roll', desc: 'Reach a streak of 5', icon: '\uD83D\uDD25' },
  { id: 'streak_10', name: 'Unstoppable', desc: 'Reach a streak of 10', icon: '\u26A1' },
  { id: 'streak_25', name: 'Legendary', desc: 'Reach a streak of 25', icon: '\uD83D\uDC51' },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Answer correctly within 2 seconds', icon: '\uD83D\uDE80' },
  { id: 'century', name: 'Century', desc: 'Answer 100 questions in a session', icon: '\uD83D\uDCAF' },
  { id: 'combo_4x', name: 'Max Combo', desc: 'Reach 4x multiplier', icon: '\uD83C\uDF1F' },
  { id: 'scholar', name: 'Scholar', desc: 'Advance to a new level', icon: '\uD83C\uDF93' },
  { id: 'full_range', name: 'Full Range', desc: 'Reach the highest level in any clef', icon: '\uD83C\uDFBC' },
  { id: 'points_10k', name: '10K Club', desc: 'Earn 10,000 points in a session', icon: '\uD83D\uDCB0' },
  { id: 'xp_level_5', name: 'Rising Star', desc: 'Reach XP level 5', icon: '\u2B50' },
  { id: 'xp_level_10', name: 'Maestro', desc: 'Reach XP level 10', icon: '\uD83C\uDFB5' },
];

// Build lookup maps for fast name -> note object resolution
const trebleByName = {};
TREBLE_NOTES.forEach(n => { trebleByName[n.name] = n; });
const bassByName = {};
BASS_NOTES.forEach(n => { bassByName[n.name] = n; });

export function resolveNotePool(clefMode, levelIndex) {
  const levelDefs = LEVELS[clefMode];
  if (!levelDefs || levelIndex < 0 || levelIndex >= levelDefs.length) return [];

  const level = levelDefs[levelIndex];

  if (clefMode === CLEF_MODES.GRAND) {
    const pool = [];
    (level.trebleNoteNames || []).forEach(name => {
      const note = trebleByName[name];
      if (note) pool.push({ ...note, clef: 'treble' });
    });
    (level.bassNoteNames || []).forEach(name => {
      const note = bassByName[name];
      if (note) pool.push({ ...note, clef: 'bass' });
    });
    return pool;
  }

  const lookup = clefMode === CLEF_MODES.BASS ? bassByName : trebleByName;
  return (level.noteNames || []).map(name => lookup[name]).filter(Boolean).map(n => ({ ...n }));
}
