// =====================================================================
//  styles/blueprint/kit.js — an engineering blueprint: deep blue ground with a fine and a major grid, white and pale-cyan
//  hairlines, dashed construction lines, dimension lines with arrows and numbers, callout leaders, a title block, mono
//  labels. Lines are RIGID (no wobble) and are drawn on (stroke reveal) with an ease-in-out; nothing is filled.
//  Motion is on 2s (the default), so a moving part steps like a plotter. The hero is a drafting compass drawn as outline.
//  Built on kit/core.js (RNG, EZ, subPath, bbox, ellipsePts, rrectPts, toScreen, fillAll, screen, MONO, DEFER, SPARK_AT).
//  Needs from the piece head: W, H, CX (caption centre x). Needs from the piece: BRIDGES (read by bpFade at draw time).
//  Every line width is divided by the camera zoom, so lines stay hairlines under a push-in.
// =====================================================================
const BP = {
  ground: '#0b2a5b', groundD: '#071d42',
  white: '#e8f3ff', cyan: '#7fd0ff', mute: '#a9c8ea', con: '#8fbff0',
  gridF: 'rgba(127,208,255,0.12)', gridM: 'rgba(127,208,255,0.26)',
};

const bpZ = () => ctx.getTransform().a || 1;           // the camera zoom now
const bpEv = (t, d) => EZ.io(ev(t, d));                // draw-on progress of an event: ease in-out
function bpPath(P, closed) { ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); if (closed) ctx.closePath(); }

