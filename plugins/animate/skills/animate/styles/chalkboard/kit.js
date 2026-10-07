// =====================================================================
//  styles/chalkboard/kit.js — chalk on a dark slate board: every mark is drawn into a small layer and then eroded
//  (speckle holes punched out), so strokes, fills, text and equation images all look like dry chalk. The wobble boils
//  on 2s; the speckle of a mark is fixed by its key, so chalk does not crawl. A chalk-stick hero with eyes.
//  Built on kit/core.js (RNG, wobble, subPath, bbox, ellipsePts, rrectPts, toScreen, fillAll, DEFER, SPARK_AT).
//  Needs from the piece head: W, H, HAND (a handwriting font stack), CX (caption centre x).
//  Equations: an image from a lib (MJ.img[id] with "libs": ["mathjax"], or KT.img[id]) goes through chImg(), which
//  erodes it the same way as chalk, so it stays readable (thin strokes keep >= 60% of their pixels at the default erosion).
// =====================================================================
const CB = {
  board: '#1e2b2c', boardL: '#273638', boardD: '#121b1c', tray: '#3b3530', trayD: '#26211d',
  white: '#f2efe4', grey: '#b9b8ad', yellow: '#f3d66e', blue: '#8fcbea', pink: '#f1a1b4', green: '#a7d99f', orange: '#f2b27c', red: '#ee8575',
};

