// =====================================================================
//  SCENES — one function per era, animated with TT / ev / popS.
//  Placed by fractions of the frame (LX, LY) and sized by UNIT, so the same scene lays itself out in
//  9:16, 4:5, 1:1 and 16:9 (kit/core.js). Write layouts that differ by shape with PORTRAIT / WIDE.
//  Each scene: a full-bleed world, the hero acting, 3+ details of background life, a year tag and a caption.
// =====================================================================
// the bridge objects, shared with src/bridges.js so the morph starts and ends exactly on them
const MOON = () => [LX(0.72), LY(WIDE ? 0.26 : 0.22), 40 * UNIT];
const SUN = () => [LX(0.72), LY(WIDE ? 0.26 : 0.22), 80 * UNIT];
// Matter.js (libs/matter.js): physics is PRECOMPUTED, never run live. SIM() steps one engine from frame 0 to the last frame at a fixed
// 1/72 s step and stores every body's position and angle per frame; renderFrame(t) only reads that table, so any frame order gives the same pixels.
// The engine is built from the format's own sizes (LX, LY, UNIT) at the first call. Matter's random numbers are its own seeded generator.
let SIMT = null;
function SIM() {
  if (SIMT) return SIMT;
  const { Engine, Bodies, Body, Composite, Common } = Matter, u = UNIT, gy = LY(0.57), R = RNG('matter');
  Common._seed = 1;
  const eng = Engine.create({ gravity: { y: 1.4 } });
  const wall = (x, y, w, h) => Bodies.rectangle(x, y, w, h, { isStatic: true, friction: 0.6 });
  Composite.add(eng.world, [wall(W / 2, gy + 300 * u + 40, W * 2, 80), wall(-40, gy, 80, 4000), wall(W + 40, gy, 80, 4000), Bodies.rectangle(W * 0.5, gy + 250 * u, 360 * u, 40 * u, { isStatic: true, angle: -0.18, friction: 0.5 })]);   // floor, two side walls, a tilted ramp
  const items = Array.from({ length: 16 }, (_, i) => {
    const r = R.r(26, 46) * u, circle = i % 3 !== 2, x = LX(0.12 + R.r(0, 0.76)), t0 = TIMELINE.cues.flowers + i * 0.16;
    return { circle, r, x, t0, col: [PAL.pink, PAL.purple, PAL.yellow, '#ffffff', PAL.green][i % 5], body: null };
  });
  const frames = [], step = 1000 / 72;
  for (let f = 0; f < NFRAMES; f++) {
    for (let k = 0; k < 3; k++) {
      const now = f / FPS + k / 72;
      for (const it of items) if (!it.body && now >= it.t0) {
        it.body = it.circle ? Bodies.circle(it.x, -it.r - 20, it.r, { restitution: 0.55, friction: 0.2 }) : Bodies.rectangle(it.x, -it.r - 20, it.r * 1.8, it.r * 1.8, { restitution: 0.3, friction: 0.4, angle: R.r(0, 1) });
        Composite.add(eng.world, it.body);
      }
      Engine.update(eng, step);
    }
    frames.push(items.map((it) => it.body ? [it.body.position.x, it.body.position.y, it.body.angle] : null));
  }
  return (SIMT = { items, frames, ramp: [W * 0.5, gy + 250 * u, 360 * u, 40 * u, -0.18] });
}
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
  // the bodies: read from the precomputed table at this frame (see SIM above)
  const sm = SIM(), fr = sm.frames[clamp(Math.round(TT * FPS), 0, NFRAMES - 1)];
  { const [rx, ry, rw, rh, ra] = sm.ramp; ctx.save(); ctx.translate(rx, ry); ctx.rotate(ra); cut(rect(-rw / 2, -rh / 2, rw, rh, 6), PAL.woodD, { key: 'ramp' }); ctx.restore(); }
  sm.items.forEach((it, i) => {
    const p = fr[i]; if (!p) return;
    const [x, y, a] = p, c = Math.cos(a), s = Math.sin(a), r = it.r;
    cut(it.circle ? ellipsePts(x, y, r, r, 0, 24) : [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([px, py]) => [x + (px * c - py * s) * r * 0.9, y + (px * s + py * c) * r * 0.9]), it.col, { key: 'b' + i, sb: 4 });
  });
  spark(LX(0.46), gy - 140 * u, 110 * u, { rays: 8, mood: 'happy', key: 'hero' });
  yearTag('morning');
  capStrip('and the garden grows');
}
