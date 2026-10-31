// The live scene behind the hero and contact: a procedural ridgeline terrain with a road
// carved down the middle, lit by a point light that follows the pointer.
//
// Plain WebGL 1, no libraries. The whole terrain is one vertex buffer drawn with ONE draw
// call; heights, fog and lighting are computed on the GPU. While it runs it watches its own
// frame time and lowers the render resolution if the device can't keep up, the same trick
// a game uses on a cheap phone. Those numbers are published for the hero's readout.

const VERTEX = `
attribute vec2 a_grid;          // x in [-1, 1], row in [0, 1)

uniform float u_aspect;
uniform float u_focal;
uniform float u_travel;         // distance driven so far
uniform float u_camY;
uniform vec2 u_look;            // yaw, pitch
uniform vec2 u_light;           // light position: world x, distance ahead

varying float v_fog;
varying float v_light;
varying float v_height;
varying float v_lane;

const float WIDTH = 34.0;
const float DEPTH = 64.0;
const float NEAR = 1.5;

// 2D simplex noise (Ashima Arts / Stefan Gustavson, MIT)
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float terrain(vec2 p) {
  float h = snoise(p * 0.045) * 0.6 + snoise(p * 0.11) * 0.3 + snoise(p * 0.27) * 0.1;
  return pow(h * 0.5 + 0.5, 1.7);
}

void main() {
  float x = a_grid.x * WIDTH;
  float d = NEAR + mod(a_grid.y * DEPTH - u_travel, DEPTH);   // distance from the camera
  float s = d + u_travel;                                       // fixed coordinate along the road

  // Flat road in the middle, terrain rising away from it
  float valley = smoothstep(1.6, 9.0, abs(x));
  float h = terrain(vec2(x, s)) * 11.0 * valley + valley * valley * 1.2;

  vec3 p = vec3(x, h - u_camY, -d);
  float cy = cos(u_look.x), sy = sin(u_look.x);
  p.xz = mat2(cy, -sy, sy, cy) * p.xz;
  float cp = cos(u_look.y), sp = sin(u_look.y);
  p.yz = mat2(cp, sp, -sp, cp) * p.yz;

  gl_Position = vec4(p.x * u_focal / u_aspect, p.y * u_focal, 0.0, -p.z);

  v_fog = smoothstep(NEAR, NEAR + 5.0, d) * (1.0 - smoothstep(DEPTH * 0.3, DEPTH, d));
  float dl = length(vec2(x - u_light.x, d - u_light.y));
  v_light = exp(-dl * dl / 70.0);
  v_height = clamp(h / 9.0, 0.0, 1.0);
  // Centre-line dashes on the road
  v_lane = (1.0 - smoothstep(0.0, 0.4, abs(x))) * step(0.55, fract(s / 5.0));
}
`;

const FRAGMENT = `
precision mediump float;

uniform vec3 u_line;
uniform vec3 u_glow;
uniform float u_strength;

varying float v_fog;
varying float v_light;
varying float v_height;
varying float v_lane;

void main() {
  float lit = clamp(v_light * 1.4 + v_lane * 0.8, 0.0, 1.0);
  vec3 color = mix(u_line, u_glow, lit);
  float alpha = v_fog * (u_strength * (0.22 + 0.78 * v_height) + v_light * 0.9 + v_lane * 0.5);
  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
`;

const SPEED = 2.4;                 // world units per second
const MAX_DPR = 2;
const MIN_SCALE = 0.5;
const STEP = 0.8;

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return [0.5, 0.5, 0.5];
  const n = parseInt(m[1], 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// Rows of line segments. Each row is one ridgeline; every pair of vertices is one segment.
export function buildGrid(rows, cols) {
  const data = new Float32Array(rows * (cols - 1) * 4);
  let i = 0;
  for (let r = 0; r < rows; r++) {
    const t = r / rows;
    for (let c = 0; c < cols - 1; c++) {
      data[i++] = (c / (cols - 1)) * 2 - 1;
      data[i++] = t;
      data[i++] = ((c + 1) / (cols - 1)) * 2 - 1;
      data[i++] = t;
    }
  }
  return data;
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Shader failed to compile");
  }
  return shader;
}

