  // SCORE BODY — kinetic-type demo (inside buildScore(); see kit/score-head.js). A pad and a bass on the beat; a sub hit on every
  // slam; a pluck per letter that lands; a riser into the morph; a chime on the flip. D major, 120 BPM.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 4.05, ['D3', 'A3', 'Fs4'], 0.025, { type: 'triangle', cut: 1100, att: 0.3, rel: 0.3 });
  pad(4.0, 8.05, ['D3', 'A3', 'E4', 'Fs4'], 0.03, { type: 'triangle', cut: 1500, att: 0.2, rel: 0.4, send: 0.5 });
  for (let i = 0; i < 16; i++) bass(i * BEAT, nz(i % 2 ? 'A2' : 'D2'), 0.1);
  to = 's';
  sub(cu.words, 0.2);
  [0, 1, 2].forEach((i) => pluck(cu.are + i * 0.1 + 0.2, nz(['D4', 'Fs4', 'A4'][i]), 0.13, -0.2 + i * 0.2, 0.4, 2800, 0.3));
  for (let i = 0; i < 8; i++) blip(cu.pics + i * 0.04 + 0.1, 900 + i * 70, 1100 + i * 70, 0.04, 0.03, -0.3 + i * 0.09);
  noiseHit(cu.rule, 0.3, 'bandpass', 3000, 1.2, 0.03, 0, 0.1, 6000);
  chime(cu.hero, [nz('D5'), nz('A5'), nz('Fs6')], 0.05);
  riser(3.3, 3.8, 0.02);
  sub(4.0, 0.16);
  [0, 1, 2, 3].forEach((i) => blip(cu.what + i * 0.05 + 0.1, 1000 + i * 120, 1200 + i * 120, 0.04, 0.03, -0.2 + i * 0.13));
  sub(cu.if, 0.15); sub(cu.if + 0.12, 0.12);
  noiseHit(cu.fill, 0.3, 'bandpass', 3000, 1.2, 0.03, 0, 0.1, 6000);
  chime(cu.flip, [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.07);
  for (let i = 0; i < 4; i++) blip(cu.wave2 + i * BEAT, 1500, 1500, 0.03, 0.02);
