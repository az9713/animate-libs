// =====================================================================
//  SCENES — lottie showcase. World coordinates 1080x1920; time TT on 1s (STYLE.ones).
//  The animation is Lottie JSON built in code (LOT_DATA). The JSON panel prints rows read from that same object;
//  Lottie loads deep copies of it (it edits the data it is given), seeked with goToAndStop(frame, true).
// =====================================================================
const LOT_FPS = 24, LOT_OP = 45, LOT_LAST = LOT_OP - 1;
const lcol = (h) => [1, 3, 5].map((i) => +(parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));   // '#rrggbb' -> Lottie 0..1 rgb
// bezier easing as [out.x, out.y, in.x, in.y]; 'back' has y > 1, so it overshoots
const LOT_EASE = { inout: [0.65, 0, 0.35, 1], out: [0.16, 1, 0.3, 1], in: [0.7, 0, 0.84, 0], back: [0.34, 1.56, 0.64, 1] };
const lst = (k) => ({ a: 0, k });
// animated property: keyframes at `frames`, values `vals`; the easing of a segment sits on its first keyframe
const lk = (frames, vals, eases = []) => ({ a: 1, k: frames.map((t, i) => {
  const o = { t, s: vals[i] };
  if (i < frames.length - 1) { const e = LOT_EASE[eases[i] || 'inout']; o.o = { x: [e[0]], y: [e[1]] }; o.i = { x: [e[2]], y: [e[3]] }; }
  return o;
}) });
const lgrp = (geo, rgb) => [{ ty: 'gr', it: [geo, { ty: 'fl', c: lst(rgb), o: lst(100), r: 1 },
  { ty: 'tr', p: lst([0, 0]), a: lst([0, 0]), s: lst([100, 100]), r: lst(0), o: lst(100), sk: lst(0), sa: lst(0) }] }];
