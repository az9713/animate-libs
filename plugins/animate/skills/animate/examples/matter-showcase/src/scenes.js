// =====================================================================
//  SCENES — Matter.js showcase. World coordinates 1080x1920 (the page); time TT on 2s.
//  Everything that moves in the toy is read from SIM() (src/sim.js); the notes and the counter are timed by its events.
// =====================================================================
const NOTE_AL = 0.9;
const rectLocal = (w, h) => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
const atBody = (x, y, a, fn) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); fn(); ctx.restore(); };
const simFrame = () => clamp(Math.round(TT * FPS), 0, NFRAMES - 1);
const itemOf = (kind) => SIM().items.map((it, i) => ({ it, i })).filter((q) => q.it.kind === kind);

// a pencilled-then-inked slab (a ramp, a box, a plank), drawn around the origin; part 0..1 writes it on
function slab(w, h, key, part = 1, o = {}) {
  if (part <= 0) return;
  const P = rectLocal(w, h);
  if (part >= 1) {
    gfill(P, SK.paper, { off: [0, 0], key: key + 'p', amp: 0.8 });
    if (o.hatch !== false) { ctx.save(); gclip(P); ghatch(-w / 2, -h / 2, w / 2, h / 2, { ang: o.ang ?? -0.85, gap: o.gap ?? 9, col: SK.graph, w: 1.8, a: o.ha ?? 0.4, key: key + 'h' }); ctx.restore(); }
  }
  gpencil(P, { closed: true, key: key + 'c', w: 2.4, a: 0.7, part: Math.min(1, part * 1.5), amp: 1.4, passes: 1 });
  gline(P, { closed: true, key, w: o.w ?? 4.5, part: seg(part, 0.35, 1), amp: 1.1 });
}

// a ball drawn around the origin: fill, hatching on the shaded side, ink outline, then a mark that shows it spinning
function ball(r, key, o) {
  const P = loopPts(0, 0, r, r, 0, 0, 28), lw = Math.max(3, r * 0.08);
  gfill(P, o.fill, { off: [r * 0.06, r * 0.05], key: key + 'f', amp: 1.2 });
  litHatch(P, { ang: -0.85, gap: Math.max(5, r * 0.15), col: o.hatch, w: Math.max(1.6, r * 0.04), a: o.ha ?? 0.8, key: key + 'h' });
  gline(loopPts(0, 0, r, r, 0.07), { w: lw, key: key + 'o', amp: 1.2 });
  if (o.spokes) for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + 0.2; gline([[Math.cos(an) * r * 0.1, Math.sin(an) * r * 0.1], [Math.cos(an) * r * 0.5, Math.sin(an) * r * 0.5]], { w: r * 0.08, col: SK.cream, key: key + 's' + i, amp: 0.4, second: false, step: 6 }); }
  if (o.mark) gline([[0, 0], [r * 0.82, 0]], { w: Math.max(2.4, r * 0.07), col: o.mark, key: key + 'm', amp: 0.5, second: false, step: 6 });
}

// a handwritten note: the word is written on, a graphite arrow follows and its head flicks in last
function note(word, x, y, size, t0, dur, route, key) {
  if (TT < t0 - 1e-6 || TT > t0 + dur) return;
  const al = NOTE_AL * (1 - seg(TT, t0 + dur - 0.25, t0 + dur));
  const [x0, x1] = handLetter(word, x, y, size, { reveal: ev(t0, 0.3), key, a: al });
  highlight(x0, x1, y - size * 0.28, size * 0.55, ev(t0 + 0.3, 0.2), { key, a: 0.75 * al });
  const part = ev(t0 + 0.2, 0.3);
  gpencil(route, { part, col: SK.ink, w: 3.4, key: key + 'a', a: al, passes: 2 });
  if (part > 0.85) {
    const Q = resample(route, false, 6), e = Q[Q.length - 1], q = Q[Math.max(0, Q.length - 4)], an = Math.atan2(e[1] - q[1], e[0] - q[0]), hk = seg(part, 0.85, 1);
    for (const s of [-1, 1]) gpencil([e, [e[0] - Math.cos(an + s * 0.5) * 26 * hk, e[1] - Math.sin(an + s * 0.5) * 26 * hk]], { col: SK.ink, w: 3.4, key: key + 'h' + s, amp: 0.6, passes: 1, a: al });
  }
}
// a curved arrow route from a to b, bowed by `bow` pixels
function route(a, b, bow = 0) {
  const P = [], mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bow, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bow;
  for (let i = 0; i <= 14; i++) { const u = i / 14; P.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * mx + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * my + u * u * b[1]]); }
  return P;
}

