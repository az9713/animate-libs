// =====================================================================
//  SCENES — one function per era, animated with TT / ev / popS.
//  Placed by fractions of the frame (LX, LY) and sized by UNIT, so the same scene lays itself out in
//  9:16, 4:5, 1:1 and 16:9 (kit/core.js). Write layouts that differ by shape with PORTRAIT / WIDE.
//  Each scene: a full-bleed world, the hero acting, 3+ details of background life, a year tag and a caption.
// =====================================================================
// the bridge objects, shared with src/bridges.js so the morph starts and ends exactly on them
const MOON = () => [LX(0.72), LY(WIDE ? 0.26 : 0.22), 40 * UNIT];
const SUN = () => [LX(0.72), LY(WIDE ? 0.26 : 0.22), 80 * UNIT];
// Lottie (libs/lottie.js, light canvas build): a burst of 8 dots and a ring, written as Lottie JSON in code (no file, no URL).
// It draws into its own 400x400 canvas; the scene seeks it with goToAndStop(frame, true) and drawImage()s that canvas.
const LOT_FPS = 30, LOT_OP = 45;
const lk = (frames, vals) => ({ a: 1, k: frames.map((t, i) => { const o = { t, s: vals[i] }; if (i < frames.length - 1) { o.i = { x: [0.3], y: [1] }; o.o = { x: [0.7], y: [0] }; } return o; }) });   // keyframes; easing on every segment but the last
const lotLayer = (i, shape, ks, name) => ({ ddd: 0, ind: i, ty: 4, nm: name, sr: 1, ks, ao: 0, shapes: shape, ip: 0, op: LOT_OP, st: 0, bm: 0 });
const lotShape = (type, size, rgb, strokeW) => [{ ty: 'gr', it: [
  type === 'el' ? { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [size, size] } } : { ty: 'sr', sy: 1, d: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: size * 0.45 }, is: { a: 0, k: 0 }, or: { a: 0, k: size }, os: { a: 0, k: 0 } },
  strokeW ? { ty: 'st', c: { a: 0, k: rgb }, o: { a: 0, k: 100 }, w: { a: 0, k: strokeW }, lc: 2, lj: 2 } : { ty: 'fl', c: { a: 0, k: rgb }, o: { a: 0, k: 100 }, r: 1 },
  { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }] }];
const LOT_DATA = { v: '5.7.0', fr: LOT_FPS, ip: 0, op: LOT_OP, w: 400, h: 400, nm: 'burst', ddd: 0, assets: [], layers: [
  ...Array.from({ length: 8 }, (_, d) => {
    const a = d / 8 * TAU, rgb = [[0.98, 0.45, 0.67], [0.6, 0.45, 0.9], [1, 0.84, 0.3], [0.2, 0.83, 0.75]][d % 4];
    return lotLayer(d + 2, lotShape(d % 2 ? 'sr' : 'el', d % 2 ? 36 : 30, rgb),
      { o: lk([0, 12, 45], [[0], [100], [0]]), r: lk([0, 45], [[0], [d % 2 ? 180 : 0]]), p: lk([0, 30, 45], [[200, 200, 0], [200 + Math.cos(a) * 150, 200 + Math.sin(a) * 150, 0], [200 + Math.cos(a) * 170, 200 + Math.sin(a) * 170, 0]]), a: { a: 0, k: [0, 0, 0] }, s: lk([0, 10, 30, 45], [[0, 0, 100], [140, 140, 100], [100, 100, 100], [0, 0, 100]]) }, 'dot' + d);
  }),
  lotLayer(1, lotShape('el', 100, [1, 1, 1], 8), { o: lk([0, 30], [[100], [0]]), r: { a: 0, k: 0 }, p: { a: 0, k: [200, 200, 0] }, a: { a: 0, k: [0, 0, 0] }, s: lk([0, 30], [[20, 20, 100], [300, 300, 100]]) }, 'ring')] };