// ---- a rigid hairline along P (world coords). o: c, w, closed, frac (draw-on 0..1), alpha, dash [on, off]
function bpLine(P, o = {}) {
  const frac = o.frac ?? 1; if (frac <= 0 || P.length < 2) return;
  let Q = P, cl = !!o.closed;
  if (frac < 1) { Q = subPath(cl ? [...P, P[0]] : P, frac); cl = false; }
  const z = bpZ();
  ctx.save(); ctx.strokeStyle = o.c || BP.white; ctx.lineWidth = (o.w ?? 2.4) / z; ctx.globalAlpha = o.alpha ?? 1;
  ctx.lineCap = o.dash ? 'butt' : 'round'; ctx.lineJoin = 'miter'; ctx.miterLimit = 3;
  if (o.dash) ctx.setLineDash(o.dash.map((d) => d / z));
  bpPath(Q, cl); ctx.stroke(); ctx.restore();
}
// many short separate segments in one stroke (ticks). S = [[[x, y], [x, y]], ...]; frac reveals them in order
function bpSegs(S, o = {}) {
  const n = Math.ceil(S.length * clamp(o.frac ?? 1)); if (n <= 0) return;
  ctx.save(); ctx.strokeStyle = o.c || BP.white; ctx.lineWidth = (o.w ?? 2) / bpZ(); ctx.globalAlpha = o.alpha ?? 1; ctx.lineCap = 'butt'; ctx.beginPath();
  for (let i = 0; i < n; i++) { ctx.moveTo(S[i][0][0], S[i][0][1]); ctx.lineTo(S[i][1][0], S[i][1][1]); }
  ctx.stroke(); ctx.restore();
}
function bpArrow(x, y, dx, dy, size, c, alpha = 1) {   // a filled arrowhead, tip at (x, y), pointing along (dx, dy)
  const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux, bx = x - ux * size, by = y - uy * size;
  ctx.save(); ctx.fillStyle = c; ctx.globalAlpha = alpha; ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(bx + nx * size * 0.3, by + ny * size * 0.3); ctx.lineTo(bx - nx * size * 0.3, by - ny * size * 0.3); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---- mono text typed on from left to right (frac). o: align, rot, weight, alpha, frac. Returns the full width.
function bpText(str, x, y, size, c, o = {}) {
  const font = `${o.weight ?? 600} ${size}px ${MONO}`;
  ctx.save(); ctx.font = font; const w = ctx.measureText(str).width; ctx.restore();
  const frac = clamp(o.frac ?? 1); if (frac <= 0) return w;
  const shown = str.slice(0, Math.ceil(str.length * frac)), x0 = o.align === 'center' ? -w / 2 : o.align === 'right' ? -w : 0;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  ctx.font = font; ctx.fillStyle = c; ctx.globalAlpha = o.alpha ?? 1; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(shown, x0, 0);
  if (frac < 1) { const cw = ctx.measureText(shown).width; ctx.fillRect(x0 + cw + 2, -size * 0.4, size * 0.5, size * 0.8); }   // the typing cursor
  ctx.restore(); return w;
}

// ---- the sheet: grid (fine every 30, major every 150) in world coords, so a camera moves it with the drawing
function bpGrid(a = 1) {
  const z = bpZ(), inv = ctx.getTransform().inverse();
  const bb = bbox([[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => { const p = inv.transformPoint(new DOMPoint(x, y)); return [p.x, p.y]; }));
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'butt';
  for (const [step, col, lw] of [[30, BP.gridF, 1], [150, BP.gridM, 2]]) {
    const o = (lw % 2) * 0.5 / z;
    ctx.strokeStyle = col; ctx.lineWidth = lw / z; ctx.beginPath();
    for (let x = Math.floor(bb.x0 / step) * step; x <= bb.x1; x += step) { if (step === 30 && x % 150 === 0) continue; ctx.moveTo(x + o, bb.y0); ctx.lineTo(x + o, bb.y1); }
    for (let y = Math.floor(bb.y0 / step) * step; y <= bb.y1; y += step) { if (step === 30 && y % 150 === 0) continue; ctx.moveTo(bb.x0, y + o); ctx.lineTo(bb.x1, y + o); }
    ctx.stroke();
  }
  ctx.restore();
}
// the border with zone ticks and the title block (screen space). o: frame, block (draw-on 0..1), fill (text typed 0..1), name, sheet, rev
function bpSheet(o = {}) {
  ctx.save(); screen();
  const fr = o.frame ?? 1, I = 40, O = 22;
  bpLine([[I, I], [W - I, I], [W - I, H - I], [I, H - I]], { closed: true, w: 3, c: BP.white, frac: fr, alpha: 0.9 });
  bpLine([[O, O], [W - O, O], [W - O, H - O], [O, H - O]], { closed: true, w: 1.5, c: BP.white, frac: fr, alpha: 0.4 });
  const zx = (W - 2 * I) / 4, zy = (H - 2 * I) / 6, T = [];
  for (let k = 1; k < 4; k++) { T.push([[I + k * zx, O], [I + k * zx, I]], [[I + k * zx, H - I], [I + k * zx, H - O]]); }
  for (let k = 1; k < 6; k++) { T.push([[O, I + k * zy], [I, I + k * zy]], [[W - I, I + k * zy], [W - O, I + k * zy]]); }
  bpSegs(T, { w: 2, frac: fr, alpha: 0.7 });
  if (fr >= 1) {
    for (let k = 0; k < 4; k++) { bpText(String(k + 1), I + (k + 0.5) * zx, 31, 18, BP.mute, { align: 'center', weight: 400 }); bpText(String(k + 1), I + (k + 0.5) * zx, H - 31, 18, BP.mute, { align: 'center', weight: 400 }); }
    for (let k = 0; k < 6; k++) { const L = 'ABCDEF'[k]; bpText(L, 31, I + (k + 0.5) * zy, 18, BP.mute, { align: 'center', weight: 400 }); bpText(L, W - 31, I + (k + 0.5) * zy, 18, BP.mute, { align: 'center', weight: 400 }); }
  }
  // the title block: three rows, the right column split
  const bx = 560, by = 1720, bf = o.block ?? 1, tf = o.fill ?? 1, ex = W - I, ey = H - I;
  bpLine([[bx, ey], [bx, by], [ex, by]], { w: 2.5, c: BP.white, frac: bf });
  bpLine([[bx, by + 54], [ex, by + 54]], { w: 1.8, c: BP.white, frac: seg(bf, 0.2, 1), alpha: 0.8 });
  bpLine([[bx, by + 107], [ex, by + 107]], { w: 1.8, c: BP.white, frac: seg(bf, 0.3, 1), alpha: 0.8 });
  bpLine([[bx + 270, by + 54], [bx + 270, ey]], { w: 1.8, c: BP.white, frac: seg(bf, 0.4, 1), alpha: 0.8 });
  bpText(o.name ?? 'FLANGE ASSY', bx + 16, by + 27, 30, BP.white, { frac: seg(tf, 0, 0.5) });
  bpText('SCALE 1:1', bx + 16, by + 80, 24, BP.mute, { frac: seg(tf, 0.2, 0.7), weight: 400 });
  bpText('SHEET ' + (o.sheet ?? '1/2'), bx + 286, by + 80, 24, BP.mute, { frac: seg(tf, 0.3, 0.8), weight: 400 });
  bpText('DWG BP-001', bx + 16, by + 133, 24, BP.mute, { frac: seg(tf, 0.4, 0.9), weight: 400 });
  bpText('REV ' + (o.rev ?? 'A'), bx + 286, by + 133, 24, BP.cyan, { frac: seg(tf, 0.5, 1), weight: 600 });
  if (tf >= 1 && Math.floor(TT * 2) % 2 === 0) { ctx.fillStyle = BP.cyan; ctx.beginPath(); ctx.arc(ex - 26, by + 133, 7, 0, TAU); ctx.fill(); }   // a status lamp, blinks on the beat
  ctx.restore();
}
// the ground of every scene: blue, grid, sheet. o is passed to bpSheet.
function bpGround(o = {}) { fillAll(BP.ground); bpGrid(1); bpSheet(o); }

// ---- a dimension line from a to b, pushed off sideways by o.off (to the left of a->b when positive: the +n side), with extension
// lines, arrowheads, a gap around the number and the number. o: off, text, size, frac, c
function bpDim(a, b, o = {}) {
  const fr = clamp(o.frac ?? 1); if (fr <= 0) return;
  const c = o.c || BP.white, off = o.off ?? 60, size = o.size ?? 30, text = o.text ?? String(Math.round(dist(a, b)));
  const L = dist(a, b), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux, sg = off < 0 ? -1 : 1;
  const a2 = [a[0] + nx * off, a[1] + ny * off], b2 = [b[0] + nx * off, b[1] + ny * off], mid = [(a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2];
  ctx.save(); ctx.font = `600 ${size}px ${MONO}`; const tw = ctx.measureText(text).width; ctx.restore();
  const g = tw / 2 + 12, ext = 12 * sg;
  bpLine([[a[0] + nx * 8 * sg, a[1] + ny * 8 * sg], [a2[0] + nx * ext, a2[1] + ny * ext]], { c, w: 1.8, frac: seg(fr, 0, 0.3), alpha: 0.85 });
  bpLine([[b[0] + nx * 8 * sg, b[1] + ny * 8 * sg], [b2[0] + nx * ext, b2[1] + ny * ext]], { c, w: 1.8, frac: seg(fr, 0, 0.3), alpha: 0.85 });
  const f2 = seg(fr, 0.2, 0.75), m1 = [mid[0] - ux * g, mid[1] - uy * g], m2 = [mid[0] + ux * g, mid[1] + uy * g];
  bpLine([a2, m1], { c, w: 2.2, frac: f2 }); bpLine([b2, m2], { c, w: 2.2, frac: f2 });
  if (f2 > 0) { bpArrow(a2[0], a2[1], -ux, -uy, 18, c); bpArrow(b2[0], b2[1], ux, uy, 18, c); }
  let ang = Math.atan2(uy, ux); if (ang > Math.PI / 2 - 1e-6) ang -= Math.PI; if (ang < -Math.PI / 2 - 1e-6) ang += Math.PI;
  bpText(text, mid[0], mid[1], size, c, { align: 'center', rot: ang, frac: seg(fr, 0.7, 1) });
}
// ---- a callout leader: pts[0] is the target (arrowhead), the last segment is horizontal and carries the text above it
function bpLeader(pts, text, o = {}) {
  const fr = clamp(o.frac ?? 1); if (fr <= 0) return;
  const c = o.c || BP.white, n = pts.length, size = o.size ?? 30;
  bpLine(pts, { c, w: 2.2, frac: seg(fr, 0, 0.55) });
  if (fr > 0.02) bpArrow(pts[0][0], pts[0][1], pts[0][0] - pts[1][0], pts[0][1] - pts[1][1], 16, c);
  const lx = Math.min(pts[n - 1][0], pts[n - 2][0]) + 6, ly = pts[n - 1][1];
  bpText(text, lx, ly - size * 0.75, size, c, { frac: seg(fr, 0.5, 1) });
}
// ---- a chain-dashed centre line and a cross mark
const bpChain = (a, b, frac = 1) => bpLine([a, b], { c: BP.white, w: 2, dash: [30, 7, 5, 7], frac, alpha: 0.75 });
function bpCross(x, y, r, frac = 1) { bpSegs([[[x - r, y], [x + r, y]], [[x, y - r], [x, y + r]]], { w: 2, frac, alpha: 0.9 }); }

// ---- a gear in a detail circle (the idle life: it turns a step on every 2s). frac draws it on.
function bpGear(cx, cy, r, teeth, rot, frac = 1) {
  const P = [], p = TAU / teeth, ro = r, rr = r * 0.8;
  for (let i = 0; i < teeth; i++) { const a = rot + i * p; P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr], [cx + Math.cos(a + p * 0.12) * ro, cy + Math.sin(a + p * 0.12) * ro], [cx + Math.cos(a + p * 0.38) * ro, cy + Math.sin(a + p * 0.38) * ro], [cx + Math.cos(a + p * 0.5) * rr, cy + Math.sin(a + p * 0.5) * rr]); }
  bpLine(P, { closed: true, c: BP.white, w: 2.4, frac: seg(frac, 0, 0.7) });
  bpLine(ellipsePts(cx, cy, r * 0.3, r * 0.3, 0, 32), { closed: true, c: BP.white, w: 2.2, frac: seg(frac, 0.5, 1) });
}

// ---- the hero: a drafting compass drawn as outline. (x, y) = the needle tip on the sheet; s = 1 is ~350px tall, 180px open.
// The opening breathes (a few px, on 2s) and the radius reading R### follows it. o: frac (draw-on), hop (0..1 opens wider), key, al
function bpCompass(x, y, s = 1, o = {}) {
  const fr = clamp(o.frac ?? 1), al = o.al ?? 1, key = o.key ?? 'cmp'; if (fr <= 0 || al <= 0 || s <= 0) return;
  const hop = Math.sin(Math.PI * clamp(o.hop ?? 0));
  const sp = 90 * s * (1 + 0.05 * Math.sin(TT * TAU * 0.4 + key.length) + 0.16 * hop), LL = 262 * s, hy = y - Math.sqrt(LL * LL - sp * sp), hx = x;
  SPARK_AT = toScreen(hx, hy);
  ctx.save(); ctx.globalAlpha = al;
  const part = (P, closed, a, b, w = 3.2, extra = {}) => bpLine(P, { closed, frac: seg(fr, a, b), w, c: BP.cyan, ...extra });
  const ground = (P, f) => { if (f <= 0) return; ctx.save(); bpPath(P, true); ctx.fillStyle = BP.ground; ctx.globalAlpha = al * Math.min(1, f * 3); ctx.fill(); ctx.restore(); };
  for (const sd of [-1, 1]) {
    const tx = x + sd * sp, L = Math.hypot(tx - hx, y - hy), u = [(tx - hx) / L, (y - hy) / L], n = [-u[1], u[0]];
    const at = (k, off) => [hx + u[0] * L * k + n[0] * off, hy + u[1] * L * k + n[1] * off], w0 = 11 * s, w1 = 5 * s;
    part([at(0, w0), at(0.8, w1), at(0.8, -w1), at(0, -w0)], true, 0, 0.5);
    if (sd === 1) {   // the pencil leg: a holder box and a sharpened lead
      part([at(0.8, 8 * s), at(0.9, 8 * s), at(0.9, -8 * s), at(0.8, -8 * s)], true, 0.35, 0.6);
      part([at(0.9, 4 * s), [tx, y], at(0.9, -4 * s)], true, 0.5, 0.7);
    } else part([at(0.8, 0), [tx, y]], false, 0.35, 0.6, 2.6);   // the needle
    const T = [];   // dimension ticks along the outer edge, a long one on every fifth
    for (let i = 0; ; i++) { const t = (44 * s + i * 18 * s) / L; if (t > 0.76) break; const hw = w0 + (w1 - w0) * (t / 0.8), len = (i % 5 === 0 ? 15 : 8) * s; T.push([at(t, -sd * hw), at(t, -sd * (hw + len))]); }
    bpSegs(T, { w: 2, c: BP.white, frac: seg(fr, 0.6, 0.9), alpha: 0.9 });
  }
  // hinge (a disc with a pin) and the handle: a stem and a knurled knob
  const hinge = ellipsePts(hx, hy, 18 * s, 18 * s, 0, 40);
  ground(hinge, seg(fr, 0.3, 0.5)); part(hinge, true, 0.3, 0.55);
  part(ellipsePts(hx, hy, 6 * s, 6 * s, 0, 24), true, 0.45, 0.6, 2.6, { c: BP.white });
  part([[hx - 4 * s, hy - 18 * s], [hx - 4 * s, hy - 44 * s], [hx + 4 * s, hy - 44 * s], [hx + 4 * s, hy - 18 * s]], true, 0.5, 0.7);
  const knob = rrectPts(hx - 15 * s, hy - 100 * s, 30 * s, 56 * s, 11 * s, 5);
  ground(knob, seg(fr, 0.6, 0.8)); part(knob, true, 0.55, 0.85);
  const K = []; for (let i = 1; i <= 5; i++) K.push([[hx - 12 * s, hy - (44 + i * 9) * s], [hx + 12 * s, hy - (44 + i * 9) * s]]);
  bpSegs(K, { w: 1.8, c: BP.white, frac: seg(fr, 0.8, 1), alpha: 0.8 });
  // the opening, dimensioned under the tips
  bpCross(x - sp, y, 9 * s + 3, seg(fr, 0.7, 0.9));
  bpDim([x - sp, y], [x + sp, y], { off: 50 * s, text: 'R' + Math.round(2 * sp / s), size: 26, frac: seg(fr, 0.7, 1), c: BP.white });
  ctx.restore();
}

// ---- tag and caption: drawn after the camera at screen size (DEFER), typed from the absolute time t0, faded out before a morph
const bpFade = () => BRIDGES.reduce((k, r) => k * (TT < r.tc ? 1 - seg(TT, r.tc - 0.6, r.tc - 0.35) : 1), 1);
const bpTag = (str, t0) => {
  const f = () => { const a = bpFade(); if (a <= 0) return; const p = ev(t0, 0.5), w = bpText(str, 80, 310, 34, BP.mute, { frac: p, alpha: a, weight: 400 }); bpLine([[80, 332], [80 + w, 332]], { c: BP.mute, w: 2, frac: ev(t0 + 0.4, 0.4), alpha: a * 0.8 }); };
  if (DEFER) DEFER.push(f); else f();
};
const bpCaption = (str, t0, c = BP.white) => {
  const f = () => { const a = bpFade(); if (a > 0) bpText(str, CX, 1440, 52, c, { align: 'center', frac: ev(t0, 0.8), alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
};

// =====================================================================
//  STYLE — the renderer's hooks (styles/README.md)
//    backdrop: blue sheet with the grid, so a morph happens on the drawing board
//    window:   the old / new world seen through the bridge outline, rimmed in a cyan line with radial ticks
//    blob:     the morphing shape: a cyan outline, a dashed offset outline, a centre cross, a dashed bounding box and a live width dimension
// =====================================================================
const STYLE = {
  name: 'blueprint',
  paper: BP.ground,
  ones: false,
  backdrop(c) { fillAll(c); ctx.save(); screen(); bpGrid(1); ctx.restore(); },
  window(P, key, src) {
    ctx.save(); bpPath(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
    bpLine(P, { closed: true, c: BP.cyan, w: 4.5 });
    const n = P.length, c = P.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n], [0, 0]), T = [];
    for (let i = 0; i < 16; i++) { const p = P[Math.floor(i * n / 16)], d = Math.hypot(p[0] - c[0], p[1] - c[1]) || 1, ux = (p[0] - c[0]) / d, uy = (p[1] - c[1]) / d; T.push([[p[0] + ux * 8, p[1] + uy * 8], [p[0] + ux * 26, p[1] + uy * 26]]); }
    bpSegs(T, { w: 2, c: BP.white, alpha: 0.9 });
  },
  blob(P, c, key, u) {
    const bb = bbox(P), cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2;
    bpLine(P, { closed: true, c, w: 5 });
    bpLine(P.map(([x, y]) => [cx + (x - cx) * 0.63, cy + (y - cy) * 0.63]), { closed: true, c: BP.con, w: 2.2, dash: [10, 8], alpha: 0.85 });
    bpChain([bb.x0 - 60, cy], [bb.x1 + 60, cy]); bpChain([cx, bb.y0 - 60], [cx, bb.y1 + 60]);
    bpCross(cx, cy, 14);
    bpDim([bb.x0, cy], [bb.x1, cy], { off: bb.y1 - cy + 60, text: String(Math.round(bb.x1 - bb.x0)), size: 34 });
  },
  hero(x, y, r, o = {}) { bpCompass(x, y + r, r / 175, { key: o.key }); },
  heroColor: BP.cyan,
  heroPts: (x, y, r, n) => rrectPts(x - r * 0.5, y - r, r, r * 2, r * 0.2, 6),
  post() {   // a soft darkening toward the corners, like an old sheet under a lamp
    ctx.save(); screen();
    const g = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.32, W / 2, H * 0.48, H * 0.78);
    g.addColorStop(0, 'rgba(3,12,32,0)'); g.addColorStop(1, 'rgba(3,12,32,0.34)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  },
};
