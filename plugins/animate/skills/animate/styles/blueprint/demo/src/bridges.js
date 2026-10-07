// =====================================================================
//  ERAS, BRIDGES — blueprint demo (read by kit/morph.js). No camera moves: the sheet holds still.
// =====================================================================
const ERA_BG = [BP.ground, BP.ground];
const SH = [CX, 1000], SH_R = 190;   // the part's centre and half-size: a circle on sheet 1, a rounded square on sheet 2
const BRIDGES = [
  { tc: 4.0, A: () => ({ P: ellipsePts(SH[0], SH[1], SH_R, SH_R, 0, 64), c: BP.cyan }), B: () => ({ P: rrectPts(SH[0] - SH_R, SH[1] - SH_R, SH_R * 2, SH_R * 2, 40, 12), c: BP.cyan }) },   // the flange's circle -> the bracket's square
];