// the title: big for the first second, then it shrinks to a taped tag at the top left; the subtitle follows
function header() {
  const k = EZ.io(seg(TT, TIMELINE.cues.shrink, TIMELINE.cues.shrink + 0.6)), title = 'Matter.js', sub = 'real physics, precomputed';
  const bigS = Math.min(190, 840 / letterW(title, 100, 'marker') * 100), sTitle = lerp(bigS, 70, k), wBig = letterW(title, bigS, 'marker');
  const xT = lerp(CX - wBig / 2, 84, k), yT = lerp(440, 340, k), wT = letterW(title, sTitle, 'marker');
  if (k > 0.4) { ctx.save(); ctx.globalAlpha = seg(k, 0.4, 1); tapeStrip(xT + wT / 2, yT - sTitle * 0.3, wT + 70, -0.03, 'tagtape', sTitle * 1.15); ctx.restore(); }
  const [t0, t1] = handLetter(title, xT, yT, sTitle, { face: 'marker', align: 'left', reveal: ev(TIMELINE.cues.title, 0.5), key: 'title', jit: 0.7 });
  underline(t0, t1, yT + lerp(30, 20, k), { col: SK.red, w: lerp(9, 5, k), key: 'titleu', part: ev(0.6, 0.25) });
  const sS = lerp(70, 42, k), wS = letterW(sub, sS, 'hand'), xS = lerp(CX - wS / 2, 86, k), yS = lerp(545, 404, k);
  const [s0, s1] = handLetter(sub, xS, yS, sS, { align: 'left', reveal: ev(0.45, 0.45), key: 'sub', col: SK.ink });
  const xs = glyphX(sub, skFont(sS, 'hand')), i0 = sub.indexOf('physics');
  highlight(s0 + xs[i0], s0 + xs[i0 + 7], yS - sS * 0.28, sS * 0.55, ev(0.9, 0.25), { key: 'subhi' });
}

// the counter: read straight from the simulation (bodies in the world, active contact pairs)
function counter() {
  const sm = SIM(), fi = simFrame(), n = sm.bodies[fi], c = sm.contacts[fi], size = 44, y = 1488;
  if (TT < 0.5) return;
  const parts = [['bodies ', SK.graph], [String(n), SK.ink], ['    contacts ', SK.graph], [String(c), SK.ink]];
  let x = 84;
  const rv = ev(0.5, 0.4);
  parts.forEach(([s, col], i) => { handLetter(s, x, y, size, { align: 'left', col, reveal: rv, key: 'cnt' + i, jit: 0.6 }); x += letterW(s, size, 'hand'); });
}