const lEl = (w, h, rgb) => lgrp({ ty: 'el', p: lst([0, 0]), s: lst([w, h]) }, rgb);
const lRc = (w, h, r, rgb) => lgrp({ ty: 'rc', d: 1, s: lst([w, h]), p: lst([0, 0]), r: lst(r) }, rgb);
const lSr = (pts, outer, inner, rgb) => lgrp({ ty: 'sr', sy: 1, d: 1, pt: lst(pts), p: lst([0, 0]), r: lst(0), ir: lst(inner), is: lst(0), or: lst(outer), os: lst(0) }, rgb);
// a layer (shape layer, or a null when shapes is null); ks overrides the static transform
const lLayer = (ind, nm, shapes, ks, parent) => {
  const L = { ddd: 0, ind, ty: shapes ? 4 : 3, nm, sr: 1, ks: { o: lst(100), r: lst(0), p: lst([0, 0, 0]), a: lst([0, 0, 0]), s: lst([100, 100, 100]), ...ks }, ao: 0, ip: 0, op: LOT_OP, st: 0, bm: 0 };
  if (shapes) L.shapes = shapes;
  if (parent) L.parent = parent;
  return L;
};
const LC = { body: lcol(FV.ground), coral: lcol(FV.coral), teal: lcol(FV.teal), navy: lcol(FV.navy) };
// A rocket on a pad. The null layer "rocket" carries p (lift-off), s (pop, stretch) and r (wobble); its parts follow it.
const LOT_DATA = { v: '5.7.0', fr: LOT_FPS, ip: 0, op: LOT_OP, w: 400, h: 400, nm: 'rocket', ddd: 0, assets: [], layers: [
  lLayer(2, 'window', lEl(34, 34, LC.navy), { p: lst([0, -14, 0]) }, 1),
  lLayer(3, 'cap', lEl(50, 50, LC.coral), { p: lst([0, -56, 0]) }, 1),
  lLayer(4, 'band', lRc(74, 14, 7, LC.coral), { p: lst([0, 36, 0]) }, 1),
  lLayer(5, 'body', lEl(80, 160, LC.body), {}, 1),
  lLayer(6, 'finL', lRc(24, 66, 10, LC.teal), { p: lst([-46, 54, 0]), r: lst(22) }, 1),
  lLayer(7, 'finR', lRc(24, 66, 10, LC.teal), { p: lst([46, 54, 0]), r: lst(-22) }, 1),
  lLayer(8, 'flame', lSr(5, 34, 14, LC.coral), {
    p: lst([0, 104, 0]),
    o: lk([0, 12, 22, 32, 44], [[0], [100], [65], [100], [80]], ['out', 'inout', 'inout', 'inout']),
    s: lk([0, 12, 24, 36, 44], [[60, 60, 100], [130, 130, 100], [85, 85, 100], [135, 135, 100], [100, 100, 100]], ['out', 'inout', 'inout', 'inout']),
  }, 1),
  ...[[60, 80], [336, 112], [312, 250]].map(([x, y], d) => lLayer(9 + d, 'spark' + d, lSr(4, 22 - d * 3, 7, LC.body), {
    p: lst([x, y, 0]),
    r: lk([0, 44], [[0], [d % 2 ? -180 : 180]], ['inout']),
    o: lk([d * 3, 14 + d * 3, 44], [[0], [100], [0]], ['out', 'inout']),
    s: lk([d * 3, 14 + d * 3, 30 + d * 3, 44], [[0, 0, 100], [100, 100, 100], [60, 60, 100], [0, 0, 100]], ['back', 'inout', 'in']),
  })),
  ...[0, 1, 2].map((d) => lLayer(12 + d, 'puff' + d, lEl(60, 60, LC.body), {
    p: lk([10 + d * 4, 42], [[200, 352, 0], [200 + (d - 1) * 96, 322 - d * 10, 0]], ['out']),
    s: lk([10 + d * 4, 42], [[20, 20, 100], [130, 130, 100]], ['out']),
    o: lk([10 + d * 4, 18 + d * 4, 42], [[0], [85], [0]], ['out', 'inout']),
  })),
  lLayer(15, 'pad', lRc(230, 14, 7, LC.navy), { p: lst([200, 368, 0]) }),
  lLayer(1, 'rocket', null, {
    p: lk([0, 14, 30, 44], [[200, 330, 0], [200, 330, 0], [200, 150, 0], [200, 110, 0]], ['inout', 'in', 'out']),
    s: lk([0, 8, 16, 28, 44], [[0, 0, 100], [100, 100, 100], [100, 100, 100], [86, 116, 100], [100, 100, 100]], ['back', 'inout', 'in', 'out']),
    r: lk([0, 22, 34, 44], [[0], [-6], [5], [0]], ['inout', 'inout', 'inout']),
  }),
] };
const LOT_KB = (JSON.stringify(LOT_DATA).length / 1024).toFixed(1);
// three renderers of the same JSON, at the pixel size they are drawn at (a deep copy each: Lottie edits what it loads)
const LOT = [512, 256, 128].map((n) => {
  const cv = document.createElement('canvas'); cv.width = cv.height = n;
  const anim = lottie.loadAnimation({ renderer: 'canvas', loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(LOT_DATA)), rendererSettings: { context: cv.getContext('2d'), clearCanvas: true, preserveAspectRatio: 'xMidYMid meet' } });
  return { cv, anim };
});

// ---- the playhead: which frame the animation is at, and which property the panel shows, in each part of the piece
const CUE = TIMELINE.cues;
const PH_SLICES = [[0, 's'], [14, 'p'], [30, 'r']];
const PHASES = [
  { t0: 0.0, t1: 4.0, layer: 'rocket', f: (t) => seg(t, CUE.play, 4.0) * LOT_LAST, slices: PH_SLICES, tf: (fa) => (fa ? CUE.play + fa / LOT_LAST * (4.0 - CUE.play) : 0) },
  { t0: 4.0, t1: 5.5, layer: 'flame', f: (t) => seg(t, 4.0, 5.5) * LOT_LAST, slices: [[0, 's'], [22, 'o']], tf: (fa) => (fa ? 4.0 + fa / LOT_LAST * 1.5 : -9) },
  { t0: 5.5, t1: 7.0, layer: 'rocket', f: (t) => LOT_LAST * (1 - EZ.io(seg(t, 5.5, 6.4))), slices: [[0, 'p']], tf: () => -9 },
  { t0: 7.0, t1: 99, layer: 'rocket', f: (t) => seg(t, 7.0, 7.95) * LOT_LAST, slices: PH_SLICES, tf: (fa) => (fa ? 7.0 + fa / LOT_LAST * 0.95 : -9) },
];
function playhead() {
  const P = PHASES.find((p) => TT >= p.t0 - 1e-6 && TT < p.t1 - 1e-6) || PHASES[0], f = P.f(TT);
  let si = 0; P.slices.forEach(([fa], i) => { if (f >= fa) si = i; });
  const [fa, prop] = P.slices[si];
  return { f, layer: P.layer, prop, age: TT - P.tf(fa) };
}

