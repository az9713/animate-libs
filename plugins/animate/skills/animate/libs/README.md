# libs/ — vendored libraries

A piece lists them in `piece.json`: `"libs": ["gsap", "d3"]`. `tools/build.mjs` inlines `kit/clock.js` first, then each file, each in its own `<script>` before the piece's (sloppy mode: gsap sets `window.window`). Add `libs/<name>.js` beside a piece to override or extend.

The clock shim makes `Date.now`, `performance.now` and `requestAnimationFrame` follow `renderFrame(t)`. A library is **seeked, never played**: `tl.time(TT)` for GSAP, `seekCSS(TT)` for CSS/WAAPI. A library that loads something pushes its promise to `window.LIBS_READY`; `renderFrame` appears when all have resolved.

`export.mjs`, `tile.mjs` and `review.mjs` block every `http(s)` request and fail on one (`tools/offline.mjs`). `build.mjs` skips its URL check for these files (XML namespace names and licence links).

| lib | version | file size | licence | notes |
|---|---|---|---|---|
| `waapi` | none (own code) | 0.4 KB | own | `seekCSS(t)` |
| `gsap` | 3.15.0 | 72.9 KB (`dist/gsap.min.js`: core + CSSPlugin) | GreenSock Standard "no charge" licence, https://gsap.com/standard-license | `gsap.timeline({ paused: true })`, then `tl.time(TT)`. Determinism: `examples/gsap-demo`, `tile.mjs` prints `deterministic: true` |
| `d3` | d3-scale, d3-shape, d3-interpolate, d3-array, d3-ease, d3-path (7.9.0 line), esbuild iife, global `d3` | 105.4 KB | ISC | pure functions: no DOM, no timers |
