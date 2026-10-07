  // SCORE BODY — GSAP showcase (inside buildScore(); see kit/score-head.js). A pad and a bass on the beat under the five words,
  // a pluck per word as it enters, blips for the stagger wave, a riser that stops at 5.75; silence from about 5.85 to 6.5; then the
  // loudest hit (a sub, a noise burst, a chime chord, a pluck per word) on 6.5, when all five eases enter at once. D major, 120 BPM.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 5.6, ['D3', 'A3', 'Fs4'], 0.025, { type: 'triangle', cut: 1100, att: 0.3, rel: 0.25, send: 0.2 });
  for (let i = 0; i < 11; i++) bass(i * BEAT, nz(i % 2 ? 'A2' : 'D2'), 0.1);
  pad(6.5, 8.05, ['D3', 'A3', 'E4', 'Fs4', 'D5'], 0.05, { type: 'triangle', cut: 1800, att: 0.15, rel: 0.4, send: 0.5 });
  bass(6.5, nz('D2'), 0.25); bass(7.0, nz('A2'), 0.18); bass(7.5, nz('D2'), 0.18);
  to = 's';
  sub(cu.title, 0.2);
  [0, 1, 2, 3].forEach((i) => pluck(cu.title + 0.1 + i * 0.07, nz(['D4', 'Fs4', 'A4', 'D5'][i]), 0.1, -0.3 + i * 0.2, 0.3, 2800, 0.2));
  chime(cu.period, [nz('D5'), nz('A5')], 0.04);
  ['D4', 'Fs4', 'A4', 'B4', 'D5'].forEach((n, i) => { const t = cu['r' + i]; sub(t, 0.07); pluck(t + 0.05, nz(n), 0.12, -0.4 + i * 0.2, 0.4, 3000, 0.25); });
  for (let i = 0; i < 6; i++) blip(cu.wave + i * 0.12, 900 + i * 90, 1100 + i * 90, 0.05, 0.03, -0.4 + i * 0.16);
  for (let i = 0; i < 5; i++) blip(cu.exit + i * 0.1, 1500 - i * 120, 700 - i * 40, 0.12, 0.03, 0.4 - i * 0.2);
  riser(4.8, 5.75, 0.02);
  // silence: nothing is scheduled from 5.85 to 6.5
  sub(cu.hit, 0.42);
  noiseHit(cu.hit, 0.4, 'bandpass', 3000, 1.2, 0.08, 0, 0.2, 7000);
  chime(cu.hit, [nz('D5'), nz('A5'), nz('Fs6'), nz('D6')], 0.14);
  ['D4', 'Fs4', 'A4', 'B4', 'D5'].forEach((n, i) => pluck(cu.hit + 0.04 + i * 0.04, nz(n), 0.16, -0.4 + i * 0.2, 0.5, 3600, 0.3));
  for (let i = 0; i < 4; i++) blip(cu.hit + 0.75 + i * BEAT * 0.5, 1500, 1500, 0.04, 0.025);
