  // SCORE BODY — terminal demo (inside buildScore(); see kit/score-head.js). A low drone, a key click on every other typed character, a blip on done.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 4.1, ['A2', 'E3'], 0.03, { type: 'triangle', cut: 800, att: 0.3, rel: 0.3 });
  pad(4.0, 8.05, ['A2', 'E3', 'Cs4'], 0.03, { type: 'triangle', cut: 900, att: 0.3, rel: 0.3, send: 0.4 });
  chime(cu.found, [nz('E5'), nz('A5')], 0.05);
  chime(cu.done, [nz('A5'), nz('Cs6'), nz('E6')], 0.06);
  to = 's';
  const typed = (t0, len, cps = 24) => { for (let i = 0; i < len; i += 2) blip(t0 + i / cps, 2600 + (i % 3) * 140, 1800, 0.012, 0.02, (i % 4) * 0.1 - 0.15); };
  typed(cu.cmd, 18); typed(cu.load, 20); typed(cu.cmd2, 14); typed(cu.cmd2 + 0.7, 11); typed(cu.done, 22);
  for (let i = 0; i < 14; i++) blip(cu.bar + i * 0.07, 1400 + i * 50, 1500 + i * 50, 0.02, 0.018);   // the bar filling
  sweep(3.4, 4.0, 0.01, 500, 2400, 0);                                                             // into the morph
