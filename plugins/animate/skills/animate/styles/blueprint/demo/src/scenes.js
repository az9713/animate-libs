// =====================================================================
//  SCENES — blueprint demo. World coordinates 1080x1920; time TT on 2s; bpEv(t, d) draws a line on from time t over d seconds.
//  Everything is drawn on in the order a draughtsman would: sheet, title, part, construction, dimensions, callouts.
// =====================================================================
const bpAng = (i) => (45 + 90 * i) * DEG;   // the four bolt holes sit at 45, 135, 225, 315 degrees

// heading: a big mono name, a double underline, a smaller line below
function bpHeading(a, b, t) {
  const w = bpText(a, 80, 450, 80, BP.white, { frac: ev(t, 0.8), weight: 700 });
  bpLine([[80, 500], [80 + w, 500]], { w: 3.5, frac: bpEv(t + 0.7, 0.5) });
  bpLine([[80, 510], [80 + w, 510]], { w: 1.6, frac: bpEv(t + 0.85, 0.5), alpha: 0.7 });
  bpText(b, 80, 556, 36, BP.mute, { frac: ev(t + 0.9, 0.6), weight: 400 });
}

// background life, the same on both sheets: a detail circle with a gear that turns a step on every 2s, a scale bar, an axis triad
function bpBackground(f) {
  const gx = 840, gy = 560;
  bpLine(ellipsePts(gx, gy, 78, 78, 0, 64), { closed: true, w: 2.4, frac: seg(f, 0, 0.6) });
  bpGear(gx, gy, 50, 12, TT * 0.7, seg(f, 0.2, 1));
  bpText('DETAIL B  2:1', gx, gy + 112, 24, BP.mute, { align: 'center', weight: 400, frac: seg(f, 0.6, 1) });
  const T = [];
  for (let i = 0; i <= 15; i++) T.push([[90 + i * 20, 1320], [90 + i * 20, 1320 - (i % 5 === 0 ? 24 : 12)]]);
  bpLine([[90, 1320], [390, 1320]], { w: 2.4, frac: seg(f, 0.1, 0.7) });
  bpSegs(T, { w: 2, frac: seg(f, 0.3, 0.9), alpha: 0.9 });
  ['0', '100', '200', '300'].forEach((s, i) => bpText(s, 90 + i * 100, 1346, 22, BP.mute, { align: 'center', weight: 400, frac: seg(f, 0.7, 1) }));
  bpLine([[170, 1250], [100, 1250], [100, 1180]], { w: 2.4, frac: seg(f, 0.3, 0.8) });
  if (f > 0.8) { bpArrow(170, 1250, 1, 0, 14, BP.white); bpArrow(100, 1180, 0, -1, 14, BP.white); }
  bpText('X', 184, 1250, 22, BP.mute, { frac: seg(f, 0.8, 1), weight: 400 });
  bpText('Y', 100, 1160, 22, BP.mute, { align: 'center', frac: seg(f, 0.8, 1), weight: 400 });
}

// the four bolt holes: a centre mark and a circle each, drawn on one after another from time t
function bpHoles(pts, t, fixed) {
  pts.forEach(([hx, hy], i) => {
    const f = fixed ? 1 : bpEv(t + 0.2 + i * 0.12, 0.3);
    bpLine(ellipsePts(hx, hy, 20, 20, 0, 32), { closed: true, c: BP.cyan, w: 3.5, frac: f });
    bpCross(hx, hy, 12, f);
  });
}

