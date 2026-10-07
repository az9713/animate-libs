// =====================================================================
//  SCENES — katex showcase (style: math, lib: katex). One still stage, one scene; everything is driven by TT.
//  World coordinates 1080x1920. Colour code (one colour per quantity, in every equation):
//    e teal, i pink, pi orange, x blue, a red, b green, c yellow. Operators, digits and the integral stay white.
//  The equations are KaTeX images (made at load, decoded before renderFrame exists, then only drawn with drawImage).
// =====================================================================
const QE = MC.teal, QI = MC.pink, QP = MC.orange, QX = MC.blue, QA = MC.red, QB = MC.green, QC = MC.yellow;
const tc = (c, s) => '\\textcolor{' + c + '}{' + s + '}';
// the LaTeX the viewer sees typed (single backslashes once the JS string is read)
const EQ_SRC = ['e^{i\\pi}+1=0', '\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx=\\sqrt{\\pi}', 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}'];
// the same equations with every quantity in its colour
const EQ_COL = [
  tc(QE, 'e') + '^{' + tc(QI, 'i') + tc(QP, '\\pi') + '}+1=0',
  '\\int_{-\\infty}^{\\infty} ' + tc(QE, 'e') + '^{-' + tc(QX, 'x') + '^2}\\,d' + tc(QX, 'x') + '=\\sqrt{' + tc(QP, '\\pi') + '}',
  tc(QX, 'x') + '=\\frac{-' + tc(QB, 'b') + '\\pm\\sqrt{' + tc(QB, 'b') + '^2-4' + tc(QA, 'a') + tc(QC, 'c') + '}}{2' + tc(QA, 'a') + '}',
];
const KT_SIZE = [150, 110, 120];   // made at about their largest on-screen size: they are only ever drawn smaller
['eu', 'ga', 'qu'].forEach((id, i) => {
  KT.make(id, '\\displaystyle ' + EQ_SRC[i], { size: KT_SIZE[i], color: '#FFFFFF', display: false });
  KT.make(id + 'C', '\\displaystyle ' + EQ_COL[i], { size: KT_SIZE[i], color: '#FFFFFF', display: false });
});
KT.make('logo', '\\KaTeX', { size: 200, color: '#FFFFFF', display: false });

// the three rows: typing starts at t0 and runs dt; w = the width of the image in its row; fin = [cx, cy, w] after it moves; tint = when the colours sweep in
const ROWS = [
  { id: 'eu', src: EQ_SRC[0], t0: 1.0,  dt: 0.5,  w: 520, fin: [CX, 520, 420],  tint: 5.5 },
  { id: 'ga', src: EQ_SRC[1], t0: 2.25, dt: 0.75, w: 800, fin: [CX, 720, 700],  tint: 5.75 },
  { id: 'qu', src: EQ_SRC[2], t0: 3.75, dt: 0.65, w: 700, fin: [CX, 1090, 820], tint: 6.0 },
];
const CHIP_H = 62, SRC_SIZE = 32, ARROW_H = 30;
// the stacked layout of the rows (chip, arrow, image), from the images' own proportions
function rowLayout() {
  let y = 455;
  return ROWS.map((r) => {
    const im = KT.img[r.id], h = r.w * im.height / im.width, chipCy = y + CHIP_H / 2;
    y += CHIP_H + 8; const a0 = y; y += ARROW_H + 8; const cy = y + h / 2; y += h + 26;
    return { chipCy, a0, a1: a0 + ARROW_H, cy, h };
  });
}
// an equation image drawn with drawImage, centred at (cx, cy), width w; p wipes it in from the left behind a bright edge. Returns its box.
function drawEq(id, cx, cy, w, p = 1, edge = null) {
  const im = KT.img[id], h = w * im.height / im.width, x = cx - w / 2, y = cy - h / 2;
  if (p <= 0) return [x, y, w, h];
  ctx.save(); ctx.beginPath(); ctx.rect(x - 6, y - 6, (w + 12) * (p >= 0.999 ? 1 : p), h + 12); ctx.clip();
  ctx.drawImage(im, x, y, w, h); ctx.restore();
  if (edge && p < 0.999) segLine(x + w * p, y - 8, x + w * p, y + h + 8, edge, 4, 1, Math.min(1, (1 - p) * 5));
  return [x, y, w, h];
}

