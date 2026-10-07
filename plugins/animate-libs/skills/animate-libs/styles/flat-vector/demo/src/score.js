  // SCORE BODY — flat-vector demo (inside buildScore(); see kit/score-head.js). Soft plucks on each pop, chimes on the bulb and the badge.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 4.1, ['C3', 'G3', 'E4'], 0.03, { type: 'triangle', cut: 1200, att: 0.3, rel: 0.3 });
  pad(4.0, 8.05, ['C3', 'G3', 'D4', 'E4'], 0.035, { type: 'triangle', cut: 1500, att: 0.3, rel: 0.3, send: 0.5 });
  [['C4', 0], ['E4', E8], ['G4', BEAT]].forEach(([n, dt], i) => pluck(cu.shape + dt, nz(n), 0.14, -0.2 + i * 0.2, 0.5, 3000, 0.35));
  chime(cu.bulb, [nz('E5'), nz('G5'), nz('C6')], 0.06);
  [0, 1, 2].forEach((i) => pluck(cu.sat + i * 0.15, nz(['G4', 'B4', 'D5'][i]), 0.11, -0.3 + i * 0.3, 0.4, 3400, 0.35));
  [['E5', 0], ['G5', E8], ['B5', BEAT]].forEach(([n, dt], i) => pluck(cu.bars + i * 0.14, nz(n), 0.11, 0.1 * i, 0.4, 3400, 0.4));
  chime(cu.badge, [nz('E5'), nz('G5'), nz('B5'), nz('E6')], 0.07);
  to = 's';
  sweep(3.55, 4.0, 0.01, 600, 3200, 0);                                                        // into the morph
  for (let i = 0; i < 10; i++) blip(3.55 + i * E16 * 0.5, 1500 + i * 60, 1300, 0.025, 0.022);  // ticking round
