let lastNote = null;

export function getRandomNote(pool, weights) {
  if (!pool || pool.length === 0) return null;
  if (pool.length === 1) {
    lastNote = pool[0];
    return { ...pool[0] };
  }

  // Build weighted selection
  let totalWeight = 0;
  const noteWeights = pool.map((note, i) => {
    const w = (weights && weights[note.name]) ? weights[note.name] : 1.0;
    totalWeight += w;
    return w;
  });

  let chosen;
  let attempts = 0;
  do {
    let r = Math.random() * totalWeight;
    chosen = pool[pool.length - 1]; // fallback
    for (let i = 0; i < pool.length; i++) {
      r -= noteWeights[i];
      if (r <= 0) {
        chosen = pool[i];
        break;
      }
    }
    attempts++;
  } while (
    lastNote &&
    chosen.key === lastNote.key &&
    chosen.midi === lastNote.midi &&
    attempts < 10
  );

  lastNote = chosen;
  return { ...chosen };
}

export function resetGenerator() {
  lastNote = null;
}
