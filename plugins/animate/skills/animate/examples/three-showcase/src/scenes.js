// =====================================================================
//  SCENES — three.js showcase (isometric style). One split frame.
//  Top: the isometric line-art cube from the style kit (flat, no light). Bottom: the same cube as a real three.js mesh
//  (MeshStandardMaterial), lit by a directional light that orbits; then the camera orbits (perspective), then a torus
//  knot swings round it (depth). The 3D pose, light and camera are functions of TT only (never accumulated).
//  Content stays inside x 60-940, y 250-1500 (the 9:16 safe zone).
// =====================================================================
const cu = TIMELINE.cues;
const PX = 60, PW = 880;                         // both panels: x 60-940
const TOPF = { y: 415, h: 460 };                 // flat panel  y 415-875
const BOTF = { y: 895, h: 480 };                 // 3D panel    y 895-1375
const GW = PW, GH = BOTF.h;                      // the WebGL canvas fills the 3D panel 1:1
const LROW_Y = 1440;                             // the label row under the panels
const CUBE = 2.1;                                // side of the 3D cube, world units
const LIGHT_R = 2.5, LIGHT_H = 1.3;              // the directional light's orbit
const KNOT_R = 1.45;                             // the torus knot's orbit round the cube
const HALF_H = 2.75;                             // world half-height shown at the cube's depth (dolly zoom keeps it)

// ---- three.js. libs/three.js has no BoxGeometry, but IcosahedronGeometry extends PolyhedronGeometry, so the cube is a
// PolyhedronGeometry with 8 cube corners (detail 0 = flat faces; the radius puts the corners at +-CUBE/2).
const PolyGeo = Object.getPrototypeOf(THREE.IcosahedronGeometry);
const T3 = (() => {
  const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH;
  const rd = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); rd.setClearColor(0x000000, 0); rd.setSize(GW, GH, false);
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(22, GW / GH, 0.1, 60);
  const V = [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1];
  const I = [4, 5, 6, 4, 6, 7, 0, 3, 2, 0, 2, 1, 1, 2, 6, 1, 6, 5, 0, 4, 7, 0, 7, 3, 3, 7, 6, 3, 6, 2, 0, 1, 5, 0, 5, 4];
  const cube = new THREE.Mesh(new PolyGeo(V, I, CUBE * Math.sqrt(3) / 2, 0), new THREE.MeshStandardMaterial({ color: 0x7f9cf5, roughness: 0.55, metalness: 0 }));
  cube.rotation.y = Math.PI / 4;
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.55, 0.19, 140, 18, 2, 3), new THREE.MeshStandardMaterial({ color: 0xf08a5d, roughness: 0.4, metalness: 0.1 }));
  const amb = new THREE.AmbientLight(0xffffff, 0.3), dl = new THREE.DirectionalLight(0xffffff, 3.2);
  sc.add(cube, knot, amb, dl);

  const lightAz = (t) => 2.2 + 2.24 * (clamp(t, cu.panels, 3.8) - cu.panels) + 0.9 * Math.max(0, t - 3.8);   // one turn in 2.8 s, then slower
  const knotAz = (t) => 0.9 + 2.6 * (t - cu.depth);
  // the camera: a dolly zoom (narrow lens far away -> wide lens close) with an orbit, all from t
  const camAt = (t) => {
    const u = EZ.io(seg(t, cu.persp, 5.2)), az = u * 1.0 + 0.16 * Math.max(0, t - 5.2);
    const el = lerp(0.5236, 0.8, u), fov = lerp(22, 42, u), D = HALF_H / Math.tan(fov * Math.PI / 360);
    return { az, el, fov, D };
  };
  function proj(x, y, z) {   // world point -> pixel in the WebGL canvas, plus its view depth (more negative = farther)
    const m = cam.matrixWorldInverse.elements, p = cam.projectionMatrix.elements;
    const vx = m[0] * x + m[4] * y + m[8] * z + m[12], vy = m[1] * x + m[5] * y + m[9] * z + m[13], vz = m[2] * x + m[6] * y + m[10] * z + m[14];
    const cx = p[0] * vx + p[4] * vy + p[8] * vz + p[12], cy = p[1] * vx + p[5] * vy + p[9] * vz + p[13], cw = p[3] * vx + p[7] * vy + p[11] * vz + p[15];
    return [(cx / cw * 0.5 + 0.5) * GW, (0.5 - cy / cw * 0.5) * GH, vz];
  }
  function draw(t) {
    const c = camAt(t), la = lightAz(t);
    cam.fov = c.fov; cam.updateProjectionMatrix();
    cam.position.set(c.D * Math.sin(c.az) * Math.cos(c.el), c.D * Math.sin(c.el), c.D * Math.cos(c.az) * Math.cos(c.el)); cam.lookAt(0, 0, 0);
    dl.position.set(Math.cos(la) * LIGHT_R, LIGHT_H, Math.sin(la) * LIGHT_R);
    cube.scale.setScalar(Math.max(0.001, spring(t, cu.panels + 0.1, { k: 150, damp: 0.6 })));
    const ks = Math.max(0.001, spring(t, cu.depth - 0.1, { k: 130, damp: 0.55 }) * (1 + 0.22 * kick(t, cu.hit, { k: 200, damp: 0.3 })));
    knot.visible = t > cu.depth - 0.1; knot.scale.setScalar(ks);
    const ka = knotAz(t);
    knot.position.set(Math.cos(ka) * KNOT_R, 0.15, Math.sin(ka) * KNOT_R); knot.rotation.set(t * 1.1, t * 1.7, 0);
    rd.render(sc, cam);
    return { cv, proj, la, cube, c };
  }
  return { draw, LR: LIGHT_R, LH: LIGHT_H };
})();

