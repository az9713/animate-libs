// =====================================================================
//  ERAS, RESOLUTIONS, CAMERAS, BRIDGES — GLSL showcase (read by kit/morph.js and the pixel STYLE hooks)
//  One era at 216x384 (5 px per pixel). The shader grid is drawn on top of it at 16, 32, 64 and 128 cells.
// =====================================================================
const ERA_BG = ['#232a4e'];
const ERA_RES = [[216, 384]];
const ERA_POST = [{ pal: PAL16, vignette: 0.3 }];
function pieceCam() { return null; }
const BRIDGES = [];
