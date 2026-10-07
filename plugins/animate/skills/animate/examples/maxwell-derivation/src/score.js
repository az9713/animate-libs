  // SCORE BODY — soft plucks on every write, a morph shimmer, silence 13.9-15.9 before the wave equations land.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 13.8, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 1000, att: 0.4, rel: 0.4 });
  pad(16.0, 20.0, ['D3', 'A3', 'E4', 'Fs4'], 0.034, { type: 'triangle', cut: 1400, att: 0.2, rel: 0.5, send: 0.5 });
  const wr = (t, ns, v = 0.08) => ns.forEach((n, i) => pluck(t + i * E8, nz(n), v, -0.3 + i * 0.3, 0.5, 2800, 0.35));
  wr(cu.divB, ['D4', 'Fs4']); wr(cu.E, ['A4', 'B4', 'D5']); wr(cu.gauss, ['D4', 'A4']); wr(cu.amp, ['E4', 'B4']); wr(cu.gauge, ['A4', 'D5', 'Fs5'], 0.09);
  [cu.toB, cu.toGaussP, cu.toAmpB].forEach((t) => pluck(t, nz('E5'), 0.1, 0.1, 0.4, 3200, 0.4));
  chime(cu.waves, [nz('D5'), nz('A5'), nz('Fs6')], 0.17);
  chime(cu.box, [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.05);
  
