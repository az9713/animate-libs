// =====================================================================
//  styles/flat-vector/kit.js — a flat-vector explainer (the corporate / motion-graphics look): clean solid shapes with
//  rounded corners, no outlines, no texture, a limited bold palette on an off-white ground, flat long shadows, geometric
//  characters (circle head, pill body) and bold sans type. Motion is on 1s: shapes scale and slide in on springs
//  (SPRING / springEase from kit/core.js) with overshoot, staggered. Nothing wobbles or boils.
//  Built on kit/core.js (RNG, ellipsePts, rrectPts, bbox, trace, toScreen, fillAll, springEase, DEFER, SPARK_AT).
//  Needs from the piece head: W, H, CX (caption centre x). It sets its own font stack (FVF).
// =====================================================================
const FV = {
  navy: '#1f2a5a', coral: '#ff6b5e', sunny: '#ffc83d', teal: '#2ec4b6', lilac: '#b9a6ff', ground: '#f6f3ee',
  shade: '#e6e0dc',                       // the flat long shadow on the ground (opaque, so overlapping steps do not build up)
};
const FVF = '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif';

// ---- geometry helpers (points in world coords)
const fvCirc = (x, y, r) => ellipsePts(x, y, r, r, 0, 64);
const fvRR = (x, y, w, h, r) => rrectPts(x, y, w, h, r, 10);
const fvMid = (P) => { const b = bbox(P); return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]; };
function fvAbout(P, k, c) { if (k === 1) return P; c = c || fvMid(P); return P.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k]); }

// ---- a spring pop: 0 -> 1 with overshoot, from time t0 (preset p from SPRING). Use it as a scale or an offset.
const fvPop = (t0, p = SPRING.playful) => springEase(TT - t0, p.k, p.d);

// ---- a flat shape. o: long (length of the flat 45-degree long shadow, px), drop (a single soft drop shadow offset, px),
//      s (scale about o.at, default the shape's centre), a (alpha). No outline. Colour c may be hex or rgb().
function fvShape(P, c, o = {}) {
  const k = o.s ?? 1; if (k <= 0.002 || (o.a ?? 1) <= 0) return;
  const Q = fvAbout(P, k, o.at);
  ctx.save(); ctx.globalAlpha = o.a ?? 1;
  if (o.long) {
    const n = Math.max(2, Math.ceil(o.long * k / 3)); ctx.fillStyle = o.shade ?? FV.shade;
    for (let i = n; i >= 1; i--) { const d = o.long * k * i / n * 0.7071; trace(Q.map(([x, y]) => [x + d, y + d]), true); ctx.fill(); }
  }
  if (o.drop) { ctx.fillStyle = 'rgba(31,42,90,0.16)'; trace(Q.map(([x, y]) => [x, y + o.drop * k]), true); ctx.fill(); }
  ctx.fillStyle = c; trace(Q, true); ctx.fill(); ctx.restore();
}
// a pill (capsule) from (x0, y0) to (x1, y1), width w
function fvPill(x0, y0, x1, y1, w, c, o = {}) {
  ctx.save(); ctx.globalAlpha = o.a ?? 1; ctx.lineCap = 'round'; ctx.lineWidth = w;
  if (o.drop) { ctx.strokeStyle = 'rgba(31,42,90,0.16)'; ctx.beginPath(); ctx.moveTo(x0, y0 + o.drop); ctx.lineTo(x1, y1 + o.drop); ctx.stroke(); }
  ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}

