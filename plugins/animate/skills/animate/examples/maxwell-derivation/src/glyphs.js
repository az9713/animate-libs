// =====================================================================
//  GLYPHS — term-matched equation morphs (the TransformMatchingTex idea) over MathJax SVG (MJ.svg[id]).
//  eqParse(id) -> { w, h, items } : every <path>/<rect> of the equation with its pixel-space matrix.
//  eqMatch(a, b) -> pairs of item indices with the same glyph outline, in order (longest common subsequence).
//  eqDraw(idA, idB, p, x, y, o): p 0..1 morphs A into B; matched glyphs slide, the rest fade. idB omitted = just A.
//  The whole equation goes through chLayer(), so it is eroded like the rest of the chalk.
// =====================================================================
const EQ = {};
function eqParse(id) {
  if (EQ[id]) return EQ[id];
  const svg = new DOMParser().parseFromString(MJ.svg[id], 'image/svg+xml').documentElement;
  const vb = svg.getAttribute('viewBox').split(/[ ,]+/).map(Number), w = parseFloat(svg.getAttribute('width')), h = parseFloat(svg.getAttribute('height'));
  const sx = w / vb[2], sy = h / vb[3];
  const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  const parse = (s) => { let m = [1, 0, 0, 1, 0, 0]; for (const [, f, a] of (s || '').matchAll(/(\w+)\(([^)]*)\)/g)) { const v = a.split(/[ ,]+/).filter(Boolean).map(Number); m = mul(m, f === 'translate' ? [1, 0, 0, 1, v[0], v[1] || 0] : f === 'scale' ? [v[0], 0, 0, v[1] ?? v[0], 0, 0] : f === 'matrix' ? v : [1, 0, 0, 1, 0, 0]); } return m; };
  const items = [];
  const walk = (el, m) => {
    for (const c of el.children) {
      const mm = mul(m, parse(c.getAttribute('transform')));
      if (c.tagName === 'path') items.push({ k: c.getAttribute('d'), d: c.getAttribute('d'), m: mm });
      else if (c.tagName === 'rect') items.push({ k: 'r' + Math.round(+c.getAttribute('width')) + 'x' + Math.round(+c.getAttribute('height')), rect: [+c.getAttribute('x'), +c.getAttribute('y'), +c.getAttribute('width'), +c.getAttribute('height')], m: mm });
      else walk(c, mm);
    }
  };
  walk(svg, [sx, 0, 0, sy, -vb[0] * sx, -vb[1] * sy]);
  for (const it of items) if (it.d) it.path = new Path2D(it.d);
  return (EQ[id] = { w, h, items });
}
const EQM = {};
function eqMatch(a, b) {
  const ky = a + '>' + b; if (EQM[ky]) return EQM[ky];
  const A = eqParse(a).items, Bi = eqParse(b).items, n = A.length, m = Bi.length;
  const L = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i].k === Bi[j].k ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const pairs = []; let i = 0, j = 0;
  while (i < n && j < m) { if (A[i].k === Bi[j].k) { pairs.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return (EQM[ky] = pairs);
}
function eqPaint(it, m, alpha, color) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  if (it.path) ctx.fill(it.path); else ctx.fillRect(...it.rect);
  ctx.restore();
}
function eqDraw(a, b, p, x, y, o = {}) {
  const frac = clamp(o.frac ?? 1); if (frac <= 0) return;
  const A = eqParse(a), Bq = b ? eqParse(b) : null, e = Bq ? EZ.io(clamp(p)) : 0;
  const LW = Math.ceil(Math.max(A.w, Bq ? Bq.w : 0)) + 40, LH = Math.ceil(Math.max(A.h, Bq ? Bq.h : 0)) + 40, color = o.c ?? CB.white;
  const oa = [(LW - A.w) / 2, (LH - A.h) / 2], ob = Bq ? [(LW - Bq.w) / 2, (LH - Bq.h) / 2] : null;
  const cv = chLayer(LW, LH, o.key ?? ('eq' + a), () => {
    ctx.globalAlpha = o.alpha ?? 0.96;
    if (frac < 1) { ctx.beginPath(); ctx.rect(0, 0, LW * frac, LH); ctx.clip(); }
    const T = (m, off) => [m[0], m[1], m[2], m[3], m[4] + off[0], m[5] + off[1]];
    if (!Bq || e <= 0) { for (const it of A.items) eqPaint(it, T(it.m, oa), 1, color); return; }
    if (e >= 1) { for (const it of Bq.items) eqPaint(it, T(it.m, ob), 1, color); return; }
    const pairs = eqMatch(a, b), ma = new Set(pairs.map((q) => q[0])), mb = new Set(pairs.map((q) => q[1]));
    A.items.forEach((it, i) => { if (!ma.has(i)) eqPaint(it, T(it.m, oa), 1 - clamp(e * 2.2), color); });
    Bq.items.forEach((it, j) => { if (!mb.has(j)) eqPaint(it, T(it.m, ob), clamp((e - 0.55) * 2.2), color); });
    for (const [i, j] of pairs) { const u = A.items[i].m, v = Bq.items[j].m; eqPaint(A.items[i], T(u.map((s, k) => lerp(s, v[k], e)), [lerp(oa[0], ob[0], e), lerp(oa[1], ob[1], e)]), 1, color); }
  }, { amt: o.erode ?? 0.7 });
  ctx.drawImage(cv, x - LW / 2, y - LH / 2);
}
