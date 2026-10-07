// =====================================================================
//  SCENES — GLSL showcase. One scene, drawn on a 216x384 pixel grid (5 px per pixel); TT on 2s.
//  Layout in pixels: code panel (13,49)-(184,147), readout bar (13,149)-(184,167), shader grid 128x128 at (32,170).
//  On screen the grid is 640 px square at (160,850): 16 cells of 40 px, 32 of 20, 64 of 10, 128 of 5.
// =====================================================================
const Q = PAL16;

// The real shader source. The panel shows these exact lines; GLSL.make() compiles their join.
const SRC_LINES = [
  'precision highp float;',
  'uniform float u_t;',
  'varying vec2 v;',
  'void main() {',
  '  vec2 p = v*2.-1.;',
  '  float r = length(p);',
  '  float w = sin(r*30.-u_t);',
  '  w += sin(p.x*5.+u_t);',
  '  vec3 k = vec3(0,2,4);',
  '  vec3 c = .5+.5*cos(k+w);',
  '  gl_FragColor = vec4(c,1.);',
  '}',
];
const FRAG = SRC_LINES.join('\n');
const FIRST_BODY = 4, LAST_BODY = 10;   // the lines that run for every pixel
// one shader per resolution: the same source, the canvas size is the only difference
const RESOLUTIONS = [16, 32, 64, 128];
const SH = {};
for (const n of RESOLUTIONS) SH[n] = GLSL.make(FRAG, n);

// screen geometry of the shader grid
const GX = 160, GY = 850, GS = 640;
const phaseAt = (t) => 0.8 + 3.0 * Math.max(0, t - T_SCAN_END);   // u_t: frozen while the first grid is filled, then it flows
const resAt = (t) => (t >= T_128 ? 128 : t >= T_64 ? 64 : t >= T_32 ? 32 : 16);

// scratch 2D canvases to read one shader pixel back (the readout shows the real value)
const SCR = {};
function readPixel(cv, n, i, j) {
  if (!SCR[n]) { const c = document.createElement('canvas'); c.width = c.height = n; SCR[n] = c.getContext('2d', { willReadFrequently: true }); }
  SCR[n].drawImage(cv, 0, 0);
  const d = SCR[n].getImageData(i, j, 1, 1).data;
  return [d[0], d[1], d[2]];
}
const hex2 = (v) => v.toString(16).padStart(2, '0').toUpperCase();
const pad2 = (v) => String(v).padStart(2, '0');

// The kit's 5x7 font has capitals only and GLSL is case-sensitive, so the code panel brings its own lower case
// (same 5x7 cell, x-height 5 on rows 2-6, g p q y shaped to fit inside it). Digits, capitals and symbols come from FONT5.
const LOWER_ROWS = {
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'], c: ['.....', '.....', '.###.', '#....', '#....', '#...#', '.###.'],
  d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'], e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
  f: ['..##.', '.#...', '####.', '.#...', '.#...', '.#...', '.#...'], g: ['.....', '.....', '.####', '#...#', '.####', '....#', '.###.'],
  h: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#'], i: ['..#..', '.....', '.##..', '..#..', '..#..', '..#..', '.###.'],
  l: ['.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'], m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#...#', '#...#'],
  n: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '#...#'], o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  p: ['.....', '.....', '####.', '#...#', '####.', '#....', '#....'], r: ['.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'],
  s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'], t: ['.#...', '.#...', '####.', '.#...', '.#...', '.#..#', '..##.'],
  u: ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#'], v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  w: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'], x: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  y: ['.....', '.....', '#...#', '#...#', '.####', '....#', '.###.'],
  b: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'], j: ['...#.', '.....', '..##.', '...#.', '...#.', '#..#.', '.##..'],
  k: ['#....', '#....', '#..#.', '#.#..', '##...', '#.#..', '#..#.'], q: ['.....', '.....', '.####', '#...#', '.####', '....#', '....#'],
  z: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'],
  ';': ['.....', '.....', '..#..', '.....', '.....', '..#..', '.#...'],
  '{': ['..##.', '..#..', '..#..', '.##..', '..#..', '..#..', '..##.'], '}': ['.##..', '..#..', '..#..', '..##.', '..#..', '..#..', '.##..'],
};
function codeText(str, x, y, c) {
  for (let k = 0; k < str.length; k++) {
    const ch = str[k], low = LOWER_ROWS[ch], gl = FONT5[ch] || FONT5[' '];
    for (let r = 0; r < 7; r++) for (let b = 0; b < 5; b++) {
      if (low ? low[r][b] === '#' : gl[r] & (16 >> b)) pset(x + k * 6 + b, y + r, c);
    }
  }
}