// ---- drawing helpers (all in the flat-vector kit's colours)
const LOT_MONO = 'Consolas, "Cascadia Mono", "Courier New", monospace';
function lotMonoText(str, x, y, size, c, a = 1) {
  ctx.save(); ctx.font = `700 ${size}px ${LOT_MONO}`; ctx.fillStyle = c; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = a; ctx.fillText(str, x, y); ctx.restore();
}
// the panel rows for one property of one layer, taken from LOT_DATA: [{ s, kind }], and which keyframe is active at frame f
function jsonRows(layerName, prop, f) {
  const li = LOT_DATA.layers.findIndex((l) => l.nm === layerName), L = LOT_DATA.layers[li], P = L.ks[prop], K = P.k;
  let ai = 0; K.forEach((k, i) => { if (f >= k.t - 1e-6) ai = i; });
  const act = K[ai], rows = [];
  rows.push({ s: `layers[${li}] "${L.nm}"  ks.${prop}.k`, kind: 'path' });
  rows.push({ s: `"fr": ${LOT_DATA.fr}, "ip": ${L.ip}, "op": ${L.op}, "ty": ${L.ty}`, kind: 'meta' });
  rows.push({ s: `"${prop}": { "a": ${P.a}, "k": [`, kind: 'meta' });
  K.forEach((k, i) => rows.push({ s: `  { "t": ${String(k.t).padStart(2)}, "s": ${JSON.stringify(k.s)} }${i < K.length - 1 ? ',' : ''}`, kind: i === ai ? 'active' : 'kf' }));
  rows.push({ s: '] }', kind: 'meta' });
  if (act.o) { rows.push({ s: `  "o": ${JSON.stringify(act.o)},`, kind: 'ease' }); rows.push({ s: `  "i": ${JSON.stringify(act.i)}`, kind: 'ease' }); }
  else rows.push({ s: '  // last keyframe: value holds', kind: 'meta' });
  return { rows, ticks: K.map((k) => k.t) };
}
function lotPanel(ph) {
  const X = 60, Y = 420, PW = 880, PH = 470;
  const pp = EZ.o2(seg(TT, CUE.panel, CUE.panel + 0.45));
  if (pp <= 0.01) return null;
  ctx.save(); ctx.translate(500, Y + PH / 2); ctx.scale(0.88 + 0.12 * pp, 0.88 + 0.12 * pp); ctx.translate(-500, -(Y + PH / 2));
  fvShape(fvRR(X, Y, PW, PH, 44), FV.navy, { long: 30, a: clamp(pp * 2) });
  const { rows, ticks } = jsonRows(ph.layer, ph.prop, ph.f), fade = clamp(ph.age / 0.14) * clamp(pp * 2), pitch = 40;
  rows.forEach((r, i) => {
    const y = Y + 54 + i * pitch;
    if (r.kind === 'active') { ctx.save(); ctx.globalAlpha = fade; trace(fvRR(X + 16, y - 29, PW - 32, 40, 16), true); ctx.fillStyle = FV.coral; ctx.fill(); ctx.restore(); }
    const c = r.kind === 'path' ? FV.teal : r.kind === 'ease' ? FV.teal : r.kind === 'meta' ? FV.lilac : FV.ground;
    lotMonoText(r.s, X + 30, y, 30, c, fade * (r.kind === 'kf' ? 0.85 : 1));
  });
  ctx.restore();
  return ticks;
}
// the animation card: the animation (or three sizes of it), the scrubber with a tick on each keyframe, the frame counter
function lotCard(ph, ticks) {
  const cp = EZ.o2(seg(TT, CUE.card, CUE.card + 0.45));
  if (cp <= 0.01) return;
  const CY0 = 930, f = ph.f, fi = Math.min(LOT_LAST, Math.floor(f + 1e-6));
  // connector between the panels
  fvShape(fvCirc(500, 910, 22), FV.coral, { s: cp, drop: 5 });
  if (cp > 0.5) { ctx.save(); ctx.strokeStyle = FV.ground; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(490, 904); ctx.lineTo(500, 916); ctx.lineTo(510, 904); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.translate(500, CY0 + 280); ctx.scale(0.88 + 0.12 * cp, 0.88 + 0.12 * cp); ctx.translate(-500, -(CY0 + 280));
  fvShape(fvRR(60, CY0, 880, 560, 56), FV.lilac, { long: 30, a: clamp(cp * 2) });
  // where the big one sits: alone in the middle, then the right-hand one of three
  const sp = EZ.io(seg(TT, CUE.sizes, CUE.sizes + 0.6));
  const big = { x: lerp(310, 540, sp), y: lerp(960, 970, sp), s: lerp(380, 370, sp) };
  const items = [{ i: 0, ...big, show: 1, lab: '370 px' },
    { i: 1, x: 250, y: 1120, s: 220, show: fvPop(CUE.sizes + 0.25, SPRING.smooth), lab: '220 px' },
    { i: 2, x: 90, y: 1240, s: 100, show: fvPop(CUE.sizes + 0.4, SPRING.smooth), lab: '100 px' }];
  items.forEach((it) => {
    if (it.show <= 0.01) return;
    const k = clamp(it.show, 0, 1.15), cx = it.x + it.s / 2, cy = it.y + it.s / 2;
    fvShape(fvRR(it.x - 10, it.y - 10, it.s + 20, it.s + 20, 36), FV.ground, { s: k, a: 0.45, at: [cx, cy] });
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
    LOT[it.i].anim.goToAndStop(f, true);
    ctx.drawImage(LOT[it.i].cv, it.x, it.y, it.s, it.s);
    ctx.restore();
    if (it.i > 0 || sp > 0.5) fvText(it.lab, cx, 1382, 30, FV.navy, { align: 'center', a: clamp(it.show) * (it.i ? 1 : clamp((sp - 0.5) * 2)) });
  });
  // the launch flash on the loudest hit
  const hp = seg(TT, CUE.hit, CUE.hit + 0.5);
  if (hp > 0 && hp < 1) fvShape(fvCirc(big.x + big.s / 2, big.y + big.s / 2, lerp(40, 220, EZ.o3(hp))), FV.coral, { a: 0.5 * (1 - hp) });
  // scrubber: track, a tick on each keyframe of the property in the panel, the played part, the knob
  const x0 = 110, x1 = 890, sy = 1412, kx = x0 + (f / LOT_LAST) * (x1 - x0);
  fvPill(x0, sy, x1, sy, 14, FV.ground, { a: 0.7 });
  if (kx > x0 + 1) fvPill(x0, sy, kx, sy, 14, FV.coral);
  ticks.forEach((t) => { const tx = x0 + (t / LOT_LAST) * (x1 - x0); fvPill(tx, sy - 14, tx, sy + 14, 6, FV.navy, { a: 0.55 }); });
  fvShape(fvCirc(kx, sy, 18), FV.navy, { drop: 5 });
  fvShape(fvCirc(kx, sy, 7), FV.ground);
  fvText(`frame ${fi} / ${LOT_OP}`, 110, 1472, 44, FV.navy);
  fvText(`${LOT_KB} KB of JSON`, 890, 1472, 34, FV.navy, { align: 'right', a: 0.8 });
  ctx.restore();
}

function sceneMain() {
  fvGround(3, [500, 1000, 360]);
  // the title: big at first, then it settles into the header and the panels open
  const u = EZ.io(seg(TT, 0.85, 1.3)), tp = fvPop(CUE.title, SPRING.heavy), sp = fvPop(CUE.sub, SPRING.smooth);
  // the title is already on screen at frame 0 (75% size) and springs to full size
  { ctx.save(); ctx.translate(CX, lerp(930, 330, u)); const k = lerp(1, 96 / 230, u) * (0.75 + 0.25 * clamp(tp, 0, 1.08)); ctx.scale(k, k); fvText('Lottie', 0, 0, 230, FV.navy, { align: 'center', a: 0.5 + 0.5 * clamp(tp) }); ctx.restore(); }
  fvText('one JSON file, any size', CX, lerp(1030, 382, u) + (1 - sp) * 30, lerp(58, 40, u), FV.navy, { align: 'center', a: (0.4 + 0.6 * clamp(sp)) * lerp(1, 0.8, u) });
  const ph = playhead(), ticks = lotPanel(ph);
  if (ticks) lotCard(ph, ticks);
}