// Returns null when WebGL isn't available; the page then keeps its CSS backdrop.
export function createTerrain(canvas, { animate = true, small = false, onStats } = {}) {
  let gl = null;
  try {
    gl = canvas.getContext("webgl", { antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    gl = null;
  }
  if (!gl) return null;

  const rows = small ? 56 : 84;
  const cols = small ? 110 : 170;
  const grid = buildGrid(rows, cols);
  const vertexCount = grid.length / 2;

  let program;
  let uniforms = {};
  let colors = { line: [0.5, 0.5, 0.5], glow: [1, 0.5, 0.1], strength: 0.6 };

  // Smoothed state; targets are set by input and eased toward every frame
  const pointer = { x: 0, y: 0.5, tx: 0, ty: 0.5, active: false };
  let scroll = 0;
  let travel = 0;
  let clock = 0;

  let scale = 1;
  let raf = 0;
  let running = false;
  let last = 0;
  let avg = 1000 / 60;
  let lastAdjust = 0;
  let lastPublish = 0;
  let drawCalls = 0;
  let lost = false;

  function init() {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program failed to link");
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_grid");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    ["u_aspect", "u_focal", "u_travel", "u_camY", "u_look", "u_light", "u_line", "u_glow", "u_strength"].forEach(
      (name) => (uniforms[name] = gl.getUniformLocation(program, name))
    );

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    // The canvas is premultiplied, so blend colour and alpha separately
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * scale;
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  }

  function draw(dt) {
    if (lost) return;
    const k = 1 - Math.pow(0.002, dt); // frame-rate independent easing
    if (!pointer.active && animate) {
      // No pointer (touch or idle): the light drifts across the valley on its own
      pointer.tx = Math.sin(clock * 0.31) * 0.7;
      pointer.ty = 0.55 + Math.cos(clock * 0.23) * 0.2;
    }
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;

    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    // Portrait screens get a wider lens so the valley still fits
    const focal = aspect < 1 ? 1.25 : 1.7;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.u_aspect, aspect);
    gl.uniform1f(uniforms.u_focal, focal);
    gl.uniform1f(uniforms.u_travel, travel);
    gl.uniform1f(uniforms.u_camY, 3.4 + scroll * 1.5);
    gl.uniform2f(uniforms.u_look, pointer.x * 0.07, -0.13 - (pointer.y - 0.5) * 0.05 + scroll * 0.06);
    gl.uniform2f(uniforms.u_light, pointer.x * 16, 6 + (1 - pointer.y) * 34);
    gl.uniform3fv(uniforms.u_line, colors.line);
    gl.uniform3fv(uniforms.u_glow, colors.glow);
    gl.uniform1f(uniforms.u_strength, colors.strength);
    gl.drawArrays(gl.LINES, 0, vertexCount);
    drawCalls = 1;
  }

  function publish(now) {
    if (!onStats || now - lastPublish < 500) return;
    lastPublish = now;
    onStats({
      fps: Math.round(1000 / avg),
      frameMs: avg,
      drawCalls,
      vertices: vertexCount,
      scale,
      width: canvas.width,
      height: canvas.height,
    });
  }

  // Dynamic resolution: drop the render scale when frames run long, win it back slowly
  function adapt(now) {
    if (now - lastAdjust < 1500) return;
    if (avg > 1000 / 45 && scale > MIN_SCALE) {
      scale = Math.max(MIN_SCALE, scale * STEP);
      lastAdjust = now;
      resize();
    } else if (avg < 1000 / 57 && scale < 1 && now - lastAdjust > 6000) {
      scale = Math.min(1, scale / STEP);
      lastAdjust = now;
      resize();
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const delta = Math.min(100, now - last || 16.7);
    last = now;
    avg += (delta - avg) * 0.08;
    const dt = delta / 1000;
    clock += dt;
    travel += dt * SPEED;
    draw(dt);
    adapt(now);
    publish(now);
  }

  const onLost = (e) => {
    e.preventDefault();
    lost = true;
    cancelAnimationFrame(raf);
  };
  const onRestored = () => {
    lost = false;
    uniforms = {};
    init();
    resize();
    if (running) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else {
      draw(1);
    }
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  init();
  resize();

  return {
    vertexCount,
    start() {
      if (!animate) {
        // Reduced motion: one still frame, and no frame rate to report
        draw(1);
        onStats?.({ fps: null, frameMs: null, drawCalls, vertices: vertexCount, scale, width: canvas.width, height: canvas.height });
        return;
      }
      if (running || lost) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    // Redraw one frame (used when not animating, e.g. after a theme change)
    render() {
      if (!running) draw(1);
    },
    resize() {
      resize();
      if (!running) draw(1);
    },
    setColors({ line, glow, strength }) {
      colors = { line: hexToRgb(line), glow: hexToRgb(glow), strength };
    },
    // x in [-1, 1] across the screen, y in [0, 1] down it
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
      pointer.active = true;
    },
    releasePointer() {
      pointer.active = false;
    },
    setScroll(progress) {
      scroll = progress;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