// ---- a layer: draw into a small canvas (the draw fn works in the layer's coordinates, origin at its top-left), erode it, return it.
// amt scales how much chalk is missing (1 = default). The speckle depends on key (and on B when o.boil).
function chLayer(w, h, key, draw, o = {}) {
  const cv = document.createElement('canvas'); cv.width = Math.max(2, Math.ceil(w)); cv.height = Math.max(2, Math.ceil(h));
  const g = cv.getContext('2d'), keep = ctx;
  ctx = g;
  try { draw(); } finally { ctx = keep; }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
  const R = RNG('erode', key, o.boil ? B : 0), amt = o.amt ?? 1, n = Math.round(cv.width * cv.height / 38 * amt);
  for (let i = 0; i < n; i++) { g.globalAlpha = R.r(0.3, 0.95); g.fillRect(R.r(0, cv.width), R.r(0, cv.height), R.r(1, 2.8), R.r(1, 2.8)); }
  g.globalAlpha = 0.35; g.strokeStyle = '#000';                                   // a few scratches along the grain of the stroke
  for (let i = 0; i < Math.round(cv.width * cv.height / 2600 * amt); i++) { const x = R.r(0, cv.width), y = R.r(0, cv.height), a = R.r(0, TAU), l = R.r(5, 16); g.lineWidth = R.r(0.8, 1.6); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  g.restore();
  return cv;
}

// ---- a chalk line along any outline P (world coords). o: c, w, closed, frac (draw-on 0..1), key, amt (wobble), alpha, erode
function chStroke(P, o = {}) {
  const key = o.key ?? 'cs', closed = !!o.closed, w = o.w ?? 5, pad = w * 2 + 8;
  const Q = wobble(P, closed, o.amt ?? 1.4, key), Q2 = wobble(P, closed, (o.amt ?? 1.4) * 1.7 + 0.6, key + '~');
  const part = (R) => (o.frac != null && o.frac < 1 ? (o.frac <= 0 ? null : subPath(closed ? [...R, R[0]] : R, o.frac)) : R);
  const A = part(Q), A2 = part(Q2); if (!A || A.length < 2) return;
  const bb = bbox(Q.concat(Q2), pad), ww = bb.x1 - bb.x0, hh = bb.y1 - bb.y0;
  const cv = chLayer(ww, hh, key, () => {
    ctx.translate(-bb.x0, -bb.y0); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = o.c || CB.white;
    const cl = closed && !(o.frac != null && o.frac < 1);
    ctx.globalAlpha = o.alpha ?? 0.95; ctx.lineWidth = w; trace(A, cl); ctx.stroke();
    ctx.globalAlpha = (o.alpha ?? 0.95) * 0.45; ctx.lineWidth = w * 0.5; trace(A2, cl); ctx.stroke();
  }, { boil: true, amt: o.erode ?? 1 });
  ctx.drawImage(cv, bb.x0, bb.y0);
}

// ---- chalk hatching inside an outline (a chalk "fill"). o: a (alpha), gap, angle, w, key
function chFill(P, c, o = {}) {
  const key = o.key ?? 'cf', bb = bbox(P, 4), ww = bb.x1 - bb.x0, hh = bb.y1 - bb.y0, gap = o.gap ?? 11, ang = o.angle ?? -0.7;
  const cv = chLayer(ww, hh, key, () => {
    ctx.translate(-bb.x0, -bb.y0); ctx.save(); trace(P, true); ctx.clip();
    ctx.strokeStyle = c; ctx.globalAlpha = o.a ?? 0.5; ctx.lineWidth = o.w ?? 6; ctx.lineCap = 'round';
    const R = RNG('hatch', key), cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2, L = Math.hypot(ww, hh);
    ctx.translate(cx, cy); ctx.rotate(ang);
    for (let s = -L / 2; s < L / 2; s += gap) { const j = R.n(2.5); ctx.beginPath(); ctx.moveTo(-L / 2, s + j); ctx.lineTo(L / 2, s + j + R.n(2)); ctx.stroke(); }
    ctx.restore();
  }, { amt: 1.2 });
  ctx.drawImage(cv, bb.x0, bb.y0);
}

// ---- chalk text (handwriting). o: align, weight, frac (write-on, left to right), key. Returns the text width.
function chText(str, x, y, size, c, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 600} ${size}px ${o.font ?? HAND}`;
  const w = ctx.measureText(str).width; ctx.restore();
  const frac = clamp(o.frac ?? 1); if (frac <= 0) return w;
  const pad = size * 0.4, ww = w + pad * 2, hh = size * 1.7, x0 = x - (o.align === 'center' ? w / 2 : o.align === 'right' ? w : 0);
  const cv = chLayer(ww, hh, o.key ?? ('t' + str), () => {
    ctx.font = `${o.weight ?? 600} ${size}px ${o.font ?? HAND}`; ctx.fillStyle = c; ctx.globalAlpha = 0.95; ctx.textBaseline = 'alphabetic';
    if (frac < 1) { ctx.beginPath(); ctx.rect(0, 0, pad + w * frac, hh); ctx.clip(); }
    ctx.fillText(str, pad, size * 1.2);
  }, { amt: 0.9 });
  ctx.drawImage(cv, x0 - pad, y - size * 1.2);
  return w;
}

// ---- an image drawn as chalk: img (an Image or canvas, e.g. MJ.img[id]), centred at (x, y), scaled by o.s; o.frac wipes it on left to right.
function chImg(img, x, y, o = {}) {
  if (!img || !img.width) return;
  const s = o.s ?? 1, ww = img.width * s, hh = img.height * s, frac = clamp(o.frac ?? 1); if (frac <= 0) return;
  const cv = chLayer(ww, hh, o.key ?? 'img', () => {
    ctx.globalAlpha = o.alpha ?? 0.96;
    if (frac < 1) { ctx.beginPath(); ctx.rect(0, 0, ww * frac, hh); ctx.clip(); }
    ctx.drawImage(img, 0, 0, ww, hh);
  }, { amt: o.erode ?? 0.7 });
  ctx.drawImage(cv, x - ww / 2, y - hh / 2);
}

// ---- the board: slate, soft smudges of old writing rubbed out, a vignette, and the tray along the bottom edge
function chBoard(c = CB.board) {
  fillAll(c);
  ctx.save(); screen();
  const R = RNG('smudge', 'board');
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    ctx.strokeStyle = `rgba(242,239,228,${R.r(0.018, 0.04).toFixed(3)})`; ctx.lineWidth = R.r(50, 120);
    const x = R.r(60, W - 60), y = R.r(260, 1500), a = R.r(-0.4, 0.4), l = R.r(160, 420);
    ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); ctx.quadraticCurveTo(x, y + R.n(40), x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  const g = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.48, H * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.38)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function chTray(y = 1836) {   // the chalk tray, with two stubs of chalk and an eraser: background life
  ctx.save(); screen();
  ctx.fillStyle = CB.tray; ctx.fillRect(0, y, W, H - y); ctx.fillStyle = CB.trayD; ctx.fillRect(0, y, W, 8);
  const R = RNG('tray', 'a');
  [[130, CB.white, 62], [215, CB.yellow, 48], [300, CB.blue, 70]].forEach(([x, c, l], i) => { ctx.save(); ctx.translate(x, y - 12); ctx.rotate(R.r(-0.05, 0.05)); ctx.fillStyle = c; ctx.fillRect(0, -16, l, 16); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, -4, l, 4); ctx.restore(); });
  ctx.fillStyle = '#6b5a4a'; ctx.fillRect(760, y - 34, 150, 34); ctx.fillStyle = '#c9c3b4'; ctx.fillRect(760, y - 46, 150, 14);
  ctx.restore();
}

// ---- the hero: a stick of yellow chalk with eyes. (x, y) = the bottom of the stick; s = 1 is ~150px tall. o: look [x, y], mood 'calm'|'wow'|'happy', hop, key, al
function chHero(x, y, s = 1, o = {}) {
  const al = o.al ?? 1; if (al <= 0 || s <= 0) return;
  const key = o.key ?? 'stick', mood = o.mood ?? 'calm';
  y -= (Math.sin(TT * TAU * 0.8 + key.length) * 0.5 + 0.5) * 6 * s + 34 * s * Math.sin(Math.PI * clamp(o.hop ?? 0));
  SPARK_AT = toScreen(x, y - 75 * s);
  const bw = 70 * s, bh = 150 * s, pad = 14;
  const cv = chLayer(bw + pad * 2, bh + pad * 2, key, () => {
    ctx.translate(pad, pad);
    ctx.fillStyle = CB.yellow; ctx.strokeStyle = '#c9a93f'; ctx.lineWidth = 3 * s; ctx.lineJoin = 'round';
    trace(rrectPts(0, 0, bw, bh, 12 * s, 5), true); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(bw * 0.7, 6 * s, bw * 0.24, bh - 12 * s);    // a shaded side
    ctx.fillStyle = CB.white; trace(rrectPts(0, 0, bw, 22 * s, 10 * s, 4), true); ctx.fill();      // the rubbed tip
    const ph = (F + (hash('blink', key) % 47)) % 66, blink = ph < 5 ? Math.sin(Math.PI * ph / 5) : 0;
    let lx = 0, ly = 0;
    if (o.look) { const [sx, sy] = toScreen(x, y - 95 * s), [tx, ty] = toScreen(o.look[0], o.look[1]), d = Math.hypot(tx - sx, ty - sy) || 1; lx = (tx - sx) / d; ly = (ty - sy) / d; }
    const er = (mood === 'wow' ? 13 : 11) * s;
    for (const ex of [bw * 0.3, bw * 0.7]) {
      ctx.fillStyle = CB.board; ctx.beginPath(); ctx.ellipse(ex, 62 * s, er, er * (1 - blink * 0.9), 0, 0, TAU); ctx.fill();
      if (blink < 0.5) { ctx.fillStyle = CB.white; ctx.beginPath(); ctx.arc(ex + lx * er * 0.4, 62 * s + ly * er * 0.4, er * 0.4, 0, TAU); ctx.fill(); }
    }
    ctx.strokeStyle = CB.board; ctx.fillStyle = CB.board; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
    if (mood === 'wow') { ctx.beginPath(); ctx.ellipse(bw / 2, 98 * s, 6 * s, 8 * s, 0, 0, TAU); ctx.fill(); }
    else { const k = mood === 'happy' ? 8 : 3; ctx.beginPath(); ctx.moveTo(bw * 0.3, 96 * s); ctx.quadraticCurveTo(bw / 2, (96 + k * 1.6) * s, bw * 0.7, 96 * s); ctx.stroke(); }
  }, { amt: 0.5 });
  ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.rotate(-0.06); ctx.drawImage(cv, -bw / 2 - pad, -bh - pad); ctx.restore();
}

// ---- captions and tags: drawn after the camera, at screen size (DEFER)
const chTag = (str) => { const f = () => { const p = ev(E0 + 0.15, 0.5); chText(str, 70, 300, 46, CB.grey, { frac: p, key: 'tag' + str }); chStroke([[70, 322], [70 + str.length * 24, 326]], { c: CB.grey, w: 3, frac: ev(E0 + 0.5, 0.4), key: 'tagu', alpha: 0.7 }); }; if (DEFER) DEFER.push(f); else f(); };
const chCaption = (str, c = CB.white) => { const f = () => chText(str, CX, 1440, 56, c, { align: 'center', frac: ev(E0 + 0.45, 0.8), key: 'cap' + str }); if (DEFER) DEFER.push(f); else f(); };

// =====================================================================
//  STYLE — the renderer's hooks (styles/README.md)
//    window: the old / new world seen through the bridge outline, rimmed in chalk
//    blob:   the morphing shape: chalk hatching inside a chalk outline in the bridge shape's colour
// =====================================================================
const STYLE = {
  name: 'chalkboard',
  paper: CB.board,
  ones: false,
  backdrop(c) { fillAll(c); },
  window(P, key, src) {
    ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
    chStroke(P, { closed: true, c: CB.white, w: 5, key: 'win' + key, amt: 1.2 });
  },
  blob(P, c, key) { chFill(P, c, { a: 0.5, key: 'bf' + key }); chStroke(P, { closed: true, c, w: 6, key: 'bs' + key, amt: 1.2 }); },
  hero(x, y, r, o = {}) { chHero(x, y + r * 0.7, r / 105, { mood: o.mood, key: o.key }); },
  heroColor: CB.yellow,
  heroPts: (x, y, r, n) => rrectPts(x - r * 0.33, y - r * 0.72, r * 0.66, r * 1.44, r * 0.22, 8),
  post() {
    ctx.save(); screen(); const R = RNG('dust', B); ctx.fillStyle = 'rgba(242,239,228,0.07)'; ctx.beginPath();
    for (let i = 0; i < 700; i++) ctx.rect(R.r(0, W), R.r(0, H), 1.6, 1.6);
    ctx.fill(); ctx.restore();
  },
};
