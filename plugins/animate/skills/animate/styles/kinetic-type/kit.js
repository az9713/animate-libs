// =====================================================================
//  styles/kinetic-type/kit.js — kinetic typography: the picture is made of words and letters. Huge heavy grotesque type
//  fills the frame; words slam, slide and rise out from behind a baseline; letters split off and fly to their place on
//  springs; outlines (stroke only) sit beside solid type; a flat bar sweeps under a word. No illustrations: the hero is one
//  glyph (an asterisk, a '?') on a flat block. Flat colour only, no texture, no shadow, no grain.
//  Built on kit/core.js (RNG, EZ, springEase / SPRING, rrectPts, trace, mod, toScreen, fillAll, DEFER, SPARK_AT).
//  Motion is on 1s (STYLE.ones): the springs are fast, and on 2s their overshoot reads as a stutter.
//  Needs from the piece head: W, H, CX (centre x of the safe area), HAND (any font stack; only kit/board.js reads it).
//  Words are drawn straight on the frame with fillText / strokeText, so tools/review.mjs can read and check them.
//  Only the faint ghost rows are drawn into a cached bitmap (decoration, not words).
// =====================================================================
const KTC = { ink: '#111111', yellow: '#ffe14d', white: '#f4f4f0', blue: '#2438ff', red: '#ff3b30' };
const ktFace = '"Arial Black", "Segoe UI Black", "Helvetica Neue", Helvetica, Impact, Arial, sans-serif';
const ktFont = (size) => `900 ${size}px ${ktFace}`;

// ---- measuring (system fonts are static, so a cache keyed on the string and the size is safe)
const KT_M = {};
function ktMeasure(str, size) {
  const k = size + '|' + str; if (KT_M[k] != null) return KT_M[k];
  ctx.save(); ctx.font = ktFont(size); const w = ctx.measureText(str).width; ctx.restore();
  return (KT_M[k] = w);
}
function ktCap(size) {   // cap height of the face at this size (the height of an 'H')
  const k = 'cap|' + size; if (KT_M[k] != null) return KT_M[k];
  ctx.save(); ctx.font = ktFont(size); const a = ctx.measureText('H').actualBoundingBoxAscent; ctx.restore();
  return (KT_M[k] = a || size * 0.72);
}
const ktFit = (str, w) => Math.floor(100 * w / ktMeasure(str, 100));   // the font size at which str is w px wide
// rows = [{ s, w } | { s, size }] -> [{ s, size, cap, base, w }]: stacked caps, first cap top at `top`, `gap` between rows
function ktStack(rows, top, gap) {
  let y = top;
  return rows.map((r) => { const size = r.size ?? ktFit(r.s, r.w), cap = ktCap(size); y += cap; const o = { s: r.s, size, cap, base: y, w: ktMeasure(r.s, size) }; y += gap; return o; });
}

// ---- one word: o = { align, fill, fa (fill alpha), line, lw, al, dx, dy, rot, sx, sy, px, py (pivot), clip: [x, y, w, h] }
// Scale and rotation turn about the pivot (default: the middle of the word's caps). Returns the width.
function ktType(str, x, base, size, o = {}) {
  const w = ktMeasure(str, size), al = o.al ?? 1; if (al <= 0.02) return w;
  const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x, px = o.px ?? x0 + w / 2, py = o.py ?? base - ktCap(size) / 2;
  ctx.save(); ctx.globalAlpha *= al;
  if (o.clip) { ctx.beginPath(); ctx.rect(...o.clip); ctx.clip(); }
  ctx.translate(px + (o.dx || 0), py + (o.dy || 0)); ctx.rotate(o.rot || 0); ctx.scale(o.sx ?? 1, o.sy ?? o.sx ?? 1); ctx.translate(-px, -py);
  ctx.font = ktFont(size); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (o.fill) { ctx.save(); ctx.globalAlpha *= o.fa ?? 1; ctx.fillStyle = o.fill; ctx.fillText(str, x0, base); ctx.restore(); }
  if (o.line) { ctx.strokeStyle = o.line; ctx.lineWidth = o.lw ?? size * 0.03; ctx.lineJoin = 'round'; ctx.strokeText(str, x0, base); }
  ctx.restore(); return w;
}
// the same word letter by letter: fn(i, n) -> { dx, dy, rot, sx, sy, al } for letter i. o as ktType, plus track (extra px between letters).
function ktLetters(str, x, base, size, o = {}, fn = () => ({})) {
  const n = str.length, tr = o.track || 0, w = ktMeasure(str, size) + tr * (n - 1);
  const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  for (let i = 0; i < n; i++) {
    if (str[i] === ' ') continue;
    const v = fn(i, n) || {};
    ktType(str[i], x0 + ktMeasure(str.slice(0, i + 1), size) - ktMeasure(str[i], size) + tr * i, base, size, { fill: o.fill, fa: o.fa, line: o.line, lw: o.lw, clip: o.clip, ...v });
  }
  return w;
}
// a flat bar swept left to right: it covers [lerp(x0, x1, pOut), lerp(x0, x1, pIn)] (pIn grows first, then pOut follows it off)
function ktRule(x0, x1, y, h, c, pIn, pOut = 0) {
  const a = lerp(x0, x1, pOut), b = lerp(x0, x1, pIn); if (b - a < 1) return;
  ctx.save(); ctx.fillStyle = c; ctx.fillRect(a, y - h / 2, b - a, h); ctx.restore();
}

