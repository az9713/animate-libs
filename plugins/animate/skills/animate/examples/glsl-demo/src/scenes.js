// =====================================================================
//  SCENES — one function per era, animated with TT / ev / popS.
//  Placed by fractions of the frame (LX, LY) and sized by UNIT, so the same scene lays itself out in
//  9:16, 4:5, 1:1 and 16:9 (kit/core.js). Write layouts that differ by shape with PORTRAIT / WIDE.
//  Each scene: a full-bleed world, the hero acting, 3+ details of background life, a year tag and a caption.
// =====================================================================
// the bridge objects, shared with src/bridges.js so the morph starts and ends exactly on them
const MOON = () => [LX(0.72), LY(WIDE ? 0.26 : 0.22), 40 * UNIT];
const SUN = () => [LX(0.72), LY(WIDE ? 0.26 : 0.22), 80 * UNIT];
// GLSL (libs/glsl.js, raw WebGL, no library): a fragment shader renders into an offscreen canvas from u_t; the scene clips it into a circle.
const GLS = GLSL.make(`
  precision highp float; uniform float u_t; varying vec2 v;
  void main() { vec2 p = v * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x);
    float w = sin(10.0 * r - 3.0 * u_t) * 0.5 + 0.5, s = sin(6.0 * a + 2.0 * u_t + 4.0 * r) * 0.5 + 0.5;
    vec3 c = mix(vec3(1.0, 0.82, 0.29), vec3(0.94, 0.44, 0.60), w) * (0.65 + 0.35 * s); gl_FragColor = vec4(c, 1.0); }`, 512);
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
  // the shader disc: one draw call per frame at u_t = TT, clipped to a circle that grows in on the cue
  { const k = popS(TIMELINE.cues.flowers); if (k > 0) { const [cx, cy] = [LX(0.46), LY(0.32)], r = 240 * u * k;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip(); ctx.drawImage(GLS.draw({ u_t: TT }), cx - r, cy - r, r * 2, r * 2); ctx.restore(); } }
  spark(LX(0.46), gy - 140 * u, 110 * u, { rays: 8, mood: 'happy', key: 'hero' });
  yearTag('morning');
  capStrip('and the garden grows');
}
