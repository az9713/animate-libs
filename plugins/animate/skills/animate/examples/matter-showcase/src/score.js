  // SCORE BODY — Matter.js showcase (inside buildScore(); see kit/score-head.js)
  // A thin pad and a small motif under the toy, a soft knock for each collision the engine reports, a hard stop
  // 0.55 s before the heavy ball lands, then one deep hit (stab + sub) and a flat chord.
  const T = TIMELINE, cu = T.cues, S = SIM(), EV = S.ev, hit = EV.big.t;
  to = 'm';
  pad(0.0, hit - 0.55, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 900, att: 0.1, rel: 0.3, send: 0 });
  [['D4', 0], ['A4', E8]].forEach(([n, dt], i) => pluck(cu.release + dt, nz(n), 0.2, 0.1 - i * 0.2, 0.6, 2600, 0.3));   // the hero ball is let go
  [EV.ramp.t, EV.plank.t, EV.box.t].forEach((t, i) => pluck(t + 0.05, nz(['E5', 'Fs5', 'A5'][i]), 0.07, 0.3 - i * 0.3, 0.35, 3600, 0.25));   // a note is written
  // the stab and the flat chord after it
  pad(hit, hit + 0.4, ['D3', 'A3', 'D4', 'Fs4'], 0.12, { cut: 1500, att: 0.01, rel: 0.25, send: 0.15 });
  pad(hit + 0.4, 8.05, ['D3', 'A3', 'D4', 'Fs4'], 0.035, { cut: 900, att: 0.25, rel: 0.4, send: 0.3 });
  to = 's';
  for (let i = 0; i < 8; i++) noiseHit(0.1 + i * E16, 0.07, 'bandpass', 3600 + (i % 3) * 300, 2, 0.05, -0.2);          // pencil: the title is written
  for (let i = 0; i < 10; i++) noiseHit(0.25 + i * E16, 0.06, 'bandpass', 3000 + (i % 4) * 250, 1.6, 0.04, 0.2);        // pencil: the toy is sketched
  // a soft knock per collision the engine reports (none inside the silence before the hit)
  S.knocks.filter((k) => k.t > 0.9 && (k.t < hit - 0.6 || k.t > hit + 0.01) && k.t !== hit).slice(0, 14).forEach((k) => {
    const v = clamp(0.012 + k.speed * 0.0016, 0.015, 0.05), pan = clamp((k.x - 540) / 540, -0.7, 0.7);
    noiseHit(k.t, 0.09, 'bandpass', 220 + 20 * Math.min(k.speed, 12), 1.1, v, pan);
  });
  sub(hit, 0.55);                                                                                                         // the heavy ball lands
  noiseHit(hit, 0.16, 'lowpass', 1000, 0.7, 0.3);
