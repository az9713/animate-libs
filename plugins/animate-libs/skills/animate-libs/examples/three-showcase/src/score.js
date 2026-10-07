  // SCORE BODY — three.js showcase. A calm pad, a pluck on each label, a hush from 6.0 to 6.5, then the loudest hit.
  // Everything before the hush ends by 5.95 with no reverb send, so the 0.5 s of silence is clean.
  const T = TIMELINE, q = T.cues;
  to = 'm';
  pad(0.0, 5.95, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 1200, att: 0.3, rel: 0.12, send: 0 });
  [['D4', q.light], ['A4', q.shading], ['Fs4', q.persp], ['D5', q.depth]].forEach(([n, t], i) => pluck(t, nz(n), 0.16, -0.2 + i * 0.13, 0.5, 2600, 0));
  pluck(q.panels, nz('A3'), 0.12, 0, 0.5, 2200, 0);
  // the hit: a short stab, a sub, then a flat chord
  [['D4', 0], ['A4', 0.02], ['Fs5', 0.04], ['D5', 0.06]].forEach(([n, d]) => pluck(q.hit + d, nz(n), 0.34, 0, 0.45, 3800, 0.3));
  sub(q.hit, 0.34);
  pad(q.hit + 0.1, 8.05, ['D3', 'A3', 'D4', 'Fs4'], 0.03, { type: 'triangle', cut: 1000, att: 0.15, rel: 0.3, send: 0.2 });
  to = 's';
  blip(q.panels, 700, 1500, 0.08, 0.04); blip(q.panels + 0.06, 900, 1800, 0.08, 0.03);
  sweep(q.persp - 0.25, q.persp, 0.01, 500, 2400, 0);   // the lens opening
  sweep(q.depth - 0.25, q.depth, 0.01, 800, 3000, 0);   // the knot swinging in