const LOT_CV = document.createElement('canvas'); LOT_CV.width = LOT_CV.height = 400;
const LOT = lottie.loadAnimation({ renderer: 'canvas', loop: false, autoplay: false, animationData: LOT_DATA, rendererSettings: { context: LOT_CV.getContext('2d'), clearCanvas: true, preserveAspectRatio: 'xMidYMid meet' } });
function sceneNight() {
  const u = UNIT, [mx, my, mr] = MOON();
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.navy, { key: 'wallN', shadow: false, tear: 0, shade: false, pat: pat.dots('rgba(255,230,180,0.10)', 4, 70) });
  // the window, the moon (the bridge object), the stars
  cut(rect(mx - 220 * u, my - 140 * u, 360 * u, 400 * u, 6), PAL.woodD, { key: 'win' });
  cut(rect(mx - 196 * u, my - 116 * u, 312 * u, 352 * u, 2), PAL.night, { key: 'glass', shadow: false, pat: (bb) => { const R = RNG('stars'); for (let i = 0; i < 30; i++) sparkle(R.r(bb.x0, bb.x1), R.r(bb.y0, bb.y1), R.r(3, 7) * u * (0.6 + 0.4 * ((B + i) % 2))); } });
  cut(ellipsePts(mx, my, mr, mr, 0, 30), '#f6ecc8', { key: 'moon' });
  cut(rect(mx - 240 * u, my + 250 * u, 400 * u, 30 * u, 4), PAL.wood, { key: 'sill' });
  cat(mx - 60 * u, my + 225 * u, 0.8 * u, PAL.charcoal, 'catN');
  clock(LX(0.36), my + 20 * u, 80 * u, 11, 52, 'clock');
  // the desk, a lamp, a mug
  const dy = LY(0.6), lx = LX(WIDE ? 0.1 : 0.19);
  cut(rect(-30, dy, W + 60, H - dy + 30, 0), PAL.wood, { key: 'desk', tear: 0, pat: pat.grainWood('rgba(120,60,20,0.18)'), sy: -6 });
  cut(ellipsePts(lx, dy, 80 * u, 22 * u, 0, 24), PAL.lamp, { key: 'lbase' });
  cut(capsulePts(lx, dy - 10 * u, lx + 60 * u, dy - 250 * u, 20 * u), '#c9a24a', { key: 'larm' });
  cut([[lx, dy - 230 * u], [lx + 40 * u, dy - 310 * u], [lx + 200 * u, dy - 310 * u], [lx + 240 * u, dy - 230 * u]], PAL.lamp, { key: 'shade' });
  mug(LX(WIDE ? 0.86 : 0.76), dy + 60 * u, 0.9 * u, PAL.yellow, 'mugN');
  // the hero: asleep (eyes closed), then it wakes and grows
  spark(LX(0.46), dy - 90 * u, 96 * u, { rays: 7, mood: TT < TIMELINE.cues.wake ? 'focus' : 'wow', key: 'hero', s: 0.65 + 0.35 * popS(TIMELINE.cues.wake) });
  yearTag('night');
  capStrip('the spark wakes up');
}
function sceneMorning() {
  const u = UNIT, [sx, sy, sr] = SUN();
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.mint, { key: 'wallM', shadow: false, tear: 0, shade: false, pat: pat.stripes('rgba(255,255,255,0.18)', 30, 80) });
  cut(ellipsePts(sx, sy, sr, sr, 0, 36), PAL.yellow, { key: 'sun', crayon: '#e6b23a' });
  [[0.19, 0.19], [0.39, 0.16]].forEach(([fx, fy], i) => cut(ellipsePts(LX(fx) + Math.sin(TT + i) * 10 * u, LY(fy), 70 * u, 28 * u, 0, 20), '#ffffff', { key: 'cloud' + i, sb: 6 }));
  const gy = LY(0.57);
  cut([[-40, gy], [W * 0.28, gy - 40 * u], [W * 0.65, gy + 10 * u], [W + 40, gy - 30 * u], [W + 40, H + 80], [-40, H + 80]], PAL.green, { key: 'grass', sy: -4, pat: pat.stripes('rgba(255,255,255,0.12)', 4, 22, 0.3) });
  // the burst: a Lottie animation, seeked to (TT - cue) * 30 frames; nothing is drawn before the cue or after its last frame
  const lf = (TT - TIMELINE.cues.flowers) * LOT_FPS;
  if (lf >= 0 && lf <= LOT_OP - 1) {
    LOT.goToAndStop(lf, true);
    const sz = 760 * u; ctx.drawImage(LOT_CV, LX(0.46) - sz / 2, gy - 140 * u - sz / 2, sz, sz);
  }
  spark(LX(0.46), gy - 140 * u, 110 * u, { rays: 8, mood: 'happy', key: 'hero' });
  yearTag('morning');
  capStrip('and the garden grows');
}
