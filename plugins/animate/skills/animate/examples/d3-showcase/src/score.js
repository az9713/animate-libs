  // SCORE BODY — d3 showcase (inside buildScore(); see kit/score-head.js)
  // The data is the melody: every bar, line knot, donut slice and radial wedge plays the pitch of its value
  // (D major pentatonic, low value low note). Everything stops at 6.2 s; the half second of silence before
  // the hit at 7.0 s is the turn, then one loud chord on the four shapes.
  const T = TIMELINE, cu = T.cues;
  const SCALE = ['D4', 'E4', 'Fs4', 'A4', 'B4', 'D5', 'E5', 'Fs5', 'A5', 'B5'];
  const VAL = [5, 9, 7, 13, 10, 19, 12, 16];
  const pitch = (i) => nz(SCALE[Math.min(9, Math.floor((VAL[i] / 19) * 9.99))]);
  to = 'm';
  pad(0.0, 6.0, ['D3', 'A3', 'Fs4'], 0.026, { type: 'triangle', cut: 1000, att: 0.5, rel: 0.3, send: 0.12 });
  // 1 s: bars rise, one pluck each as it starts to grow
  for (let i = 0; i < 8; i++) pluck(cu.grow + i * 0.1, pitch(i), 0.17, -0.6 + i * 0.17, 0.3, 3600, 0.18);
  bass(cu.grow, nz('D3'), 0.16); bass(cu.m1, nz('A3'), 0.14);
  // the line: a run left to right, then a softer echo
  for (let i = 0; i < 8; i++) pluck(3.0 + i * E16, pitch(i), 0.1, -0.6 + i * 0.17, 0.22, 3000, 0.12);
  bass(cu.m2, nz('D3'), 0.14);
  // the donut: clockwise, one note per slice
  for (let i = 0; i < 8; i++) pluck(4.5 + i * E16, pitch(i), 0.1, 0.5 - i * 0.14, 0.22, 3000, 0.1);
  bass(cu.m3, nz('A3'), 0.14);
  // the radial area: a fast rising rush, dry, finished by 6.2
  for (let i = 0; i < 8; i++) pluck(5.7 + i * 0.0625, pitch(i), 0.1, 0, 0.18, 3400, 0);
  // the hit and the chord
  pad(cu.hit, 8.05, ['D3', 'A3', 'D4', 'Fs4'], 0.05, { cut: 1500, att: 0.04, rel: 0.4, send: 0.3 });
  chime(cu.hit, [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.3);
  [['D5', 0], ['Fs5', 1], ['A5', 2], ['D6', 3]].forEach(([n, j]) => pluck(cu.hit + j * E16, nz(n), 0.2, -0.3 + j * 0.2, 0.5, 4800, 0.3));
  to = 's';
  // the table strip prints in (blips climb), the sweeps carry each morph
  for (let i = 0; i < 8; i++) blip(0.12 + i * 0.06, 1700 + i * 140, 2500 + i * 140, 0.05, 0.03, -0.6 + i * 0.17);
  sub(0.0, 0.3);
  sweep(cu.m1 - 0.05, cu.m1 + 0.4, 0.012, 500, 2600, 0);
  sweep(cu.m2 - 0.05, cu.m2 + 0.4, 0.012, 600, 3000, 0.2);
  sweep(cu.m3 - 0.05, cu.m3 + 0.4, 0.012, 700, 3400, -0.2);
  sub(cu.hit, 0.85);
  noiseHit(cu.hit, 0.3, 'highpass', 3500, 0.7, 0.14, 0, 0.1);
