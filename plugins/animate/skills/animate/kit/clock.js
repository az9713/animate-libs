// ---- clock shim (inlined by tools/build.mjs when piece.json has "libs", before the libraries)
// Date.now, performance.now and requestAnimationFrame follow renderFrame(t): the same t gives the same state, in any order.
// A library is seeked (gsap: tl.time(t); WAAPI: seekCSS(t)), never played. requestAnimationFrame never fires.
// A library that loads something (fonts, WASM, textures) pushes its promise to LIBS_READY; renderFrame waits for all of them.
window.LIBS_READY = [];
{
  const EPOCH = 1700000000000; let ms = 0;
  window.__setClock = (t) => { ms = t * 1000; };
  Date.now = () => EPOCH + ms;
  window.__realNow = performance.now.bind(performance);   // for timing the tools
  performance.now = () => ms;
  window.requestAnimationFrame = () => 0;
  window.cancelAnimationFrame = () => {};
}
