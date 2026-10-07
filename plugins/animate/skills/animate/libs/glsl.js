// GLSL helper (raw WebGL, no library). GLSL.make(frag, size) -> { draw({ u_x: number }) } -> the offscreen canvas.
// The vertex shader draws a full-screen quad and passes `varying vec2 v` (0..1). Call draw() once per frame; same inputs, same pixels.
window.GLSL = (() => {
  const make = (frag, size = 512) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false }), sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 a; varying vec2 v; void main() { v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, frag)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); gl.viewport(0, 0, size, size);
    return { draw(u = {}) { for (const k in u) gl.uniform1f(gl.getUniformLocation(pr, k), u[k]); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); return cv; } };
  };
  return { make };
})();
