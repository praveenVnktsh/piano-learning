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
    { id: 'treble-3', name: 'Full Staff', description: 'All staff notes, no ledger lines', noteNames: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'] },
    { id: 'treble-4', name: 'Ledger Lines', description: 'Add middle C below + G5/A5 above', noteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'] },
  ],
  bass: [
    { id: 'bass-1', name: 'Staff Lines', description: 'Good Boys Do Fine Always', noteNames: ['G2', 'B2', 'D3', 'F3', 'A3'] },
    { id: 'bass-2', name: 'Staff Spaces', description: 'All Cows Eat Grass', noteNames: ['A2', 'C3', 'E3', 'G3'] },
    { id: 'bass-3', name: 'Full Staff', description: 'All staff notes, no ledger lines', noteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'] },
    { id: 'bass-4', name: 'Ledger Lines', description: 'Add ledger lines both ways', noteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
  ],
  grand: [
    { id: 'grand-1', name: 'Staff Lines', description: 'Line notes in both clefs', trebleNoteNames: ['E4', 'G4', 'B4', 'D5', 'F5'], bassNoteNames: ['G2', 'B2', 'D3', 'F3', 'A3'] },
    { id: 'grand-2', name: 'All Staff Notes', description: 'Both clefs, no ledger lines', trebleNoteNames: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'], bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'] },
    { id: 'grand-3', name: 'Full Range', description: 'Everything including ledger lines', trebleNoteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
  ],
};

export const ADVANCEMENT = { minNotes: 10, minAccuracy: 0.85 };

export const FEEDBACK_DELAYS = {
  correct: [800, 700, 600, 500],
  wrong: [2000, 1800, 1500, 1200],
};

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