// how many cells of the 16x16 grid the function has filled (starts slow so single cells are seen)
function scanCount(t) {
  if (t < T_CODE) return 0;
  if (t >= T_SCAN_END) return 256;
  const u = (t - T_CODE) / (T_SCAN_END - T_CODE);
  return Math.min(255, Math.floor(256 * Math.pow(u, 1.5)));
}

function drawBackground() {
  lowres(ERA_RES[0], () => {
    pgrad(0, 0, 216, 384, [Q.ink, Q.ink, Q.night]);
    for (let i = 0; i < 46; i++) {   // stars blink on the boil
      const R = RNG('gs', i), x = R.i(1, 214), y = R.i(1, 382);
      if ((B + i * 5) % 9 < 3) continue;
      if (i % 7 === 0 && (B + i) % 6 < 3) sprite(SPR.twinkle, { a: Q.sky, b: Q.white }, x - 1, y - 1);
      else pset(x, y, i % 3 ? Q.slate : Q.grey);
    }
  });
}

function sceneTitle() {
  const sc = 7, tw = pixTextW('GLSL', sc), x0 = Math.round(CX / 5 - tw / 2), y0 = 130;
  const sub = 'ONE FUNCTION, EVERY PIXEL', n = Math.floor(clamp(TT / 0.5) * sub.length + 1e-6);
  lowres(ERA_RES[0], () => {
    pixText('GLSL', x0 + 2, y0 + 2, Q.purple, { scale: sc });   // drop shadow
    pixText(sub, Math.round(CX / 5 - pixTextW(sub) / 2), 192, Q.white, { count: n, cursor: Q.yellow });
    // twinkles around the title
    [[x0 - 8, y0 - 6], [x0 + tw + 3, y0 + 4], [x0 + 20, y0 + 58], [x0 + tw - 14, y0 - 10]].forEach(([sx, sy], k) => { if ((B + k * 2) % 6 < 4) sprite(SPR.spark, { a: Q.white, b: Q.yellow }, sx, sy); });
  });
  // the letters are filled by the shader itself: white glyphs, then the 16x16 shader output kept only where the glyphs are
  const cv = SH[16].draw({ u_t: 0.8 + TT * 3 });
  lowres(ERA_RES[0], () => {
    pixText('GLSL', x0, y0, Q.white, { scale: sc });
    ctx.globalCompositeOperation = 'source-in';
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cv, x0 - 8, y0 - 55, 176, 176);   // 16 cells x 11 px each, covering the glyphs
    ctx.globalCompositeOperation = 'source-over';
  });
}

function drawCodePanel(lit, flash, scanning, cur, calls, n) {
  lowres(ERA_RES[0], () => {
    // the source
    pixBox(13, 49, 172, 99, { bg: Q.ink, edge: Q.slate });
    SRC_LINES.forEach((line, i) => {
      const y = 50 + i * 8, on = lit.includes(i);
      if (on) prect(14, y - 1, 170, 8, Q.yellow);
      codeText(line, 16, y, on ? Q.ink : i < FIRST_BODY ? Q.sky : i > LAST_BODY ? Q.sky : Q.white);
    });
    // the readout bar: row 1 = what the function returned for the cell it is on; row 2 = how many calls that is
    pixBox(13, 149, 172, 19, { bg: Q.ink, edge: Q.slate });
    if (TT >= T_PAYOFF) pixText('SAME CODE. EVERY PIXEL.', 16, 151, flash ? Q.white : Q.orange);
    else if (scanning) {
      const i = cur % 16, j = Math.floor(cur / 16), px = readPixel(SH[16].last, 16, i, j);
      pixText('X' + pad2(i) + ' Y' + pad2(j) + ' >', 16, 151, Q.white);
      prect(72, 151, 8, 7, '#' + px.map(hex2).join(''));
      pixText('#' + px.map(hex2).join(''), 83, 151, Q.white);
    } else pixText('F(X,Y,T) > COLOR', 16, 151, Q.white);
    pixText(n + 'X' + n + ' = ' + calls + ' CALLS', 16, 159, Q.yellow);
    // the frame round the grid
    prect(31, 169, 130, 130, flash ? Q.white : Q.slate);
    prect(32, 170, 128, 128, Q.ink);
  });
}