// ---- the hero glyph: an asterisk drawn as three bold bars (the font's own '*' is small and sits high), or any other character.
// (x, y) = centre, s = half the glyph's size, sx squashes it sideways (a flip turns it through 0).
function ktGlyph(ch, x, y, s, c, rot = 0, sx = 1) {
  if (s < 1) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, 1); ctx.fillStyle = c;
  if (ch === '*') {
    for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(k * Math.PI / 3); ctx.fillRect(-s, -s * 0.2, s * 2, s * 0.4); ctx.restore(); }
  } else {
    const size = Math.round(s * 2.1);
    ctx.font = ktFont(size); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(ch, 0, ktCap(size) / 2);
  }
  ctx.restore();
}
// the hero: a glyph on a flat block. o: glyph, shape ('square' rounded block | 'circle'), bg, fg, sc (scale), rot, gx (glyph squash).
// r = half the block's size. Sets SPARK_AT for the anchor check.
function ktHero(x, y, r, o = {}) {
  const sc = o.sc ?? 1, R = r * sc; if (R < 2) return;
  SPARK_AT = toScreen(x, y);
  ctx.save(); ctx.fillStyle = o.bg ?? KTC.ink;
  if (o.shape === 'circle') { ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill(); }
  else { trace(rrectPts(x - R, y - R, R * 2, R * 2, R * 0.36, 8), true); ctx.fill(); }
  ctx.restore();
  ktGlyph(o.glyph ?? '*', x, y, R * 0.62, o.fg ?? KTC.red, o.rot ?? 0, o.gx ?? 1);
}