// ---- the toy
function sceneToy() {
  const sm = SIM(), fi = simFrame(), fr = sm.frames[fi], EV = sm.ev, cu = TIMELINE.cues, flo = TOY.floor;
  sketchPage({ grid: 'dots' });
  // ground: a pencil line with short hatching under it
  { const part = ev(0.1, 0.35), R = RNG('ticks', B);
    gpencil([[60, flo + 1], [940, flo + 1]], { key: 'ground', w: 3, a: 0.8, part, step: 14 });
    gline([[60, flo + 1], [940, flo + 1]], { key: 'groundi', w: 4, part: seg(part, 0.3, 1), second: false, step: 14 });
    ctx.save(); ctx.strokeStyle = SK.graph; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath();
    for (let x = 60, i = 0; x < 940 * part; x += 30, i++) { ctx.moveTo(x + R.n(1.2), flo + 6); ctx.lineTo(x - 12 + R.n(1.2), flo + 24); }
    ctx.stroke(); ctx.restore(); }
  // ramp
  atBody(TOY.ramp.x, TOY.ramp.y, TOY.ramp.a, () => slab(TOY.ramp.len, TOY.ramp.th, 'ramp', ev(0.2, 0.3), { w: 5, gap: 8 }));
  // seesaw: fulcrum, stop post, then the plank and the pin (the constraint)
  { const pl = TOY.plank, pt = ev(0.35, 0.35), fx = pl.x, fy = pl.y + 8;
    const tri = [[fx, fy], [fx + 40, flo], [fx - 40, flo]];
    if (pt >= 1) gfill(tri, SK.paper, { off: [0, 0], key: 'fulf', amp: 0.8 });
    gpencil(closeP(tri), { key: 'fulc', w: 2.4, a: 0.7, part: Math.min(1, pt * 1.5), passes: 1 });
    gline(closeP(tri), { key: 'ful', w: 4.5, part: seg(pt, 0.35, 1), second: false });
    if (pt >= 1) { ctx.save(); gclip(tri); ghatch(fx - 40, fy, fx + 40, flo, { ang: -0.85, gap: 9, col: SK.graph, w: 1.8, a: 0.4, key: 'fulh' }); ctx.restore(); }
    atBody(TOY.stop.x, TOY.stop.y, 0, () => slab(TOY.stop.w, TOY.stop.h, 'stop', pt, { w: 4, hatch: false })); }
  // pyramid: written on row by row from the bottom
  itemOf('box').forEach(({ it, i }, n) => { const p = fr[i]; atBody(p[0], p[1], p[2], () => slab(it.s, it.s, 'box' + n, ev(0.5 + it.row * 0.07, 0.25), { gap: 7, w: 4 })); });
  // plank (a Matter body) and its pin
  { const [{ i }] = itemOf('plank'), p = fr[i];
    atBody(p[0], p[1], p[2], () => slab(TOY.plank.len, TOY.plank.th, 'plank', ev(0.4, 0.3), { w: 5, gap: 10 }));
    const pin = ev(0.7, 0.2);
    if (pin > 0) gline(loopPts(TOY.plank.x, TOY.plank.y, 9 * pin, 9 * pin, 0.1), { key: 'pin', w: 4, second: false, step: 5 }); }
  // pendulum: a ceiling bar, the chain from the stored link centres, a heavy bob
  { const pd = TOY.pend, pt = ev(0.6, 0.3), links = itemOf('link'), [{ i: ib }] = itemOf('bob');
    gline([[pd.x - 70, pd.y - 2], [pd.x + 70, pd.y - 2]], { key: 'bar', w: 6, part: pt, second: false });
    { ctx.save(); ctx.strokeStyle = SK.graph; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath();
      for (let k = 0; k < 8; k++) { if (k / 7 > pt) break; const x = pd.x - 66 + k * 19; ctx.moveTo(x, pd.y - 8); ctx.lineTo(x + 12, pd.y - 24); }
      ctx.stroke(); ctx.restore(); }
    const pts = [[pd.x, pd.y], ...links.map((q) => fr[q.i].slice(0, 2)), fr[ib].slice(0, 2)];
    gline(pts, { key: 'chain', w: 3.4, part: ev(0.7, 0.25), second: false, step: 10, amp: 0.6 });
    links.forEach((q, n) => { if (ev(0.7, 0.25) < 1) return; const p = fr[q.i]; gfill(loopPts(p[0], p[1], 8, 8, 0, 0, 12), SK.paper, { off: [0, 0], key: 'lk' + n, amp: 0.4 }); gline(loopPts(p[0], p[1], 8, 8, 0.08), { w: 3, key: 'lo' + n, second: false, step: 5, amp: 0.4 }); });
    if (ev(0.75, 0.2) > 0) atBody(fr[ib][0], fr[ib][1], fr[ib][2], () => ball(pd.bob, 'bob', { fill: SK.graphL, hatch: SK.ink, ha: 0.7, mark: SK.ink })); }
  // the small ball on the seesaw
  { const [{ i }] = itemOf('ballB'), p = fr[i]; if (ev(0.7, 0.2) > 0) atBody(p[0], p[1], p[2], () => ball(TOY.ballB.r, 'ballB', { fill: SK.paper, hatch: SK.graph, ha: 0.6, mark: SK.ink })); }
  // the heavy ball: pencilled in (dashed) above the toy, then it falls
  { const [{ i }] = itemOf('big'), p = fr[i], tb = cu.big;
    if (!p && TT > tb - 0.9) { ctx.save(); ctx.setLineDash([12, 12]); gpencil(loopPts(TOY.big.x, TOY.big.y, TOY.big.r, TOY.big.r, 0.04, -1.6, 40), { key: 'bigpre', w: 3, a: 0.8, part: ev(tb - 0.9, 0.7), passes: 1 }); ctx.restore(); }
    if (p) atBody(p[0], p[1], p[2], () => ball(TOY.big.r, 'big', { fill: SK.lead, hatch: SK.graphL, ha: 0.65, mark: SK.cream })); }
  // the hero ball: hovering (a dashed drop line under it) until it is let go, then read from the table
  { const [{ i }] = itemOf('hero'), p = fr[i], h = TOY.hero, pt = ev(0.8, 0.25);
    if (pt > 0) {
      if (!p) { ctx.save(); ctx.setLineDash([10, 14]); gpencil([[h.x, h.y + h.r + 6], [h.x, h.y + h.r + 62]], { key: 'drop', w: 2.6, a: 0.7, passes: 1 }); ctx.restore(); }
      const q = p || [h.x, h.y + 2 * Math.sin(B * 0.9), 0.1 * Math.sin(B * 0.7)];
      atBody(q[0], q[1], q[2], () => ball(h.r, 'hero', { fill: SK.terra, hatch: SK.terraD, ha: 0.85, spokes: true })); } }
  // impact marks at the moments the engine reports
  for (const [e, r] of [[EV.ramp, 40], [EV.plank, 70], [EV.box, 62], [EV.big, 90]]) if (e) sparkle(e.x, e.y - 20, r, ev(e.t, 0.35), 'spk' + e.a + e.b);
  // handwritten notes, each at the moment the engine says it happens
  note('gravity', 335, 690, 64, cu.release, 1.2, route([365, 712], [365, 850], 0), 'ng');
  note('friction', 205, 1040, 64, EV.ramp.t + 0.05, 1.2, route([205, 992], [212, 900], 0.05), 'nf');
  note('constraint', 215, 1295, 60, EV.plank.t + 0.05, 1.5, route([300, 1312], [452, 1370], -0.15), 'nc');
  note('collision', 545, 1215, 60, EV.box.t + 0.05, 1.4, route([610, 1240], [650, 1380], 0.1), 'nk');
  note('stacking', 505, 1170, 60, 4.5, 1.3, route([590, 1195], [690, 1295], 0.1), 'ns');
  note('momentum', 505, 1170, 60, EV.big.t + 0.05, 1.4, route([560, 1200], [560, 1330], -0.1), 'nm');
  header();
  counter();
}
