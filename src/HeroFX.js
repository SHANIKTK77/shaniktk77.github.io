import React, { useEffect, useRef } from "react";

// Full-screen WebGL layer for the hero: drifting volumetric smoke and rising embers.
// It is blended over the game art with `mix-blend-mode: screen`, so black means "no effect".

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + 7.1;
    a *= 0.5;
  }
  return v;
}

float embers(vec2 p, float scale, float speed, float seed) {
  vec2 g = vec2(p.x * scale, p.y * scale - uTime * speed);
  g.x += sin(g.y * 0.35 + seed) * 0.6;
  vec2 id = floor(g);
  vec2 fr = fract(g) - 0.5;
  float r = hash(id + seed);
  vec2 off = vec2(hash(id + 3.1 + seed), hash(id + 7.7 + seed)) - 0.5;
  float d = length(fr - off * 0.7);
  float flicker = 0.55 + 0.45 * sin(uTime * 4.0 + r * 60.0);
  return smoothstep(0.075, 0.0, d) * step(0.9, r) * flicker;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  p += uMouse * 0.06;

  float t = uTime * 0.04;
  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 3.0));
  float smoke = fbm(p * 1.8 + q * 1.6 + vec2(t * 0.8, -t * 1.6));

  vec3 ember = vec3(1.0, 0.33, 0.1);
  vec3 gold = vec3(1.0, 0.72, 0.3);
  vec3 cyan = vec3(0.25, 0.8, 1.0);

  // Warm smoke pooled at the bottom, cool haze at the top
  vec3 col = ember * smoothstep(0.42, 1.0, smoke) * 0.5 * smoothstep(1.0, 0.0, uv.y);
  col += cyan * smoothstep(0.55, 1.0, fbm(p * 2.6 - t * 2.0)) * 0.12 * uv.y;

  // Two depth layers of embers
  float e = embers(p, 9.0, 0.9, 1.0) + embers(p, 16.0, 1.6, 9.0) * 0.6;
  col += mix(ember, gold, 0.4) * e * 1.6 * smoothstep(1.1, 0.1, uv.y);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

export default function HeroFX({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl =
      canvas &&
      canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return undefined;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return undefined;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return undefined;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let visible = true;
    let raf = 0;
    const start = performance.now();

    // Render below native resolution; the smoke is soft so it hides well and saves fill rate
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      if (still) draw(8);
    };

    const draw = (time) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      draw((now - start) / 1000);
    };

    const onMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);
    resize();

    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