function sceneFlange() {
  const cu = TIMELINE.cues, [sx, sy] = SH, R = SH_R;
  bpGround({ frame: bpEv(cu.frame, 1.0), block: bpEv(0.4, 0.8), fill: bpEv(1.0, 0.8), name: 'FLANGE ASSY', sheet: '1/2', rev: 'A' });
  bpTag('01 / PLAN VIEW', 0.2);
  bpHeading('FLANGE A-1', 'CIRCULAR / STEEL', cu.title);
  bpBackground(bpEv(1.2, 0.9));
  // the part: its outline, the construction lines, the bolt circle and holes
  bpLine(ellipsePts(sx, sy, R, R, 0, 96), { closed: true, c: BP.cyan, w: 5, frac: bpEv(cu.shape, 1.0) });
  bpChain([sx - R - 70, sy], [sx + R + 70, sy], bpEv(cu.centre, 0.6));
  bpChain([sx, sy - R - 70], [sx, sy + R + 70], bpEv(cu.centre + 0.15, 0.6));
  bpCross(sx, sy, 14, bpEv(cu.centre + 0.5, 0.2));
  bpLine(ellipsePts(sx, sy, 120, 120, 0, 72), { closed: true, c: BP.con, w: 2.2, dash: [10, 8], frac: bpEv(cu.holes, 0.5), alpha: 0.85 });
  const holes = [0, 1, 2, 3].map((i) => [sx + Math.cos(bpAng(i)) * 120, sy + Math.sin(bpAng(i)) * 120]);
  bpHoles(holes, cu.holes + 0.3);
  // dimension and callout
  bpDim([sx - R, sy], [sx + R, sy], { off: R + 60, text: 'Ø380', size: 34, frac: bpEv(cu.dim, 1.0) });
  const h = holes[3];
  bpLeader([[h[0] + 14, h[1] - 14], [h[0] + 95, h[1] - 95], [930, h[1] - 95]], '4× Ø40 THRU', { frac: bpEv(cu.leader, 0.7) });
  bpCompass(845, 1300, 1, { key: 'cmp', frac: bpEv(cu.hero, 1.4), hop: (TT - cu.react) / 0.5 });
  bpCaption('flange: Ø380, four holes', cu.cap);
}

function sceneBracket() {
  const cu = TIMELINE.cues, [sx, sy] = SH, R = SH_R;
  bpGround({ name: 'BRACKET ASSY', sheet: '2/2', rev: 'B', fill: bpEv(4.9, 0.8) });
  bpTag('02 / REVISED', cu.title2 - 0.05);
  bpHeading('BRACKET A-2', 'SQUARE / STEEL', cu.title2);
  bpBackground(1);
  // the part: the square outline is already on the sheet (the window opens onto it); the rest is drawn on
  bpLine(rrectPts(sx - R, sy - R, R * 2, R * 2, 40, 12), { closed: true, c: BP.cyan, w: 5 });
  bpChain([sx - R - 70, sy], [sx + R + 70, sy]); bpChain([sx, sy - R - 70], [sx, sy + R + 70]);
  bpCross(sx, sy, 14);
  bpLine(rrectPts(sx - 120, sy - 120, 240, 240, 20, 8), { closed: true, c: BP.con, w: 2.2, dash: [10, 8], frac: bpEv(cu.holes2, 0.5), alpha: 0.85 });
  const holes = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [sx + a * 120, sy + b * 120]);
  bpHoles(holes, cu.holes2 + 0.3);
  // dimensions: width below, height on the left; callouts for the corner radius and the holes
  bpDim([sx - R, sy + R], [sx + R, sy + R], { off: 60, text: '380', size: 34, frac: bpEv(cu.dimW, 0.9) });
  bpDim([sx - R, sy - R], [sx - R, sy + R], { off: 70, text: '380', size: 34, frac: bpEv(cu.dimH, 0.9) });
  bpLeader([[sx - R + 40 - 28.3, sy - R + 40 - 28.3], [270, sy - R - 40], [150, sy - R - 40]], 'R40', { frac: bpEv(cu.leader2, 0.6) });
  const h = holes[1];
  bpLeader([[h[0] + 14, h[1] - 14], [h[0] + 80, h[1] - 80], [930, h[1] - 80]], '4× Ø40 THRU', { frac: bpEv(cu.leader2 + 0.5, 0.7) });
  bpCompass(845, 1300, 1, { key: 'cmp', hop: (TT - cu.react2) / 0.5 });
  bpCaption('rev B: now a 380 square', cu.cap2);
}
