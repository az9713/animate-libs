  // SCORE BODY — katex showcase (inside buildScore(); see kit/score-head.js).
  // Thin and dry until the payoff: typing ticks, a rising pluck as each equation is typeset (D5, A5, D6), three tint plucks,
  // then 0.6s of silence (every event ends before 6.4s, no reverb send after 5.0s), then the D major stab + sub at 7.0s and a flat chord.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 6.35, ['D3', 'A3', 'Fs4'], 0.02, { type: 'triangle', cut: 900, att: 0.3, rel: 0.4, send: 0 });
  pluck(0.3, nz('D4'), 0.12, 0, 0.5, 2400, 0.3);                       // the title
  [[2.0, 'D5'], [3.5, 'A5'], [4.9, 'D6']].forEach(([t, n], i) => pluck(t, nz(n), 0.14 + i * 0.02, -0.2 + i * 0.2, 0.5, 3200, 0.3));   // each equation typeset
  [[cu.tint, 'E5'], [cu.tint + 0.25, 'Fs5'], [cu.tint + 0.5, 'A5']].forEach(([t, n], i) => pluck(t, nz(n), 0.1, -0.2 + i * 0.2, 0.3, 3200, 0));   // the colours sweep in, dry
  // the payoff: a short chord stab and a sub on the hit, then a flat chord with nothing busy on top
  [['D4', 0], ['A4', 0.01], ['Fs5', 0.02], ['D5', 0.03]].forEach(([n, dt], i) => pluck(cu.hit + dt, nz(n), 0.32, -0.3 + i * 0.2, 0.4, 3600, 0.2));
  chime(cu.hit, [nz('D5'), nz('A5'), nz('Fs6')], 0.07);
  pad(cu.hit, 8.05, ['D3', 'A3', 'D4', 'Fs4'], 0.045, { type: 'triangle', cut: 1200, att: 0.05, rel: 0.4, send: 0.2 });
  to = 's';
  // typing ticks: a short filtered noise click on every second character
  ROWS.map((r) => [r.t0, r.dt, r.src.length]).forEach(([t0, dt, n]) => { for (let i = 0; i < n; i += 2) noiseHit(t0 + (i / n) * dt, 0.02, 'bandpass', 3200, 2, 0.03, ((i * 7) % 5 - 2) * 0.1, 0); });
  // KaTeX wipes the image in: a short rising swish before each pluck
  [[1.6, 2.0], [3.1, 3.5], [4.5, 4.9]].forEach(([a, b]) => sweep(a, b, 0.012, 700, 3000, 0));
  sub(cu.hit, 0.5);
