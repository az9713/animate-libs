// =====================================================================
//  ERAS, BRIDGES — terminal demo (read by kit/morph.js). No camera moves: a terminal screen holds still.
// =====================================================================
const ERA_BG = [TM.ground, TM.ground];
const SH = [CX, 980];   // the viewport pane's centre: 640x560 in era 1, 720x480 in era 2 (similar proportions, so the morph stays clean)
const PANE_A = { w: 640, h: 560 }, PANE_B = { w: 720, h: 480 };
const BRIDGES = [
  { tc: 4.0, A: () => ({ P: rrectPts(SH[0] - PANE_A.w / 2, SH[1] - PANE_A.h / 2, PANE_A.w, PANE_A.h, 10, 8), c: TM.panel }), B: () => ({ P: rrectPts(SH[0] - PANE_B.w / 2, SH[1] - PANE_B.h / 2, PANE_B.w, PANE_B.h, 10, 8), c: TM.panel2 }) },
];