// ---- background life, all in the era's ink colour c
// ghost rows: a word repeated in outline, huge, running off both frame edges, drifting; drawn from a cached bitmap
const KT_GH = {};
function ktGhost(str, size, y, dir, speed, c, al, lw = 4) {
  const key = str + '|' + size + '|' + c + '|' + lw;
  if (!KT_GH[key]) {
    const gap = size * 0.45, cv = document.createElement('canvas'); cv.width = Math.ceil(ktMeasure(str, size) + gap); cv.height = Math.ceil(size * 1.1);
    const g = cv.getContext('2d'); g.font = ktFont(size); g.strokeStyle = c; g.lineWidth = lw; g.lineJoin = 'round'; g.strokeText(str, gap / 2, size * 0.88);
    KT_GH[key] = cv;
  }
  const cv = KT_GH[key], off = mod(TT * speed * dir, cv.width);
  ctx.save(); ctx.globalAlpha *= al;
  for (let x = off - cv.width; x < W; x += cv.width) ctx.drawImage(cv, x, y);
  ctx.restore();
}
// a ticker of single characters scrolling along y inside the safe width (x 60-940): each character is drawn on its own and
// fades in and out over 90px at the two ends, so no character is ever cropped or sits in the phone UI's right margin
function ktTicker(str, y, size, speed, c, al = 1) {
  const adv = [...str].map((ch) => ktMeasure(ch, size) + size * 0.14), tot = adv.reduce((a, b) => a + b, 0), off = mod(TT * speed, tot);
  ctx.save(); ctx.font = ktFont(size); ctx.fillStyle = c; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (let x = -off - tot; x < W; x += tot) {
    let px = x;
    for (let i = 0; i < str.length; i++) {
      const f = Math.min(seg(px, 60, 150), seg(px + adv[i], 938, 848));   // 0 at an end, 1 inside
      if (str[i] !== ' ' && f > 0) { ctx.globalAlpha = al * f; ctx.fillText(str[i], px, y); }
      px += adv[i];
    }
  }
  ctx.restore();
}
// four registration crosses on the corners of the safe area
function ktMarks(c, al = 0.55) {
  ctx.save(); ctx.strokeStyle = c; ctx.globalAlpha *= al; ctx.lineWidth = 4; ctx.beginPath();
  for (const [x, y] of [[60, 232], [940, 232], [60, 1492], [940, 1492]]) { ctx.moveTo(x - 16, y); ctx.lineTo(x + 16, y); ctx.moveTo(x, y - 16); ctx.lineTo(x, y + 16); }
  ctx.stroke(); ctx.restore();
}
// bars that jump to a new random height on every 8th note (an equaliser): n bars of width bw from x, standing on `base`
function ktBars(x, base, n, bw, gap, maxH, c, t0, seed = 0) {
  const k = Math.floor((TT - t0) / 0.25 + 1e-6); if (k < 0) return;
  const v = springEase(TT - (t0 + k * 0.25), 320, 24);
  ctx.save(); ctx.fillStyle = c;
  for (let i = 0; i < n; i++) { const a = k ? RNG('ktbar', seed, i, k - 1).r(0.15, 1) : 0, b = RNG('ktbar', seed, i, k).r(0.15, 1), h = maxH * lerp(a, b, v); ctx.fillRect(x + i * (bw + gap), base - h, bw, h); }
  ctx.restore();
}
// the whole background of an era: ghost rows, a ticker under the top safe edge, corner crosses
function ktBack(c, word, tick) {
  ktGhost(word, 330, 330, 1, 70, c, 0.16);
  ktGhost(word, 330, 790, -1, 95, c, 0.16);
  ktGhost(word, 330, 1250, 1, 55, c, 0.16);
  ktTicker(tick, 300, 44, 130, c, 0.9);
  ktMarks(c);
}

// ---- the caption: letter-spaced caps that rise from behind their baseline, one letter at a time; through DEFER (screen size).
// t0 = start, tOut = when the letters drop away again (before a morph, whose window would leave the caption floating).
const ktCaption = (str, c, t0, tOut) => {
  const f = () => {
    const tr = 6, n = str.length;
    let size = 54; const w = ktMeasure(str, size) + tr * (n - 1); if (w > 860) size = Math.floor(size * 860 / w);
    ktLetters(str, CX, 1448, size, { align: 'center', fill: c, track: tr, clip: [0, 1448 - size * 1.2, W, size * 1.2 + 6] }, (i) => {
      const v = springEase(TT - (t0 + i * 0.03), 320, 28), out = tOut == null ? 0 : ev(tOut + i * 0.02, 0.18);
      return { dy: (1 - v) * size * 0.9 + out * size * 0.9, al: clamp(v * 4) * (1 - out) };
    });
  };
  if (DEFER) DEFER.push(f); else f();
};

// =====================================================================
//  STYLE — the renderer's hooks (styles/README.md)
//    window: the old / new world seen through the bridge block, rimmed in the block's own colour
//    blob:   the morphing block; its glyph shrinks away (an asterisk) and the next one grows (a '?')
// =====================================================================
const STYLE = {
  name: 'kinetic-type',
  paper: '#f4f4f0',
  ones: true,
  backdrop(c) { fillAll(c); },
  window(P, key, src, o = {}) {
    ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
    ctx.save(); trace(P, true); ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.strokeStyle = o.c || KTC.ink; ctx.stroke(); ctx.restore();
  },
  blob(P, c, key, u) {
    ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore();
    const b = bbox(P), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, R = (b.x1 - b.x0) / 2;
    if (u < 0.5) ktGlyph('*', cx, cy, R * 0.62 * (1 - EZ.i2(u * 2)), KTC.red, u * 5);
    else ktGlyph('?', cx, cy, R * 0.62 * EZ.back((u - 0.5) * 2), KTC.white, (1 - EZ.o3((u - 0.5) * 2)) * -1.2);
  },
  hero(x, y, r, o = {}) { ktHero(x, y, r, { sc: 1, ...o }); },
  heroColor: KTC.red,
  heroPts: (x, y, r) => rrectPts(x - r, y - r, r * 2, r * 2, r * 0.36, 8),
  post() {},
};
