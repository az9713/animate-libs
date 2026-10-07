  // SCORE BODY — lottie showcase (inside buildScore(); see kit/score-head.js).
  // Plan: three soft plucks on the title, a thin pad under the data, a low hit when the sizes appear, a falling sweep while
  // the scrubber runs back (every event ends by 6.4), 0.6s of silence, then the loudest hit at 7.0 and a flat chord.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  [['C4', 0.05], ['E4', 0.3], ['G4', 0.55]].forEach(([n, t], i) => pluck(t, nz(n), 0.12, -0.2 + i * 0.2, 0.5, 3000, 0.2));
  pad(1.0, 4.1, ['C3', 'G3', 'E4'], 0.03, { type: 'triangle', cut: 1200, att: 0.3, rel: 0.3, send: 0 });
  pad(4.0, 6.3, ['C3', 'G3', 'D4', 'E4'], 0.035, { type: 'triangle', cut: 1500, att: 0.3, rel: 0.3, send: 0 });
  // a pluck for each thing that appears: the panel, the card, and each property the panel switches to
  [[cu.panel, 'E5'], [cu.card, 'G5'], [cu.play + 14 / 44 * 2.2, 'C5'], [cu.play + 30 / 44 * 2.2, 'E5'], [4.25, 'G4'], [4.4, 'B4'], [4.75, 'D5']].forEach(([t, n], i) => pluck(t, nz(n), 0.1, -0.3 + (i % 4) * 0.2, 0.3, 3400, 0.2));
  // the scrub: notes fall with the playhead
  [['G5', 5.6], ['E5', 5.72], ['C5', 5.86], ['G4', 6.0], ['E4', 6.12]].forEach(([n, t], i) => pluck(t, nz(n), 0.07, 0.3 - i * 0.15, 0.25, 2600, 0));
  to = 's';
  sub(cu.sizes, 0.22);
  sweep(3.55, 3.95, 0.01, 600, 3000, 0);
  noiseHit(cu.scrub, 0.8, 'bandpass', 3200, 1.1, 0.012, 0, 0, 500);
  // the hit at 7.0 and what follows it: a stab, a sub, a flat chord, nothing busy on top
  sub(cu.hit, 0.55);
  noiseHit(cu.hit, 0.3, 'highpass', 3500, 0.7, 0.09);
  to = 'm';
  ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => pluck(cu.hit + i * 0.012, nz(n), 0.26, -0.3 + i * 0.2, 0.4, 3600, 0.1));
  pad(7.05, 8.05, ['C3', 'G3', 'C4', 'E4', 'G4'], 0.035, { type: 'triangle', cut: 1500, att: 0.05, rel: 0.3, send: 0.1 });
  to = 's';
  chime(cu.hit + 0.05, [nz('C6'), nz('E6'), nz('G6')], 0.03);
