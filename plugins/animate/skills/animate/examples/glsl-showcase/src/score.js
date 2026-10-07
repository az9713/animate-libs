  // SCORE BODY — GLSL showcase (inside buildScore(); see kit/score-head.js). Chiptune, D major, 120 BPM.
  // Plan: a power-on stab and a rising sweep (title); a tick per picture step while the 16x16 grid fills, rising in pitch;
  // a blip and a crunch on each refinement (32, 64, 128) over a light arp; every event ends before 6.5; silence 6.5-7.0;
  // the loudest hit at 7.0 (stab chord + sub + noise), a flat chord, then a short decay.
  const T = TIMELINE, cu = T.cues;
  const chip = (t, n, vel, dur = 0.11, pan = 0, type = 'square', cut = 3600) => {
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut;
    const g = ac.createGain(); env(g, t, 0.002, vel, dur);
    osc(type, typeof n === 'number' ? n : nz(n), t, t + dur + 0.05).connect(lp); lp.connect(g); out(g, pan, 0);
  };
  const tri = (t, n, vel, dur = 0.2) => { const g = ac.createGain(); env(g, t, 0.003, vel, dur); osc('triangle', nz(n), t, t + dur + 0.05).connect(g); out(g, 0, 0); };
  to = 'm';
  // title: a chord stab at 0, then the bass starts with the code
  chip(0.0, 'D4', 0.05, 0.3, -0.2); chip(0.0, 'Fs4', 0.045, 0.3, 0); chip(0.0, 'A4', 0.045, 0.3, 0.2);
  // evaluate (1.0-3.0): triangle bass on the beat, a quiet arp on 8ths
  ['D3', 'A2', 'D3', 'A2'].forEach((n, k) => tri(1.0 + k * BEAT, n, 0.1, 0.35));
  const arp1 = ['D5', 'Fs5', 'A5', 'Fs5'];
  for (let i = 0; i < 8; i++) chip(1.0 + i * E8, arp1[i % 4], 0.02, 0.1, 0.1, 'square', 2400);
  // refine (3.0-6.5): bass on 8ths, 16th arps that get denser with each resolution
  const bassN = ['D3', 'D3', 'A2', 'A2', 'E3', 'E3', 'Fs3', 'Fs3'];
  for (let i = 0; i < 13; i++) tri(3.0 + i * E8, bassN[i % 8], 0.12, 0.18);
  const arp2 = ['D5', 'A4', 'Fs5', 'A4', 'E5', 'A4', 'D5', 'B4'];
  for (let i = 0; i < 28; i++) chip(3.0 + i * E16, arp2[i % 8], 0.03, 0.08, 0.1, 'square', 3600);
  for (let i = 0; i < 8; i++) chip(4.0 + i * E16, arp2[(i + 3) % 8], 0.022, 0.07, -0.15, 'square', 4200);
  for (let i = 0; i < 12; i++) chip(5.0 + i * E16, arp2[(i + 5) % 8], 0.022, 0.07, 0.15, 'square', 4800);
  // payoff: the flat chord after the hit (the hit itself is in the sfx bus below)
  tri(7.0, 'D2', 0.2, 0.5);
  chip(7.0, 'D4', 0.05, 0.55, -0.2, 'triangle'); chip(7.0, 'A4', 0.045, 0.55, 0, 'triangle'); chip(7.0, 'Fs5', 0.045, 0.55, 0.2, 'triangle');
  to = 's';
  // title: power-on
  sweep(0.0, 0.85, 0.012, 300, 2400, 0);
  // evaluate: one tick per picture step (12 per second), rising from 500 Hz to 1700 Hz as the grid fills
  for (let k = 0; k < 21; k++) chip(1.0 + k / 12, 500 + k * 60, 0.03, 0.04, 0.1, 'square', 5000);
  blip(cu.scanEnd, 900, 1500, 0.08, 0.05);   // the grid is full
  // refinements: a blip each, higher every time, and a crunch of noise
  [[cu.r32, 'A5'], [cu.r64, 'D6'], [cu.r128, 'Fs6']].forEach(([t, n]) => {
    chip(t, n, 0.07, 0.14, 0, 'square', 6000); chip(t + 0.08, 'A6', 0.04, 0.1, 0.1, 'square', 6000);
    noiseHit(t, 0.06, 'highpass', 5000, 0.8, 0.05, 0);
  });
  // the hit: the loudest moment of the piece, after 0.5 s of nothing
  sub(cu.hit, 0.5);
  noiseHit(cu.hit, 0.35, 'lowpass', 2600, 0.7, 0.2, 0);
  chip(cu.hit, 'D5', 0.1, 0.45, -0.2); chip(cu.hit, 'Fs5', 0.09, 0.45, 0); chip(cu.hit, 'A5', 0.09, 0.45, 0.2);
  blip(cu.hit + 0.02, 400, 2400, 0.25, 0.06);
