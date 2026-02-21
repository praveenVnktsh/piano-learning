// VexFlow 5 full build exposes `VexFlow` global with classes directly on it
const { Renderer, Stave, StaveNote, Voice, Formatter, StaveConnector } = VexFlow;

const STAVE_WIDTH = 300;
const STAVE_X = 40;

export function renderNote(container, noteObj, clefMode) {
  container.innerHTML = '';

  const renderer = new Renderer(container, Renderer.Backends.SVG);

  if (clefMode === 'grand') {
    renderGrandStaff(renderer, container, noteObj);
  } else {
    renderSingleStaff(renderer, container, noteObj, clefMode);
  }

  const svg = container.querySelector('svg');
  if (svg) {
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
  }
}

function renderSingleStaff(renderer, container, noteObj, clef) {
  renderer.resize(400, 160);
  const context = renderer.getContext();

  const stave = new Stave(STAVE_X, 20, STAVE_WIDTH);
  stave.addClef(clef);
  stave.setContext(context).draw();

  const note = new StaveNote({
    keys: [noteObj.key],
    duration: 'w',
    clef: clef,
  });

  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.setMode(Voice.Mode.SOFT);
  voice.addTickables([note]);

  new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 80);
  voice.draw(context, stave);
}

function renderGrandStaff(renderer, container, noteObj) {
  renderer.resize(400, 300);
  const context = renderer.getContext();

  const trebleStave = new Stave(STAVE_X, 20, STAVE_WIDTH);
  trebleStave.addClef('treble');
  trebleStave.setContext(context).draw();

  const bassStave = new Stave(STAVE_X, 150, STAVE_WIDTH);
  bassStave.addClef('bass');
  bassStave.setContext(context).draw();

  const brace = new StaveConnector(trebleStave, bassStave);
  brace.setType(StaveConnector.type.BRACE);
  brace.setContext(context).draw();

  const lineLeft = new StaveConnector(trebleStave, bassStave);
  lineLeft.setType(StaveConnector.type.SINGLE_LEFT);
  lineLeft.setContext(context).draw();

  const lineRight = new StaveConnector(trebleStave, bassStave);
  lineRight.setType(StaveConnector.type.SINGLE_RIGHT);
  lineRight.setContext(context).draw();

  // Determine which staff the note belongs to
  const clef = noteObj.clef || (noteObj.midi >= 60 ? 'treble' : 'bass');
  const targetStave = clef === 'treble' ? trebleStave : bassStave;

  // Draw note on target staff
  const note = new StaveNote({
    keys: [noteObj.key],
    duration: 'w',
    clef: clef,
  });

  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.setMode(Voice.Mode.SOFT);
  voice.addTickables([note]);

  new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 80);
  voice.draw(context, targetStave);
}
