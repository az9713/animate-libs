// =====================================================================
//  ERAS, BRIDGES — chalkboard demo (read by kit/morph.js). No camera moves: the board holds still.
// =====================================================================
const ERA_BG = [CB.board, CB.board];
const SH = [CX, 1000], SH_R = 190;   // the shape's centre and radius: a circle in era 1, a rounded square in era 2
const BRIDGES = [
  { tc: 3.0, A: () => ({ P: ellipsePts(SH[0], SH[1], SH_R, SH_R, 0, 64), c: CB.yellow }), B: () => ({ P: rrectPts(SH[0] - SH_R, SH[1] - SH_R, SH_R * 2, SH_R * 2, 40, 12), c: CB.blue }) },   // the charge's circle -> the current's block
];