function drawField(n, count) {
  const cell = GS / n;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = Q.night; ctx.fillRect(GX, GY, GS, GS);
  const cv = SH[n].draw({ u_t: phaseAt(TT) });
  SH[n].last = cv;
  if (count == null || count >= n * n) ctx.drawImage(cv, 0, 0, n, n, GX, GY, GS, GS);
  else {   // cells filled so far, row by row
    const rows = Math.floor(count / n), part = count % n;
    if (rows > 0) ctx.drawImage(cv, 0, 0, n, rows, GX, GY, GS, rows * cell);
    if (part > 0) ctx.drawImage(cv, 0, rows, part, 1, GX, GY + rows * cell, part * cell, cell);
  }
  // cell lines on the coarse grids only; they vanish as the cells shrink
  const lw = n === 16 ? 3 : n === 32 ? 2 : 0;
  if (lw) {
    ctx.fillStyle = Q.ink;
    for (let k = 0; k <= n; k++) {
      const o = Math.round(k * cell) - Math.floor(lw / 2);
      ctx.fillRect(GX + Math.max(0, Math.min(GS - lw, o)), GY, lw, GS);
      ctx.fillRect(GX, GY + Math.max(0, Math.min(GS - lw, o)), GS, lw);
    }
  }
  ctx.restore();
}

function drawCursor(cur) {   // a white frame round the cell the function is on
  const i = cur % 16, j = Math.floor(cur / 16), x = GX + i * 40, y = GY + j * 40;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = Q.white;
  ctx.fillRect(x, y, 40, 5); ctx.fillRect(x, y + 35, 40, 5); ctx.fillRect(x, y, 5, 40); ctx.fillRect(x + 35, y, 5, 40);
  ctx.restore();
}

function sceneShader() {
  drawBackground();
  if (TT < T_CODE) { sceneTitle(); return; }
  const n = resAt(TT), scanning = TT < T_SCAN_END, count = scanning ? scanCount(TT) : null;
  const justNow = (t0) => TT >= t0 && TT < t0 + 2 / FPS - 1e-6;   // the first boil after a refinement or the hit
  const flash = justNow(T_32) || justNow(T_64) || justNow(T_128) || justNow(T_PAYOFF);
  // the lines that are "running": one per boil, in order; every body line on a refinement
  const body = [];
  for (let i = FIRST_BODY; i <= LAST_BODY; i++) body.push(i);
  const lit = flash || justNow(T_CODE) ? body : [FIRST_BODY + (B % body.length)];
  const calls = scanning ? count : n * n;
  // draw the field first so the panel can read the shader's pixel back
  drawField(n, count);
  drawCodePanel(lit, flash, scanning, count ?? 0, calls, n);
  drawField(n, count);   // the panel's frame covers the grid edges; draw the exact same output again on top
  if (scanning && count < 256) drawCursor(count);
  // payoff sparkles at the corners of the grid
  if (TT >= T_PAYOFF) lowres(ERA_RES[0], () => {
    [[27, 165], [162, 165], [27, 295], [162, 295]].forEach(([sx, sy], k) => { if ((B + k) % 4 < 3) sprite(SPR.spark, { a: Q.white, b: Q.yellow }, sx - 2, sy - 2); });
  });
}