function sceneShowcase() {
  const cu = TIMELINE.cues, MONO = MATH_MONO, lay = rowLayout();
  fillAll(MC.bg);
  // background life: a faint unit grid that sweeps in
  const G = axes2({ at: [CX, 960], u: 140, x: [-3.6, 3.6], y: [-6.8, 6.8], p: 0 });
  numberPlane(G, { p: runS(0.1, 1.2), step: 1, sub: 1, al: 0.6 });

  // 0-1s: the title, then it shrinks to the top-left tag
  const k = keysM([[1.0, 0], [1.6, 1]]);
  drawEq('logo', lerp(CX, 185, k), lerp(800, 330, k), lerp(640, 230, k), runS(-0.1, 0.7), MC.teal);
  {
    const str = 'LaTeX in, math out', sz = lerp(58, 34, k), wBig = textW(str, 58, { font: MONO });
    writeText([{ s: 'LaTeX in, ', c: MC.greyA }, { s: 'math out', c: MC.teal }], lerp(CX - wBig / 2, 70, k), lerp(1010, 410, k), sz, runS(0.35, 0.7), { align: 'left', font: MONO, lag: 1.0 });
  }

  // 1-5s: LaTeX source typed in a code chip, KaTeX turns it into the equation, three times
  const m = runS(cu.move, 0.8), fade = 1 - clamp((TT - cu.move) / 0.35);
  const cw = textW('M', SRC_SIZE, { font: MONO });
  let quBox = null;
  ROWS.forEach((r, i) => {
    const L = lay[i], tEnd = r.t0 + r.dt;
    if (fade > 0) {
      const chipW = cw * r.src.length + 40, cx0 = CX - chipW / 2, ca = clamp((TT - (r.t0 - 0.2)) / 0.2) * fade;
      if (ca > 0) {
        ctx.save(); ctx.globalAlpha = ca; ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.strokeStyle = MC.greyD; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(cx0, L.chipCy - CHIP_H / 2, chipW, CHIP_H, 10); ctx.fill(); ctx.stroke();
        const n = Math.floor(r.src.length * clamp((TT - r.t0) / r.dt)), typing = TT >= r.t0 && TT < tEnd;
        ctx.font = fontM(SRC_SIZE, { font: MONO }); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = MC.greyA;
        if (n > 0) ctx.fillText(r.src.slice(0, n), cx0 + 20, L.chipCy + 10);
        if (TT >= r.t0 - 0.2 && TT < tEnd + 0.4 && (typing || Math.floor(TT * 8) % 2 === 0)) { ctx.fillStyle = MC.teal; ctx.fillRect(cx0 + 20 + n * cw + 1, L.chipCy - 15, cw * 0.55, 32); }
        ctx.restore();
      }
      // the arrow: KT.make turns the source into the image
      const ap = runS(tEnd + 0.05, 0.2);
      mArrow(CX, L.a0, CX, L.a1, MC.teal, 4, ap, fade);
      mText('KT.make', CX + 28, (L.a0 + L.a1) / 2 + 9, 28, { font: MONO, color: MC.teal, align: 'left', alpha: ap * fade });
    }
    // the typeset equation: wiped in, then (5s) moved and scaled to its resting place, then tinted per term
    const cx = lerp(CX, r.fin[0], m), cy = lerp(L.cy, r.fin[1], m), w = lerp(r.w, r.fin[2], m);
    const pulse = r.id === 'qu' ? indicateS((TT - cu.hit) / 0.5, 0.05) : 1;
    const box = drawEq(r.id, cx, cy, w * pulse, runS(tEnd + 0.1, 0.45), MC.teal);
    drawEq(r.id + 'C', cx, cy, w * pulse, runS(r.tint, 0.5), MC.white);
    if (r.id === 'qu') quBox = box;
  });

  // 5s on: the drawImage call, live (the numbers are the box the quadratic's image is drawn into right now)
  const ra = runS(cu.move, 0.5), [bx, by, bw, bh] = quBox, R = Math.round;
  mText([{ s: 'ctx.', c: MC.greyC }, { s: 'drawImage', c: MC.teal }, { s: `(qu, ${R(bx)}, ${R(by)}, ${R(bw)}, ${R(bh)})`, c: MC.greyA }], 70, 1340, 30, { font: MONO, align: 'left', alpha: ra });
  // 6.5-7s (silent): the image's own rectangle is drawn round the quadratic; 7s: it fills and flashes on the hit
  const BX = [[bx - 20, by - 20], [bx + bw + 20, by - 20], [bx + bw + 20, by + bh + 20], [bx - 20, by + bh + 20]];
  const hp = runS(cu.hit, 0.25);
  if (hp > 0) { ctx.save(); ctx.globalAlpha = 0.14 * hp; ctx.fillStyle = MC.yellow; polyPath(BX); ctx.fill(); ctx.restore(); }
  showCreation(BX, runS(cu.box, 0.45), { c: MC.yellow, w: 3 + 3 * thereBack(clamp((TT - cu.hit) / 0.4)), closed: true });
  BX.forEach(([x, y]) => flashAt(x, y, (TT - cu.hit) / 0.45, MC.yellowP, 14, 3));
  mText('KT.img.qu', BX[0][0] + 4, BX[0][1] - 14, 28, { font: MONO, color: MC.yellow, align: 'left', alpha: runS(cu.box + 0.1, 0.4) });
  writeText('real LaTeX, drawn as an image', 70, 1425, 44, runS(cu.hit + 0.05, 0.8), { align: 'left', color: MC.white });

  // the hero reads whatever is being made
  const idx = TT < ROWS[1].t0 ? 0 : TT < ROWS[2].t0 ? 1 : 2;
  const look = TT < 1.0 ? [CX, 800] : TT < cu.move ? [CX, lay[idx].cy] : [CX, 1090];
  piHero(840, 1490, 0.55, { key: 'pi', look, mood: TT >= cu.hit ? (TT < cu.hit + 0.8 ? 'wow' : 'happy') : 'calm', hop: (TT - cu.hit) / 0.5, al: runS(0.9, 0.4) });
}
