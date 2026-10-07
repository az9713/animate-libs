// =====================================================================
//  SIM — the Matter.js world, PRECOMPUTED. One engine is stepped from frame 0 to the last frame at a fixed 1/72 s
//  (3 steps per 24 fps frame); every body's x, y, angle and the engine's contact count are stored per frame.
//  renderFrame(t) only reads this table, so any frame order gives the same pixels. Layout numbers are page pixels.
// =====================================================================
const TOY = {
  floor: 1440, gravity: 2.4,
  rel: 1.0,                                                  // the hero ball is let go (on the 8th grid)
  ramp: { x: 190, y: 860, len: 250, th: 16, a: 0.5 },       // tilted down to the right
  hero: { x: 118, y: 700, r: 36 },
  plank: { x: 470, y: 1385, len: 300, th: 16, a: -0.29 },    // the seesaw: a plank pinned to a point (a Matter constraint)
  ballB: { r: 22, off: -110 },
  stop: { x: 312, y: 1395, w: 14, h: 90 },
  pyr: { x0: 640, rows: 5, s: 48, pitch: 49 },               // the pyramid of boxes
  pend: { x: 760, y: 620, links: 6, seg: 66, amp: -0.3, bob: 30 },
  big: { x: 540, y: 560, r: 52, t: 5.67 },                    // the heavy ball that ends the piece
};
let SIMT = null;
function SIM() {
  if (SIMT) return SIMT;
  const { Engine, Bodies, Body, Composite, Constraint, Events, Common } = Matter;
  Common._seed = 1;
  const R = RNG('matter-showcase');
  const eng = Engine.create({ gravity: { y: TOY.gravity }, constraintIterations: 8 });
  const add = (...x) => Composite.add(eng.world, x);
  const stat = (x, y, w, h, label, o = {}) => { const b = Bodies.rectangle(x, y, w, h, { isStatic: true, friction: 0.5, label, ...o }); add(b); return b; };
  // ---- static world: floor, side walls, ramp, post
  stat(540, TOY.floor + 40, 1400, 80, 'floor', { friction: 0.6 });
  stat(15, 900, 80, 3000, 'wallL'); stat(1050, 900, 80, 3000, 'wallR');
  stat(TOY.ramp.x, TOY.ramp.y, TOY.ramp.len, TOY.ramp.th, 'ramp', { angle: TOY.ramp.a, friction: 0.25 });
  stat(TOY.stop.x, TOY.stop.y, TOY.stop.w, TOY.stop.h, 'stop');                  // keeps the small ball on the seesaw's low end
  // ---- dynamic items (items[i] <-> frames[f][i]); t0 = the time the body joins the world
  const items = [];
  const item = (kind, mk, t0 = 0, extra = {}) => { const it = { kind, mk, t0, body: null, ...extra }; items.push(it); return it; };
  const hero = item('hero', () => Bodies.circle(TOY.hero.x, TOY.hero.y, TOY.hero.r, { density: 0.012, restitution: 0.2, friction: 0.12, frictionAir: 0.0004, label: 'hero' }), TOY.rel, { r: TOY.hero.r });
  const P = TOY.pyr, boxes = [];
  for (let r = 0; r < P.rows; r++) for (let i = 0; i < P.rows - r; i++) {
    const x = P.x0 + P.s / 2 + r * P.pitch / 2 + i * P.pitch + R.n(0.4), y = TOY.floor - P.s / 2 - r * (P.s + 0.6) - 0.5;
    boxes.push(item('box', () => Bodies.rectangle(x, y, P.s, P.s, { density: 0.0006, friction: 0.03, frictionStatic: 0.06, restitution: 0.05, label: 'box' }), 0, { s: P.s, row: r }));
  }
  const pl = TOY.plank, ca = Math.cos(pl.a), sa = Math.sin(pl.a);
  const plank = item('plank', () => Bodies.rectangle(pl.x, pl.y, pl.len, pl.th, { density: 0.0015, friction: 0.5, label: 'plank', angle: pl.a }), 0, { w: pl.len, h: pl.th });
  const bx = pl.x + TOY.ballB.off * ca + (pl.th / 2 + TOY.ballB.r) * sa, by = pl.y + TOY.ballB.off * sa - (pl.th / 2 + TOY.ballB.r) * ca;
  const ballB = item('ballB', () => Bodies.circle(bx, by, TOY.ballB.r, { density: 0.002, restitution: 0.35, friction: 0.2, label: 'ballB' }), 0, { r: TOY.ballB.r });
  // pendulum: anchor point -> small links -> a heavy bob, all joined by constraints
  const pd = TOY.pend, chain = [], ax = pd.x, ay = pd.y, dx = Math.sin(pd.amp), dy = Math.cos(pd.amp);
  for (let i = 1; i <= pd.links + 1; i++) {
    const bob = i === pd.links + 1, x = ax + dx * pd.seg * i, y = ay + dy * pd.seg * i;
    chain.push(item(bob ? 'bob' : 'link', () => Bodies.circle(x, y, bob ? pd.bob : 8, { density: bob ? 0.003 : 0.001, frictionAir: 0, restitution: 0.3, label: bob ? 'bob' : 'link', collisionFilter: { group: -1 } }), 0, { r: bob ? pd.bob : 8 }));
  }
  const big = item('big', () => Bodies.circle(TOY.big.x, TOY.big.y, TOY.big.r, { density: 0.005, restitution: 0.15, friction: 0.3, label: 'big' }), TOY.big.t, { r: TOY.big.r });
  const joints = [];   // constraints are created once their bodies exist
  const makeJoints = () => {
    joints.push(Constraint.create({ pointA: { x: pl.x, y: pl.y }, bodyB: plank.body, pointB: { x: 0, y: 0 }, length: 0, stiffness: 1 }));
    chain.forEach((c, i) => joints.push(Constraint.create(i === 0
      ? { pointA: { x: ax, y: ay }, bodyB: c.body, length: pd.seg, stiffness: 1, damping: 0.01 }
      : { bodyA: chain[i - 1].body, bodyB: c.body, length: pd.seg, stiffness: 1, damping: 0.01 })));
    add(...joints);
  };
  // ---- events: every collision start, with its label pair, speed and place
  let now = 0; const hits = [];
  Events.on(eng, 'collisionStart', (e) => {
    for (const p of e.pairs) {
      const a = p.bodyA, b = p.bodyB, sp = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y), s0 = p.collision.supports[0] || p.collision.supports[1] || a.position;
      hits.push({ t: now, a: a.label, b: b.label, speed: sp, x: s0.x, y: s0.y });
    }
  });
  // ---- step
  const frames = [], bodies = [], contacts = [], dt = 1000 / 72;
  for (const it of items) if (it.t0 <= 0) { it.body = it.mk(); add(it.body); }
  makeJoints();
  for (let f = 0; f < NFRAMES; f++) {
    for (let k = 0; k < 3; k++) {
      now = f / FPS + k / 72;
      for (const it of items) if (!it.body && now >= it.t0 - 1e-9) { it.body = it.mk(); add(it.body); }
      Engine.update(eng, dt);
    }
    frames.push(items.map((it) => it.body ? [it.body.position.x, it.body.position.y, it.body.angle] : null));
    bodies.push(Composite.allBodies(eng.world).filter((b) => !b.isStatic).length);
    contacts.push(eng.pairs.list.filter((p) => p.isActive).length);
  }
  const first = (a, b) => { const h = hits.find((q) => (q.a === a && q.b === b) || (q.a === b && q.b === a)); return h || null; };
  const ev = { ramp: first('hero', 'ramp'), plank: first('hero', 'plank'), box: first('hero', 'box'), big: first('big', 'plank') };
  // soft knocks for the score: the strongest hit in each 0.1 s, dynamic bodies only
  const knocks = [];
  for (const h of hits.filter((q) => q.speed > 1.2 && q.t > 0.3).sort((x, y) => x.t - y.t)) {
    const last = knocks[knocks.length - 1];
    if (last && h.t - last.t < 0.1) { if (h.speed > last.speed) knocks[knocks.length - 1] = h; } else knocks.push(h);
  }
  return (SIMT = { items, frames, bodies, contacts, hits, ev, knocks, joints: { plank: joints[0] } });
}