// ---- type: bold sans. fvText returns the width. o: weight, align, a (alpha)
function fvText(str, x, y, size, c, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${FVF}`; ctx.fillStyle = c; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = o.a ?? 1;
  const w = ctx.measureText(str).width; ctx.fillText(str, x, y); ctx.restore(); return w;
}
// a headline: lines centred at CX, each word slides up and fades in on a spring, staggered by gap seconds. y0 = first baseline.
function fvHead(lines, t0, y0, size, c = FV.navy, o = {}) {
  let n = 0;
  lines.forEach((ln, li) => {
    const ws = ln.split(' '); ctx.save(); ctx.font = `800 ${size}px ${FVF}`;
    const sp = ctx.measureText(' ').width, w = ws.map((s) => ctx.measureText(s).width); ctx.restore();
    let x = CX - (w.reduce((a, b) => a + b, 0) + sp * (ws.length - 1)) / 2;
    ws.forEach((s, i) => {
      const p = springEase(TT - t0 - n * (o.gap ?? 0.09), 200, 17); n++;
      if (p > 0.001) fvText(s, x, y0 + li * size * 1.15 + (1 - p) * 80, size, c, { a: clamp(p * 2.5) });
      x += w[i] + sp;
    });
  });
}

// ---- the ground: off-white, big soft discs partly off frame, a dot grid, drifting confetti (background life). v seeds the layout.
function fvGround(v = 0, avoid = [CX, 1000, 340]) {
  fillAll(FV.ground);
  ctx.save();
  ctx.globalAlpha = 0.32; ctx.fillStyle = FV.lilac; trace(fvCirc(960, 250 + Math.sin(TT * 0.9) * 10, 300), true); ctx.fill();
  ctx.globalAlpha = 0.2; ctx.fillStyle = FV.teal; trace(fvCirc(40, 1600 + Math.sin(TT * 0.8 + 1) * 10, 240), true); ctx.fill();
  ctx.globalAlpha = 0.16; ctx.fillStyle = FV.navy;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { trace(fvCirc(810 + i * 34, 640 + j * 34, 5), true); ctx.fill(); }
  ctx.restore();
  const cs = [FV.coral, FV.teal, FV.lilac], R = RNG('fvc', v); let n = 0;
  for (let tries = 0; n < 8 && tries < 80; tries++) {
    const x = R.r(90, 940), y = R.r(640, 1400), kind = R.i(0, 2), col = cs[R.i(0, 2)], s = R.r(14, 26), ph = R.r(0, TAU), sp = R.r(0.3, 0.7);
    if (Math.hypot(x - avoid[0], y - avoid[1]) < avoid[2] || (x > 690 && y > 1040) || (x > 780 && y < 760 && y > 620)) continue;
    n++;
    const cx = x + Math.sin(TT * TAU * 0.12 + ph) * 12, cy = y + Math.sin(TT * TAU * sp * 0.4 + ph) * 16, rot = TT * 0.6 + ph;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.fillStyle = col; ctx.globalAlpha = 0.9;
    if (kind === 0) { trace(fvCirc(0, 0, s * 0.7), true); ctx.fill(); }
    else if (kind === 1) { trace(fvRR(-s * 0.2, -s, s * 0.4, s * 2, s * 0.2), true); ctx.fill(); trace(fvRR(-s, -s * 0.2, s * 2, s * 0.4, s * 0.2), true); ctx.fill(); }
    else { trace(fvRR(-s * 0.8, -s * 0.8, s * 1.6, s * 1.6, s * 0.4), true); ctx.fill(); }
    ctx.restore();
  }
}

// ---- the hero: a friendly geometric character. (x, y) = the ground under its feet; s = 1 is ~380px tall with its antenna.
//      sunny head + hands are the hero's reserved colour. o: look [x, y], mood 'calm'|'wave'|'wow'|'happy', hop (0..1), key, al
function fvHero(x, y, s = 1, o = {}) {
  const al = o.al ?? 1; if (al <= 0 || s <= 0) return;
  const key = o.key ?? 'hero', mood = o.mood ?? 'calm', hop = clamp(o.hop ?? 0), jump = Math.sin(Math.PI * hop);
  const up = jump * 70 * s, hy = y - up - Math.sin(TT * TAU * 0.8 + key.length) * 4 * s;
  SPARK_AT = toScreen(x, hy - 230 * s);
  let lx = 0, ly = 0;
  if (o.look) { const [sx, sy] = toScreen(x, hy - 268 * s), [tx, ty] = toScreen(o.look[0], o.look[1]), d = Math.hypot(tx - sx, ty - sy) || 1; lx = (tx - sx) / d; ly = (ty - sy) / d; }
  const ph = (F + (hash('blink', key) % 47)) % 66, blink = ph < 5 ? Math.sin(Math.PI * ph / 5) : 0;
  ctx.save(); ctx.globalAlpha = al;
  ctx.fillStyle = 'rgba(31,42,90,0.13)'; ctx.beginPath(); ctx.ellipse(x + 10 * s, y + 2 * s, 78 * s * (1 - jump * 0.25), 13 * s * (1 - jump * 0.25), 0, 0, TAU); ctx.fill();
  ctx.translate(x, hy); ctx.scale(s * (1 - 0.05 * jump), s * (1 + 0.08 * jump));
  const up2 = mood === 'wow' || mood === 'happy', wv = Math.sin(TT * TAU * 1.7);
  // legs and feet
  for (const sx of [-1, 1]) { fvPill(sx * 26, -62, sx * 26, -10, 28, FV.navy); ctx.fillStyle = FV.coral; ctx.beginPath(); ctx.ellipse(sx * 32, -6, 28, 12, 0, 0, TAU); ctx.fill(); }
  // body, a teal pocket with a button
  trace(fvRR(-62, -232, 124, 186, 62), true); ctx.fillStyle = FV.navy; ctx.fill();
  ctx.fillStyle = FV.teal; trace(fvCirc(0, -132, 24), true); ctx.fill(); ctx.fillStyle = FV.ground; trace(fvCirc(0, -132, 9), true); ctx.fill();
  // arms: angle 0 = right, PI/2 = down
  const armR = up2 || mood === 'wave' ? -0.95 + 0.35 * wv : 1.35 + 0.06 * wv, armL = mood === 'wow' || mood === 'happy' ? Math.PI + 0.95 - 0.35 * (mood === 'happy' ? wv : 0) : Math.PI - 1.35 - 0.06 * wv;
  for (const [sx, a] of [[1, armR], [-1, armL]]) {
    const ex = sx * 56 + Math.cos(a) * 92, ey = -202 + Math.sin(a) * 92;
    fvPill(sx * 56, -202, ex, ey, 26, FV.navy); ctx.fillStyle = FV.sunny; trace(fvCirc(ex, ey, 17), true); ctx.fill();
  }
  // antenna (the idle wiggle), then the head
  const ax = Math.sin(TT * TAU * 1.1 + 1) * 8;
  fvPill(0, -330, ax, -372, 8, FV.navy); ctx.fillStyle = FV.coral; trace(fvCirc(ax, -378, 12), true); ctx.fill();
  ctx.fillStyle = FV.sunny; trace(fvCirc(0, -268, 76), true); ctx.fill();
  // face: eyes with a highlight, cheeks, a mouth by mood
  for (const sx of [-1, 1]) {
    ctx.fillStyle = FV.navy; ctx.beginPath(); ctx.ellipse(sx * 27 + lx * 4, -276 + ly * 4, 10, 13 * (1 - blink * 0.9) + 0.5, 0, 0, TAU); ctx.fill();
    if (blink < 0.5) { ctx.fillStyle = FV.ground; ctx.beginPath(); ctx.arc(sx * 27 + lx * 4 + 3, -281 + ly * 4, 3.6, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = al * 0.55; ctx.fillStyle = FV.coral; ctx.beginPath(); ctx.arc(sx * 48, -248, 12, 0, TAU); ctx.fill(); ctx.globalAlpha = al;
  }
  ctx.strokeStyle = FV.navy; ctx.fillStyle = FV.navy; ctx.lineWidth = 7; ctx.lineCap = 'round';
  if (mood === 'wow') { ctx.beginPath(); ctx.ellipse(0, -238, 11, 15, 0, 0, TAU); ctx.fill(); }
  else if (mood === 'happy') { ctx.beginPath(); ctx.arc(0, -254, 24, 0.05, Math.PI - 0.05); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(-18, -246); ctx.quadraticCurveTo(0, -230, 18, -246); ctx.stroke(); }
  ctx.restore();
}

// ---- tags and captions: drawn after the camera, at screen size (DEFER). They fade out before a bridge's shape shrinks and
// fade in after the window starts to open, so they do not fight the morph.
function fvFade() {
  let a = 1;
  if (typeof BRIDGES !== 'undefined') for (const r of BRIDGES) { if (TT < r.tc) a *= 1 - seg(TT, r.tc - 0.6, r.tc - 0.25); else a *= seg(TT, r.tc + 0.2, r.tc + 0.5); }
  return a;
}
const fvTag = (str, c = FV.coral) => {
  const f = () => {
    const p = fvPop(E0 + 0.1, SPRING.snappy), a = fvFade(); if (p <= 0.01 || a <= 0) return;
    ctx.save(); ctx.font = `800 44px ${FVF}`; const w = ctx.measureText(str).width + 76; ctx.restore();
    fvShape(fvRR(70, 290, w, 68, 34), c, { s: p, at: [70, 324], drop: 6, a });
    fvText(str, 108, 337, 44, FV.ground, { a: clamp(p) * a });
  };
  if (DEFER) DEFER.push(f); else f();
};
const fvCaption = (str, c = FV.coral) => {
  const f = () => {
    const p = fvPop(E0 + 1.6, SPRING.smooth), a = fvFade(); if (p <= 0.01 || a <= 0) return;
    const w = fvText(str, CX, 1440 + (1 - p) * 40, 56, FV.navy, { align: 'center', a: clamp(p) * a });
    ctx.save(); ctx.globalAlpha = a; trace(fvRR(CX - w * p / 2, 1462, w * p, 12, 6), true); ctx.fillStyle = c; ctx.fill(); ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
};

// =====================================================================
//  STYLE — the renderer's hooks (styles/README.md)
//    window: the old / new world seen through the bridge outline: a flat ring in the bridge colour and a long shadow
//    blob:   the morphing shape: a flat solid with a long shadow
// =====================================================================
const STYLE = {
  name: 'flat-vector',
  paper: FV.ground,
  ones: true,
  backdrop(c) { fillAll(c); },
  window(P, key, src, o = {}) {
    const c = o.c || FV.coral;
    fvShape(P, c, { long: 44 });
    ctx.save(); trace(P, true); ctx.lineJoin = 'round'; ctx.lineWidth = 32; ctx.strokeStyle = c; ctx.stroke(); ctx.restore();
    ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
  },
  blob(P, c) { fvShape(P, c, { long: 44 }); },
  hero(x, y, r, o = {}) { fvHero(x, y + r * 0.95, r / 190, { mood: o.mood, key: o.key }); },
  heroColor: FV.sunny,
  heroPts: (x, y, r) => ellipsePts(x, y, r * 0.5, r * 0.95, 0, 64),
  post() {},
};