// ---- the flat half: the isometric kit's cube, drawn with hairlines (no light, no shading)
const FLAT_S = 180;
function flatCube() {
  const cx = PX + PW / 2, drop = (1 - spring(TT, cu.panels, { k: 150, damp: 0.62 })) * 330;
  setIso({ ox: cx, oy: 756, u: 1 });
  ctx.save(); polyPath(rrectPts(PX, TOPF.y, PW, TOPF.h, 28, 6), true); ctx.clip();
  // the vertical edges extended: in a flat drawing they stay parallel for ever
  const g = ev(cu.persp, 0.3) * (1 - ev(5.4, 0.4));
  if (g > 0.01) {
    ctx.globalAlpha = g;
    for (const [x, y] of [[-FLAT_S / 2, FLAT_S / 2], [FLAT_S / 2, FLAT_S / 2], [FLAT_S / 2, -FLAT_S / 2]]) {
      const a = iso(x, y, FLAT_S + drop), b = iso(x, y, drop);
      polyPath([[a[0], a[1] - 30], [b[0], b[1] + 90]], false); hair(PAL.inner); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  isoBox(-FLAT_S / 2, -FLAT_S / 2, drop, FLAT_S, FLAT_S, FLAT_S, { r: 0 });
  ctx.restore();
}

// ---- the 3D half: overlays computed from the same camera and light the mesh was rendered with
function realCube() {
  const X0 = PX, Y0 = BOTF.y, k = spring(TT, cu.panels + 0.1, { k: 150, damp: 0.6 });
  if (k < 0.005) return;
  const R = T3.draw(TT), P = (x, y, z) => { const q = R.proj(x, y, z); return [X0 + q[0], Y0 + q[1], q[2]]; };
  const mw = R.cube.matrixWorld.elements, h = CUBE / 2, vz0 = P(0, 0, 0)[2];
  const vis = clamp(k);
  ctx.save(); polyPath(rrectPts(X0, Y0, GW, GH, 28, 6), true); ctx.clip();
  // vertical edges of the cube extended: in perspective they converge
  const gp = ev(cu.persp + 0.1, 0.3) * (1 - ev(5.5, 0.4));
  if (gp > 0.01) {
    ctx.globalAlpha = gp;
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const W3 = (y) => { const x = sx * h, z = sz * h; return P(mw[0] * x + mw[4] * y + mw[8] * z + mw[12], mw[1] * x + mw[5] * y + mw[9] * z + mw[13], mw[2] * x + mw[6] * y + mw[10] * z + mw[14]); };
      const a = W3(h), b = W3(-h), dx = a[0] - b[0], dy = a[1] - b[1];
      polyPath([[a[0] + dx * 0.2, a[1] + dy * 0.2], [b[0] - dx * 1.5, b[1] - dy * 1.5]], false); hair(PAL.inner); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // the light's orbit ring: the half behind the cube is drawn first (the mesh then hides it), the half in front after
  const ringA = ev(cu.panels, 0.3) * (1 - 0.55 * ev(3.9, 0.4)), N = 72, ring = [];
  for (let i = 0; i <= N; i++) { const a = i / N * TAU; ring.push(P(Math.cos(a) * LIGHT_R, LIGHT_H, Math.sin(a) * LIGHT_R)); }
  const strokeRing = (far) => {
    ctx.globalAlpha = ringA * 0.8; hair(PAL.edge);
    for (let i = 0; i < N; i++) { const a = ring[i], b = ring[i + 1]; if (((a[2] + b[2]) / 2 < vz0) !== far) continue; polyPath([a, b], false); ctx.stroke(); }
    ctx.globalAlpha = 1;
  };
  const lp = P(Math.cos(R.la) * LIGHT_R, LIGHT_H, Math.sin(R.la) * LIGHT_R), lfar = lp[2] < vz0;
  const dot = () => {   // the light itself: the one dark accent while the light is the subject, an outline afterwards
    ctx.globalAlpha = ringA > 0 ? 1 : 0; ctx.beginPath(); ctx.arc(lp[0], lp[1], 13, 0, TAU);
    ctx.fillStyle = TT < 3.6 ? PAL.accent : PAL.face; ctx.fill(); hair(TT < 3.6 ? PAL.accent : PAL.edge); ctx.stroke(); ctx.globalAlpha = 1;
  };
  strokeRing(true); if (lfar) dot();
  ctx.globalAlpha = vis; ctx.drawImage(R.cv, X0, Y0, GW, GH); ctx.globalAlpha = 1;
  strokeRing(false); if (!lfar) dot();
  ctx.restore();
}

// ---- type
function drawTitle() {
  const e = EZ.io(seg(TT, 0.85, 1.35)), cx = CX;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = PAL.text;
  ctx.font = `700 ${lerp(170, 84, e)}px ${SANS}`; ctx.fillText('three.js', cx, lerp(950, 335, e));
  ctx.fillStyle = PAL.textD; ctx.font = `400 ${lerp(52, 34, e)}px ${SANS}`; ctx.fillText('real 3D on a 2D canvas', cx, lerp(1045, 385, e));
  ctx.restore();
}
function drawTags() {
  const a = ev(cu.panels + 0.1, 0.3); if (a < 0.01) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `400 28px ${ISOMONO}`; ctx.fillStyle = PAL.textD; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('2D  flat lines, no light', PX + 28, TOPF.y + 52);
  ctx.fillText('3D  lit mesh, real light', PX + 28, BOTF.y + 52);
  ctx.restore();
}
function drawLabels() {
  const names = ['light', 'shading', 'perspective', 'depth'], at = [cu.light, cu.shading, cu.persp, cu.depth];
  ctx.save(); ctx.font = `400 30px ${ISOMONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const TICK = 34, GAP = 30, wd = names.map((n) => ctx.measureText(n).width);
  const total = names.reduce((s, n, i) => s + TICK + 10 + wd[i] + (i < 3 ? GAP : 0), 0);
  let cur = -1; at.forEach((t0, i) => { if (TT >= t0) cur = i; });
  const land = TT >= cu.hit;
  let x = PX + 10;
  names.forEach((n, i) => {
    const a = clamp(spring(TT, at[i], { k: 140, damp: 0.85 }));
    if (a > 0.01) {
      ctx.globalAlpha = a;
      polyPath([[x, LROW_Y - 11], [x + TICK * a, LROW_Y - 11]], false); hair(PAL.edge); ctx.stroke();
      ctx.fillStyle = land || i === cur ? PAL.text : PAL.textD; ctx.fillText(n, x + TICK + 10, LROW_Y + (1 - a) * 12);
    }
    x += TICK + 10 + wd[i] + GAP;
  });
  const r = ev(cu.hit, 0.35);   // the payoff: one rule over the whole row
  if (r > 0.01) { ctx.globalAlpha = 1; polyPath([[PX + 10, LROW_Y - 52], [PX + 10 + total * r, LROW_Y - 52]], false); hair(PAL.edge); ctx.stroke(); }
  ctx.restore();
}

function sceneSplit() {
  const fr = (y, h) => { polyPath(rrectPts(PX, y, PW, h, 28, 6), true); hair(PAL.inner); ctx.stroke(); };
  const pa = ev(cu.panels, 0.3);
  if (pa > 0.01) { ctx.globalAlpha = pa; fr(TOPF.y, TOPF.h); fr(BOTF.y, BOTF.h); ctx.globalAlpha = 1; }
  if (TT >= cu.panels) { flatCube(); realCube(); }
  drawTags(); drawLabels(); drawTitle();
}
