# libs/ — vendored libraries

A piece lists them in `piece.json`: `"libs": ["gsap", "d3"]`. `tools/build.mjs` inlines `kit/clock.js` first, then each file, each in its own `<script>` before the piece's (sloppy mode: gsap sets `window.window`). Add `libs/<name>.js` beside a piece to override or extend.

The clock shim makes `Date.now`, `performance.now` and `requestAnimationFrame` follow `renderFrame(t)`. A library is **seeked, never played**: `tl.time(TT)` for GSAP, `seekCSS(TT)` for CSS/WAAPI. A library that loads something pushes its promise to `window.LIBS_READY`; `renderFrame` appears when all have resolved.

`export.mjs`, `tile.mjs` and `review.mjs` block every `http(s)` request and fail on one (`tools/offline.mjs`). `build.mjs` skips its URL check for these files (XML namespace names and licence links).

| lib | version | file size | licence | notes |
|---|---|---|---|---|
| `waapi` | none (own code) | 0.4 KB | own | `seekCSS(t)` |
| `gsap` | 3.15.0 | 72.9 KB (`dist/gsap.min.js`: core + CSSPlugin) | GreenSock Standard "no charge" licence, https://gsap.com/standard-license | `gsap.timeline({ paused: true })`, then `tl.time(TT)`. Determinism: `examples/gsap-demo`, `tile.mjs` prints `deterministic: true` |
| `d3` | d3-scale, d3-shape, d3-interpolate, d3-array, d3-ease, d3-path (7.9.0 line), esbuild iife, global `d3` | 105.4 KB | ISC | pure functions: no DOM, no timers |
| `katex` | 0.19.0 | 643.5 KB (js 272.9 KB + css with woff2 fonts inlined as `data:` URIs) | MIT; fonts SIL OFL | `KT.make(id, tex, { size, color, display })` -> `KT.img[id]`, an Image drawn with `ctx.drawImage`. Rendered through an SVG `foreignObject`: the canvas stays readable (not tainted). Call `make` at the top of `scenes.js`; the image is decoded before `renderFrame` exists |
| `mathjax` | 3.2.2 (`es5/tex-svg.js`, `fontCache: 'none'`) | 2109.9 KB | Apache-2.0 | `MJ.make(id, tex, { size, color, display })` -> `MJ.img[id]`; `MJ.svg[id]` holds the SVG text (plain `<path>`s, no `<use>`) for per-path reveals. **Use v3: v4.1.3 hung when inlined (cause not diagnosed)** |

Regenerating `katex.js`: keep `katex.min.js`, replace each `@font-face` `src` of `katex.min.css` by its woff2 file as a base64 `data:` URI, put the CSS in `window.KATEX_CSS`, then append the `KT` helper. `mathjax.js`: a config line (`window.MathJax = { startup: { typeset: false }, svg: { fontCache: 'none' } }`), `tex-svg.js`, then the `MJ` helper.
Determinism of both: `tile.mjs` prints `deterministic: true` on a piece that draws one equation of each (checked 2026-10-06). Not tested: term-by-term morphs between equations.
