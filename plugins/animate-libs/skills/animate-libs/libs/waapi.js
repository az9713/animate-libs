// CSS / Web Animations seek helper (no library: the browser's own Element.animate and CSS @keyframes).
// seekCSS(t, root = document): pause every animation under root and set it to t seconds. Call it in the scene, once per frame.
// CSS animations must have `animation-fill-mode: both` so they hold their end state after they finish.
window.seekCSS = (t, root = document) => {
  for (const a of root.getAnimations({ subtree: true })) { a.pause(); a.currentTime = t * 1000; }
};
