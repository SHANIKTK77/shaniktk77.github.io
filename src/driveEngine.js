import * as THREE from "three";

// Real-time 3D "free roam" world behind the hero: a drivable car, billboards for each game,
// mission markers that open page sections, a ramp, a parking challenge and a cone strike.
// Plain three.js with no physics library. Everything is lit cheaply (no shadow maps, no real
// lights per lamp) and repeated objects are instanced, so the whole world draws in ~50 calls.

const TAU = Math.PI * 2;
const STEP = 1 / 120; // fixed physics step

const RING_R = 62; // ring road radius
const RING_W = 12;
const WORLD_R = 112; // drivable area
const ZONE_RING = 34; // mission markers sit on this circle
const ZONE_HIT = 3.6;
const BOARD_R = 86; // billboards sit on this circle
const SPAWN = { x: 0, z: 18, heading: Math.PI };

const CAR_R = 1.3; // collision radius
const WHEELBASE = 2.7;
const MAX_SPEED = 30;
const BOOST_SPEED = 44;
const ACCEL = 20;
const BOOST_ACCEL = 34;
const BRAKE = 42;
const REVERSE_SPEED = 9;
const GRAVITY = 28;
const AIR_GOAL = 0.6; // seconds of airtime for the ramp objective
const CONE_GOAL = 10;
const DRIFT_GOAL = 9000;

// The highlighted parking bay (a nod to Prado Car Parking)
const PARK = { x: 1.6, z: 78 };
const LOT = { x: 0, z: 78, bays: [-4.8, -1.6, 1.6, 4.8] };
// The stunt ramp sits on the ring road, facing the direction the demo car laps in
const RAMP = { x: RING_R, z: 0, dirX: 0, dirZ: -1, length: 11, width: 8, height: 3 };

const COLORS = {
  bg: 0x090a12,
  accent: 0xff5a1f,
  gold: 0xffc35a,
  cyan: 0x4fd8ff,
  green: 0x46e08c,
};

const FONT_DISPLAY = '"Barlow Condensed", "Inter", sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

const KEYMAP = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "drift",
  ShiftLeft: "boost",
  ShiftRight: "boost",
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const polar = (angle, r) => [Math.sin(angle) * r, Math.cos(angle) * r];

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

// A white radial falloff, tinted by material or instance color: glows, light pools, shadows
function radialTexture() {
  const c = makeCanvas(128, 128);
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Opaque at the bottom, clear at the top: light beams and the boundary wall
function beamTexture() {
  const c = makeCanvas(4, 128);
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.7, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,1)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 128);
  return new THREE.CanvasTexture(c);
}

export default class DriveEngine {
  constructor(canvas, { games, zones, minimap, on }) {
    this.canvas = canvas;
    this.games = games;
    this.minimap = minimap;
    this.on = on;
    this.redraws = [];
    this.obstacles = [];
    this.keys = { up: false, down: false, left: false, right: false, drift: false, boost: false };
    this.input = { throttle: 0, brake: 0, steer: 0, drift: false, boost: false };
    this.driving = false;
    this.god = false;
    this.visible = true;
    this.time = 0;
    this.acc = 0;
    this.zone = null;
    this.board = null;
    this.done = {};
    this.shake = 0;
    this.viewX = 0;
    this.viewY = 0;
    this.hud = {
      speed: 0,
      boost: 1,
      combo: 0,
      mult: 1,
      score: 0,
      air: false,
      perf: null,
    };
    this.perf = { frames: 0, since: 0, slow: 0, fast: 0 };

    this.initRenderer();
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(COLORS.bg, 0.0062);
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 900);
    this.glow = radialTexture();
    this.beam = beamTexture();
    this.pools = [];

    this.buildSky();
    this.buildGround();
    this.buildTrack();
    this.buildLamps();
    this.buildZones(zones);
    this.buildBillboards();
    this.buildParking();
    this.buildRamp();
    this.buildCones();
    this.buildPools();
    this.buildCar();
    this.buildEffects();
    this.buildMinimap();

    this.resetCar();
    this.placeOnRing(-0.6);
    this.snapCamera();

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.frame = this.frame.bind(this);

    // Labels are drawn on canvases; redraw them once the web fonts have loaded
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load(`800 100px ${FONT_DISPLAY}`),
        document.fonts.load(`600 40px ${FONT_MONO}`),
      ])
        .then(() => !this.disposed && this.redraws.forEach((r) => r()))
        .catch(() => {});
    }
  }

  /* ---------- Setup ---------- */

  initRenderer() {
    const dpr = window.devicePixelRatio || 1;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: dpr < 2,
      powerPreference: "high-performance",
    });
    // Cap the resolution; the frame loop lowers it further if the device struggles
    this.maxRatio = Math.min(dpr, 1.75);
    this.ratio = this.maxRatio;
    this.renderer.setPixelRatio(this.ratio);
    this.renderer.setClearColor(COLORS.bg);
  }

  canvasTexture(w, h, draw) {
    const canvas = makeCanvas(w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const redraw = () => {
      const g = canvas.getContext("2d");
      g.clearRect(0, 0, w, h);
      draw(g, w, h);
      tex.needsUpdate = true;
    };
    redraw();
    this.redraws.push(redraw);
    return tex;
  }

  label(lines, color, w = 512, h = 192) {
    const tex = this.canvasTexture(w, h, (g) => {
      g.textAlign = "center";
      g.textBaseline = "middle";
      lines.forEach((l) => {
        g.font = l.font;
        g.fillStyle = l.color || color;
        g.shadowColor = "rgba(0,0,0,0.85)";
        g.shadowBlur = 12;
        g.fillText(l.text, w / 2, l.y);
      });
    });
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    this.scene.add(sprite);
    return sprite;
  }

  buildSky() {
    const bg = makeCanvas(2, 256);
    const g = bg.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#020309");
    grad.addColorStop(0.42, "#0a0b17");
    grad.addColorStop(0.55, "#1b0d14");
    grad.addColorStop(0.62, "#090a12");
    grad.addColorStop(1, "#090a12");
    g.fillStyle = grad;
    g.fillRect(0, 0, 2, 256);
    const bgTex = new THREE.CanvasTexture(bg);
    bgTex.colorSpace = THREE.SRGBColorSpace;
    this.scene.background = bgTex;

    // A striped synthwave sun low on the horizon
    const sunTex = this.canvasTexture(512, 512, (ctx) => {
      const sg = ctx.createLinearGradient(0, 0, 0, 512);
      sg.addColorStop(0, "#ffe7a3");
      sg.addColorStop(0.45, "#ff8a3d");
      sg.addColorStop(1, "#ff2d6b");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(256, 256, 254, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 9; i++) {
        const y = 270 + i * 26;
        ctx.fillRect(0, y, 512, 3 + i * 1.6);
      }
    });
    const sun = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 150),
      new THREE.MeshBasicMaterial({ map: sunTex, transparent: true, fog: false, depthWrite: false })
    );
    sun.position.set(0, 34, -380);
    this.scene.add(sun);
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(420, 420),
      new THREE.MeshBasicMaterial({
        map: this.glow,
        color: 0xff4a2a,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        fog: false,
        depthWrite: false,
      })
    );
    halo.position.set(0, 30, -390);
    this.scene.add(halo);

    // Stars on the upper half of a big sphere
    const n = 700;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const y = 0.12 + Math.random() * 0.88;
      const r = Math.sqrt(1 - y * y);
      pos.set([Math.cos(a) * r * 600, y * 600, Math.sin(a) * r * 600], i * 3);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.scene.add(
      new THREE.Points(
        sg,
        new THREE.PointsMaterial({
          color: 0xaabaff,
          size: 1.6,
          sizeAttenuation: false,
          fog: false,
          transparent: true,
          opacity: 0.75,
        })
      )
    );

    // City skyline: one instanced box per building, windows from a shared texture
    const winTex = this.canvasTexture(64, 256, (ctx) => {
      ctx.fillStyle = "#0b0d16";
      ctx.fillRect(0, 0, 64, 256);
      for (let y = 6; y < 250; y += 9) {
        for (let x = 4; x < 60; x += 8) {
          const r = Math.random();
          if (r < 0.2) ctx.fillStyle = "rgba(255,200,120,0.85)";
          else if (r < 0.27) ctx.fillStyle = "rgba(79,216,255,0.7)";
          else continue;
          ctx.fillRect(x, y, 4, 5);
        }
      }
    });
    const count = 170;
    const city = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
      new THREE.MeshBasicMaterial({ map: winTex }),
      count
    );
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const r = 150 + Math.random() * 110;
      d.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
      d.rotation.set(0, Math.random() * TAU, 0);
      d.scale.set(8 + Math.random() * 16, 14 + Math.random() * Math.random() * 80, 8 + Math.random() * 16);
      d.updateMatrix();
      city.setMatrixAt(i, d.matrix);
    }
    this.scene.add(city);
  }

  buildGround() {
    const tex = this.canvasTexture(512, 512, (g, w, h) => {
      g.fillStyle = "#07080e";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(255,255,255,0.05)";
      g.lineWidth = 2;
      for (let i = 1; i < 4; i++) {
        const p = (i * w) / 4;
        g.beginPath();
        g.moveTo(p, 0);
        g.lineTo(p, h);
        g.moveTo(0, p);
        g.lineTo(w, p);
        g.stroke();
      }
      g.strokeStyle = "rgba(79,216,255,0.2)";
      g.lineWidth = 3;
      g.strokeRect(0, 0, w, h);
    });
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(70, 70);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(700, 700).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    this.scene.add(ground);

    // The name, painted across the plaza
    const name = this.canvasTexture(2048, 680, (g, w) => {
      g.textAlign = "center";
      g.textBaseline = "alphabetic";
      g.font = `800 330px ${FONT_DISPLAY}`;
      const grad = g.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#ff5a1f");
      grad.addColorStop(0.6, "#ffc35a");
      grad.addColorStop(1, "#fff1d0");
      g.fillStyle = grad;
      g.globalAlpha = 0.9;
      g.fillText("SHADMAN", w / 2, 320);
      g.font = `700 150px ${FONT_DISPLAY}`;
      g.fillStyle = "#f2f3f6";
      g.globalAlpha = 0.75;
      g.fillText("KHAN KHATTAK", w / 2, 490);
      g.font = `600 48px ${FONT_MONO}`;
      g.fillStyle = "#4fd8ff";
      g.globalAlpha = 0.8;
      g.fillText("GAME DEVELOPER  ·  UNITY  ·  UNREAL ENGINE", w / 2, 600);
    });
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 15.3).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: name,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      })
    );
    plate.position.y = 0.02;
    this.scene.add(plate);

    // Glowing boundary wall
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(WORLD_R + 1.6, WORLD_R + 1.6, 4, 96, 1, true),
      new THREE.MeshBasicMaterial({
        map: this.beam,
        color: COLORS.accent,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    wall.position.y = 2;
    this.scene.add(wall);
  }

  buildTrack() {
    const road = new THREE.Mesh(
      new THREE.RingGeometry(RING_R - RING_W / 2, RING_R + RING_W / 2, 160).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x0d1018 })
    );
    road.position.y = 0.01;
    this.scene.add(road);

    const edge = (r, color) => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.18, r + 0.18, 160).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color, toneMapped: false })
      );
      m.position.y = 0.02;
      this.scene.add(m);
    };
    edge(RING_R - RING_W / 2, COLORS.cyan);
    edge(RING_R + RING_W / 2, COLORS.accent);

    const n = 64;
    const dashes = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.3, 2.6).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }),
      n
    );
    const d = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const [x, z] = polar(a, RING_R);
      d.position.set(x, 0.02, z);
      d.rotation.set(0, a + Math.PI / 2, 0);
      d.updateMatrix();
      dashes.setMatrixAt(i, d.matrix);
    }
    this.scene.add(dashes);
  }

  buildLamps() {
    const n = 24;
    const r = RING_R + RING_W / 2 + 2.5;
    const poles = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.12, 0.18, 6.4, 6).translate(0, 3.2, 0),
      new THREE.MeshBasicMaterial({ color: 0x1b1f2b }),
      n
    );
    const heads = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.5, 0.2, 1.8),
      new THREE.MeshBasicMaterial({ color: 0xffe2b0, toneMapped: false }),
      n
    );
    const d = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n) * TAU;
      const [x, z] = polar(a, r);
      d.position.set(x, 0, z);
      d.rotation.set(0, a, 0);
      d.scale.set(1, 1, 1);
      d.updateMatrix();
      poles.setMatrixAt(i, d.matrix);
      const [hx, hz] = polar(a, r - 0.7);
      d.position.set(hx, 6.4, hz);
      d.updateMatrix();
      heads.setMatrixAt(i, d.matrix);
      const [px, pz] = polar(a, r - 3.5);
      this.pools.push({ x: px, z: pz, size: 11, color: 0xffa860, strength: 0.38 });
      this.obstacles.push({ x, z, r: 0.35, h: 99 });
    }
    this.scene.add(poles, heads);
  }

  buildZones(zones) {
    const n = zones.length;
    this.zones = zones.map((z, i) => {
      const a = (i / n) * TAU + Math.PI / 6;
      const [x, zz] = polar(a, ZONE_RING);
      return { ...z, x, z: zz, a };
    });

    const rings = new THREE.InstancedMesh(
      new THREE.RingGeometry(3.3, 3.9, 48).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ toneMapped: false }),
      n
    );
    const discs = new THREE.InstancedMesh(
      new THREE.CircleGeometry(3.3, 48).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      n
    );
    const beams = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(3.3, 3.3, 16, 32, 1, true).translate(0, 8, 0),
      new THREE.MeshBasicMaterial({
        map: this.beam,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      n
    );
    const d = new THREE.Object3D();
    const col = new THREE.Color();
    this.zones.forEach((z, i) => {
      col.set(z.color);
      d.position.set(z.x, 0.04, z.z);
      d.updateMatrix();
      [rings, discs, beams].forEach((m) => {
        m.setMatrixAt(i, d.matrix);
        m.setColorAt(i, col);
      });
      z.sprite = this.label(
        [
          { text: z.num, font: `600 30px ${FONT_MONO}`, y: 34, color: z.color },
          { text: z.label.toUpperCase(), font: `800 96px ${FONT_DISPLAY}`, y: 100, color: "#ffffff" },
          { text: z.hint.toUpperCase(), font: `600 26px ${FONT_MONO}`, y: 162, color: z.color },
        ],
        z.color
      );
      z.sprite.scale.set(9.6, 3.6, 1);
      z.sprite.position.set(z.x, 9, z.z);
    });
    this.zoneBeams = beams;
    this.scene.add(rings, discs, beams);
  }

  buildBillboards() {
    const n = this.games.length;
    const frames = new THREE.InstancedMesh(
      new THREE.BoxGeometry(14.8, 9.6, 0.5),
      new THREE.MeshBasicMaterial({ color: 0x10131b }),
      n
    );
    const strips = new THREE.InstancedMesh(
      new THREE.BoxGeometry(14.8, 0.18, 0.6),
      new THREE.MeshBasicMaterial({ color: COLORS.accent, toneMapped: false }),
      n * 2
    );
    const posts = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.24, 0.3, 12.6, 8).translate(0, 6.3, 0),
      new THREE.MeshBasicMaterial({ color: 0x1b1f2b }),
      n * 2
    );
    const parent = new THREE.Object3D();
    const child = new THREE.Object3D();
    parent.add(child);
    const place = (mesh, i, x, y, z) => {
      child.position.set(x, y, z);
      parent.updateMatrixWorld(true);
      mesh.setMatrixAt(i, child.matrixWorld);
    };

    this.boards = this.games.map((game, i) => {
      const a = (i / n) * TAU + Math.PI / n;
      const [x, z] = polar(a, BOARD_R);
      parent.position.set(x, 0, z);
      parent.rotation.set(0, a + Math.PI, 0);
      place(frames, i, 0, 7.6, -0.3);
      place(strips, i * 2, 0, 2.75, 0);
      place(strips, i * 2 + 1, 0, 12.45, 0);
      place(posts, i * 2, -6.4, 0, -0.6);
      place(posts, i * 2 + 1, 6.4, 0, -0.6);
      [-6.4, 6.4].forEach((px) => {
        const wx = x + Math.cos(a + Math.PI) * px;
        const wz = z - Math.sin(a + Math.PI) * px;
        this.obstacles.push({ x: wx, z: wz, r: 0.45, h: 99 });
      });

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 8.75),
        new THREE.MeshBasicMaterial({ map: this.boardTexture(game, i), toneMapped: false })
      );
      screen.position.set(x, 7.6, z);
      screen.rotation.y = a + Math.PI;
      this.scene.add(screen);

      const [px, pz] = polar(a, BOARD_R - 6);
      this.pools.push({ x: px, z: pz, size: 16, color: COLORS.accent, strength: 0.3 });
      return { x, z, nx: -Math.sin(a), nz: -Math.cos(a), index: i };
    });
    this.scene.add(frames, strips, posts);
  }

  boardTexture(game, i) {
    let img = null;
    const tex = this.canvasTexture(1024, 640, (g, w, h) => {
      g.fillStyle = "#0b0d14";
      g.fillRect(0, 0, w, h);
      if (img) {
        const scale = Math.max(w / img.width, 560 / img.height);
        const iw = img.width * scale;
        const ih = img.height * scale;
        g.drawImage(img, (w - iw) / 2, (560 - ih) / 2, iw, ih);
      }
      g.fillStyle = "#06070b";
      g.fillRect(0, 560, w, 80);
      g.fillStyle = "#ff5a1f";
      g.fillRect(0, 560, 10, 80);
      g.textBaseline = "middle";
      g.textAlign = "left";
      g.font = `800 52px ${FONT_DISPLAY}`;
      g.fillStyle = "#ffffff";
      g.fillText(game.title.toUpperCase(), 34, 602);
      g.textAlign = "right";
      g.font = `600 22px ${FONT_MONO}`;
      g.fillStyle = "#ffc35a";
      g.fillText(`#${String(i + 1).padStart(2, "0")} · ${game.genre.toUpperCase()}`, w - 28, 602);
    });
    const redraw = this.redraws[this.redraws.length - 1];
    const image = new Image();
    image.onload = () => {
      if (this.disposed) return;
      img = image;
      redraw();
    };
    image.src = game.image;
    return tex;
  }

  buildParking() {
    const tex = this.canvasTexture(640, 400, (g) => {
      // 40px per world unit; canvas top faces the ring road
      g.strokeStyle = "rgba(255,255,255,0.75)";
      g.lineWidth = 6;
      LOT.bays.forEach((bx, i) => {
        const left = (bx - 1.6 + 8) * 40;
        g.beginPath();
        g.moveTo(left, 80);
        g.lineTo(left, 320);
        g.stroke();
        if (i === LOT.bays.length - 1) {
          g.beginPath();
          g.moveTo(left + 128, 80);
          g.lineTo(left + 128, 320);
          g.stroke();
        }
      });
      g.beginPath();
      g.moveTo(64, 320);
      g.lineTo(576, 320);
      g.stroke();
      g.save();
      g.translate((PARK.x + 8) * 40, 240);
      g.rotate(Math.PI);
      g.textAlign = "center";
      g.font = `800 70px ${FONT_DISPLAY}`;
      g.fillStyle = "rgba(70,224,140,0.85)";
      g.fillText("P", 0, 20);
      g.restore();
    });
    const lot = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 10).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      })
    );
    lot.position.set(LOT.x, 0.03, LOT.z);
    this.scene.add(lot);

    const border = this.canvasTexture(128, 256, (g, w, h) => {
      g.strokeStyle = "#ffffff";
      g.lineWidth = 10;
      g.strokeRect(8, 8, w - 16, h - 16);
      g.fillStyle = "rgba(255,255,255,0.12)";
      g.fillRect(8, 8, w - 16, h - 16);
    });
    this.bay = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 5.8).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: border,
        color: COLORS.green,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.bay.position.set(PARK.x, 0.05, PARK.z);
    this.scene.add(this.bay);

    // Parked cars in the other bays
    const parked = LOT.bays.filter((b) => b !== PARK.x);
    const bodies = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1.9, 0.6, 4.1).translate(0, 0.6, 0),
      new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.4 }),
      parked.length
    );
    const cabins = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1.6, 0.5, 2).translate(0, 1.15, -0.2),
      new THREE.MeshStandardMaterial({ color: 0x0d1a26, metalness: 0.9, roughness: 0.15 }),
      parked.length
    );
    const d = new THREE.Object3D();
    const paints = [0x4fd8ff, 0xb07cff, 0xe8e8ee];
    parked.forEach((bx, i) => {
      d.position.set(bx, 0, PARK.z);
      d.rotation.set(0, i % 2 ? Math.PI : 0, 0);
      d.updateMatrix();
      bodies.setMatrixAt(i, d.matrix);
      cabins.setMatrixAt(i, d.matrix);
      bodies.setColorAt(i, new THREE.Color(paints[i % paints.length]));
      this.obstacles.push({ x: bx, z: PARK.z - 1.1, r: 1.05, h: 1.4 });
      this.obstacles.push({ x: bx, z: PARK.z + 1.1, r: 1.05, h: 1.4 });
    });
    this.scene.add(bodies, cabins);

    const sign = this.label(
      [
        { text: "PARKING CHALLENGE", font: `800 84px ${FONT_DISPLAY}`, y: 80, color: "#ffffff" },
        { text: "STOP INSIDE THE GREEN BAY", font: `600 28px ${FONT_MONO}`, y: 148, color: "#46e08c" },
      ],
      "#46e08c",
      768
    );
    sign.scale.set(12.8, 3.2, 1);
    sign.position.set(LOT.x, 6.5, LOT.z + 5);
    this.pools.push({ x: PARK.x, z: PARK.z, size: 9, color: COLORS.green, strength: 0.25 });
  }

  buildRamp() {
    const { length: L, width: W, height: H } = RAMP;
    const fx = RAMP.dirX;
    const fz = RAMP.dirZ;
    // Origin at the low end of the ramp
    this.ramp = { ox: RAMP.x - (fx * L) / 2, oz: RAMP.z - (fz * L) / 2, fx, fz, rx: fz, rz: -fx };

    const v = [
      [-W / 2, 0, 0],
      [W / 2, 0, 0],
      [-W / 2, 0, L],
      [W / 2, 0, L],
      [-W / 2, H, L],
      [W / 2, H, L],
    ];
    const tris = [
      [0, 1, 5], [0, 5, 4], // slope
      [2, 4, 5], [2, 5, 3], // back
      [0, 4, 2], // sides
      [1, 3, 5],
    ];
    const pos = [];
    tris.forEach((t) => t.forEach((k) => pos.push(...v[k])));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const ramp = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: 0x1c2232,
        roughness: 0.7,
        flatShading: true,
        side: THREE.DoubleSide,
        emissive: 0x2a1006,
      })
    );
    ramp.position.set(this.ramp.ox, 0, this.ramp.oz);
    ramp.rotation.y = Math.atan2(fx, fz);
    this.scene.add(ramp);

    const slope = Math.atan2(H, L);
    const chevrons = this.canvasTexture(256, 512, (g, w, h) => {
      g.fillStyle = "#ffc35a";
      for (let y = 40; y < h; y += 120) {
        g.beginPath();
        g.moveTo(30, y);
        g.lineTo(w / 2, y + 60);
        g.lineTo(w - 30, y);
        g.lineTo(w - 30, y + 34);
        g.lineTo(w / 2, y + 94);
        g.lineTo(30, y + 34);
        g.closePath();
        g.fill();
      }
    });
    const deco = new THREE.Mesh(
      new THREE.PlaneGeometry(W * 0.7, Math.hypot(L, H) * 0.9).rotateX(-Math.PI / 2 - slope),
      new THREE.MeshBasicMaterial({
        map: chevrons,
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      })
    );
    deco.position.set(0, H / 2 + 0.03, L / 2);
    ramp.add(deco);
    const lip = new THREE.Mesh(
      new THREE.BoxGeometry(W, 0.14, 0.14),
      new THREE.MeshBasicMaterial({ color: COLORS.accent, toneMapped: false })
    );
    lip.position.set(0, H, L);
    ramp.add(lip);

    const sign = this.label(
      [
        { text: "STUNT RAMP", font: `800 84px ${FONT_DISPLAY}`, y: 84, color: "#ffffff" },
        { text: "HIT IT WITH NITRO", font: `600 28px ${FONT_MONO}`, y: 148, color: "#ffc35a" },
      ],
      "#ffc35a",
      512
    );
    sign.scale.set(8, 3, 1);
    sign.position.set(RAMP.x + 10, 6, RAMP.z);
  }

  buildCones() {
    const spots = [];
    // A bowling-pin triangle behind the name, pointing at the spawn
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k <= row; k++) spots.push([(k - row / 2) * 1.6, -22 - row * 1.5]);
    }
    // A slalom line on the west side of the plaza
    for (let k = 0; k < 8; k++) spots.push([-48 + (k % 2) * 2.4, -14 + k * 4]);
    this.coneHome = spots;
    this.cones = spots.map(([x, z]) => ({ x, z, vx: 0, vz: 0, tilt: 0, ax: 1, az: 0, down: false }));

    const geo = new THREE.ConeGeometry(0.38, 1, 12).translate(0, 0.5, 0);
    this.coneMesh = new THREE.InstancedMesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0xff6a1a, emissive: 0x5a1800, roughness: 0.5 }),
      spots.length
    );
    this.coneMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.coneMesh);
    this.coneDummy = new THREE.Object3D();
    this.coneAxis = new THREE.Vector3();
    this.cones.forEach((c, i) => this.writeCone(c, i));
  }

  writeCone(c, i) {
    const d = this.coneDummy;
    d.position.set(c.x, 0, c.z);
    this.coneAxis.set(c.ax, 0, c.az);
    d.quaternion.setFromAxisAngle(this.coneAxis, c.tilt);
    d.updateMatrix();
    this.coneMesh.setMatrixAt(i, d.matrix);
    this.coneMesh.instanceMatrix.needsUpdate = true;
  }

  buildPools() {
    const pools = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: this.glow,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      this.pools.length
    );
    const d = new THREE.Object3D();
    const col = new THREE.Color();
    this.pools.forEach((p, i) => {
      d.position.set(p.x, 0.035, p.z);
      d.scale.set(p.size, 1, p.size);
      d.updateMatrix();
      pools.setMatrixAt(i, d.matrix);
      pools.setColorAt(i, col.set(p.color).multiplyScalar(p.strength));
    });
    this.scene.add(pools);
  }

  buildCar() {
    const car = new THREE.Group();
    const body = new THREE.Group();
    car.add(body);

    this.paint = new THREE.MeshStandardMaterial({
      color: COLORS.accent,
      metalness: 0.55,
      roughness: 0.3,
      emissive: COLORS.accent,
      emissiveIntensity: 0.12,
    });
    const dark = new THREE.MeshStandardMaterial({ color: 0x0b0d12, metalness: 0.3, roughness: 0.7 });
    const glass = new THREE.MeshStandardMaterial({
      color: 0x0d1a26,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0a2a3a,
      emissiveIntensity: 0.8,
    });
    const add = (geo, mat, x, y, z, parent = body) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      parent.add(m);
      return m;
    };

    add(new THREE.BoxGeometry(2, 0.5, 4.3), this.paint, 0, 0.62, 0);
    add(new THREE.BoxGeometry(1.94, 0.22, 1.2), this.paint, 0, 0.92, 1.4);
    add(new THREE.BoxGeometry(1.7, 0.5, 2), glass, 0, 1.12, -0.25);
    add(new THREE.BoxGeometry(1.6, 0.07, 1.7), this.paint, 0, 1.4, -0.3);
    add(new THREE.BoxGeometry(2.06, 0.16, 3.2), dark, 0, 0.38, 0);
    add(new THREE.BoxGeometry(1.9, 0.06, 0.36), this.paint, 0, 1.22, -1.98);
    add(new THREE.BoxGeometry(0.08, 0.3, 0.12), dark, 0.6, 1.03, -1.98);
    add(new THREE.BoxGeometry(0.08, 0.3, 0.12), dark, -0.6, 1.03, -1.98);
    const stripe = new THREE.MeshBasicMaterial({ color: 0xffffff });
    add(new THREE.BoxGeometry(0.22, 0.02, 4.32), stripe, 0.28, 0.88, 0);
    add(new THREE.BoxGeometry(0.22, 0.02, 4.32), stripe, -0.28, 0.88, 0);

    const head = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    add(new THREE.BoxGeometry(0.5, 0.14, 0.06), head, 0.62, 0.72, 2.16);
    add(new THREE.BoxGeometry(0.5, 0.14, 0.06), head, -0.62, 0.72, 2.16);
    this.tail = new THREE.MeshBasicMaterial({ color: 0x7a0d18, toneMapped: false });
    add(new THREE.BoxGeometry(0.62, 0.12, 0.06), this.tail, 0.6, 0.74, -2.16);
    add(new THREE.BoxGeometry(0.62, 0.12, 0.06), this.tail, -0.6, 0.74, -2.16);

    // Wheels: a tire plus a cross bar so the spin reads
    const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.34, 16).rotateZ(Math.PI / 2);
    const hubGeo = new THREE.BoxGeometry(0.36, 0.5, 0.1);
    const hub = new THREE.MeshBasicMaterial({ color: 0x8a90a0 });
    this.wheels = [];
    this.frontPivots = [];
    [
      [1.0, 1.35, true],
      [-1.0, 1.35, true],
      [1.0, -1.35, false],
      [-1.0, -1.35, false],
    ].forEach(([x, z, front]) => {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0.42, z);
      body.add(pivot);
      const wheel = new THREE.Group();
      wheel.add(new THREE.Mesh(tireGeo, dark));
      wheel.add(new THREE.Mesh(hubGeo, hub));
      pivot.add(wheel);
      this.wheels.push(wheel);
      if (front) this.frontPivots.push(pivot);
    });

    // Nitro flames
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff8a3d,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.flames = [0.5, -0.5].map((x) => {
      const f = add(new THREE.ConeGeometry(0.16, 1, 8).rotateX(-Math.PI / 2).translate(0, 0, -0.5), flameMat, x, 0.45, -2.2);
      f.visible = false;
      return f;
    });
    this.flameMat = flameMat;

    // God-mode aura
    this.aura = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 2.4, 4.6, 24, 1, true),
      new THREE.MeshBasicMaterial({
        map: this.beam,
        color: COLORS.gold,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    this.aura.position.y = 2;
    this.aura.visible = false;
    car.add(this.aura);

    // Decals that stay on the ground under the car: shadow, underglow, headlight pool
    const decals = new THREE.Group();
    const decal = (w, l, z, color, opacity, additive) =>
      new THREE.Mesh(
        new THREE.PlaneGeometry(w, l).rotateX(-Math.PI / 2).translate(0, 0, z),
        new THREE.MeshBasicMaterial({
          map: this.glow,
          color,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        })
      );
    this.shadow = decal(3.4, 6, 0, 0x000000, 0.8, false);
    this.underglow = decal(4.4, 7, 0, COLORS.cyan, 0.6, true);
    this.beamPool = decal(9, 16, 10, 0xfff0d8, 0.24, true);
    decals.add(this.shadow, this.underglow, this.beamPool);
    this.scene.add(decals);
    this.decals = decals;

    this.scene.add(car);
    this.car = car;
    this.body = body;

    this.scene.add(new THREE.HemisphereLight(0x8fa6ff, 0x1a0c08, 1.1));
    const moon = new THREE.DirectionalLight(0xffd7b8, 1.6);
    moon.position.set(-40, 60, -80);
    this.scene.add(moon);
  }

  buildEffects() {
    // Glowing drift trails: instanced quads whose color fades every frame
    this.trailMax = 900;
    this.trails = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.34, 0.6).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      this.trailMax
    );
    this.trails.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const black = new THREE.Color(0, 0, 0);
    for (let i = 0; i < this.trailMax; i++) this.trails.setColorAt(i, black);
    this.trails.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.trails.count = 0;
    this.trails.frustumCulled = false;
    this.trailN = 0;
    this.trailDist = 0;
    this.trailColor = new THREE.Color(COLORS.accent);
    this.scene.add(this.trails);

    // Sparks, smoke and confetti share one additive point cloud
    const n = 500;
    this.pMax = n;
    this.pPos = new Float32Array(n * 3).fill(-999);
    this.pCol = new Float32Array(n * 3);
    this.pVel = new Float32Array(n * 3);
    this.pBase = new Float32Array(n * 3);
    this.pLife = new Float32Array(n);
    this.pMaxLife = new Float32Array(n).fill(1);
    this.pGrav = new Float32Array(n);
    this.pN = 0;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.pPos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("color", new THREE.BufferAttribute(this.pCol, 3).setUsage(THREE.DynamicDrawUsage));
    this.particles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.55,
        map: this.glow,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.particles.frustumCulled = false;
    this.scene.add(this.particles);
  }

  // Static part of the minimap, drawn once
  buildMinimap() {
    if (!this.minimap) return;
    const W = this.minimap.width;
    const base = makeCanvas(W, W);
    const g = base.getContext("2d");
    const c = W / 2;
    const s = (W / 2 - 4) / (WORLD_R + 4);
    this.mapScale = s;
    g.fillStyle = "rgba(5,6,8,0.82)";
    g.beginPath();
    g.arc(c, c, c - 1, 0, TAU);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.13)";
    g.lineWidth = RING_W * s;
    g.beginPath();
    g.arc(c, c, RING_R * s, 0, TAU);
    g.stroke();
    g.strokeStyle = "rgba(255,90,31,0.55)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(c, c, WORLD_R * s, 0, TAU);
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)";
    this.boards.forEach((b) => {
      g.save();
      g.translate(c + b.x * s, c + b.z * s);
      g.rotate(Math.atan2(b.nz, b.nx));
      g.fillRect(-1.5, -7 * s, 3, 14 * s);
      g.restore();
    });
    g.fillStyle = "#46e08c";
    g.fillRect(c + (PARK.x - 1.5) * s, c + (PARK.z - 3) * s, 3 * s, 6 * s);
    g.fillStyle = "#ffc35a";
    const rr = this.ramp;
    g.beginPath();
    g.moveTo(c + (rr.ox + rr.rx * 4) * s, c + (rr.oz + rr.rz * 4) * s);
    g.lineTo(c + (rr.ox - rr.rx * 4) * s, c + (rr.oz - rr.rz * 4) * s);
    g.lineTo(c + (rr.ox + rr.fx * RAMP.length) * s, c + (rr.oz + rr.fz * RAMP.length) * s);
    g.fill();
    this.zones.forEach((z) => {
      g.fillStyle = z.color;
      g.beginPath();
      g.arc(c + z.x * s, c + z.z * s, 4, 0, TAU);
      g.fill();
    });
    this.mapBase = base;
  }

  /* ---------- Public API ---------- */

  start() {
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.canvas);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
    });
    this.io.observe(this.canvas);
    this.resize();
  }

  setDriving(on) {
    if (on === this.driving) return;
    this.driving = on;
    Object.keys(this.keys).forEach((k) => {
      this.keys[k] = false;
    });
    if (on) {
      window.addEventListener("keydown", this.onKeyDown);
      window.addEventListener("keyup", this.onKeyUp);
      window.addEventListener("blur", this.onBlur);
      this.resetCar();
      this.resetCones();
      this.snapCamera();
    } else {
      window.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener("keyup", this.onKeyUp);
      window.removeEventListener("blur", this.onBlur);
      this.bankCombo(true);
      this.setZone(null);
      this.setBoard(null);
    }
  }

  setKey(name, down) {
    if (name in this.keys) this.keys[name] = down;
  }

  setGod(on) {
    this.god = on;
    const c = on ? 0xffb020 : COLORS.accent;
    this.paint.color.set(c);
    this.paint.emissive.set(c);
    this.underglow.material.color.set(on ? COLORS.gold : COLORS.cyan);
    this.trailColor.set(on ? COLORS.gold : COLORS.accent);
    this.aura.visible = on;
    if (on) this.s.boost = 1;
  }

  resetCar() {
    this.s = {
      x: SPAWN.x,
      z: SPAWN.z,
      y: 0,
      vx: 0,
      vz: 0,
      vy: 0,
      heading: SPAWN.heading,
      steer: 0,
      grounded: true,
      onRamp: false,
      air: 0,
      boost: 1,
      vF: 0,
      vL: 0,
      combo: 0,
      mult: 1,
      driftTime: 0,
      idle: 0,
      score: this.s ? this.s.score : 0,
      parkT: 0,
      stuck: 0,
      pitch: 0,
      roll: 0,
      knocked: this.s ? this.s.knocked : 0,
    };
  }

  resetCones() {
    this.cones.forEach((c, i) => {
      const [x, z] = this.coneHome[i];
      Object.assign(c, { x, z, vx: 0, vz: 0, tilt: 0, down: false });
      this.writeCone(c, i);
    });
  }

  placeOnRing(angle) {
    const [x, z] = polar(angle, RING_R);
    Object.assign(this.s, { x, z, heading: angle + Math.PI / 2, vx: 0, vz: 0, y: 0, vy: 0 });
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    if (this.ro) this.ro.disconnect();
    if (this.io) this.io.disconnect();
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    if (this.scene.background && this.scene.background.dispose) this.scene.background.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  /* ---------- Input ---------- */

  onKeyDown(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = KEYMAP[e.code];
    if (k) {
      this.keys[k] = true;
      e.preventDefault();
      return;
    }
    if (e.code === "Escape") {
      e.preventDefault();
      this.on.exit();
    } else if (e.code === "KeyR") {
      this.resetCar();
      this.snapCamera();
    } else if ((e.code === "KeyE" || e.code === "Enter") && this.zone) {
      e.preventDefault();
      this.on.enter(this.zone);
    }
  }

  onKeyUp(e) {
    const k = KEYMAP[e.code];
    if (k) this.keys[k] = false;
  }

  onBlur() {
    Object.keys(this.keys).forEach((k) => {
      this.keys[k] = false;
    });
  }

  readInput() {
    const inp = this.input;
    const s = this.s;
    if (this.driving) {
      const k = this.keys;
      inp.throttle = k.up ? 1 : 0;
      inp.brake = k.down ? 1 : 0;
      inp.steer = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      inp.drift = k.drift;
      inp.boost = k.boost;
      return;
    }
    // Demo autopilot: chase a point a little ahead on the ring road, and hit the ramp with nitro
    const phi = Math.atan2(s.x, s.z);
    const [tx, tz] = polar(phi + 0.3, RING_R);
    const want = Math.atan2(tx - s.x, tz - s.z);
    const diff = wrapAngle(want - s.heading);
    const speed = Math.hypot(s.vx, s.vz);
    inp.steer = clamp(-diff * 2.4, -1, 1);
    inp.throttle = speed < 24 || Math.abs(diff) > 0.6 ? 1 : 0;
    inp.brake = 0;
    inp.drift = false;
    const toRamp = wrapAngle(Math.PI / 2 - phi);
    inp.boost = toRamp > 0 && toRamp < 0.5;
  }

  /* ---------- Simulation ---------- */

  groundAt(x, z) {
    const r = this.ramp;
    const dx = x - r.ox;
    const dz = z - r.oz;
    const u = dx * r.fx + dz * r.fz;
    const w = dx * r.rx + dz * r.rz;
    if (u >= 0 && u <= RAMP.length && Math.abs(w) <= RAMP.width / 2) {
      return (RAMP.height * u) / RAMP.length;
    }
    return 0;
  }

  // Keeps the car out of the ramp's tall sides and back face
  rampWalls(s) {
    const r = this.ramp;
    const dx = s.x - r.ox;
    const dz = s.z - r.oz;
    const u = dx * r.fx + dz * r.fz;
    const w = dx * r.rx + dz * r.rz;
    const half = RAMP.width / 2 + 1;
    if (u < 0 || u > RAMP.length + 2.1 || Math.abs(w) > half) return;
    const h = (RAMP.height * clamp(u, 0, RAMP.length)) / RAMP.length;
    if (s.y >= h - 0.5) return;
    const side = half - Math.abs(w);
    const back = RAMP.length + 2.1 - u;
    let nx;
    let nz;
    let push;
    if (side < back) {
      const sign = Math.sign(w) || 1;
      nx = r.rx * sign;
      nz = r.rz * sign;
      push = side;
    } else {
      nx = r.fx;
      nz = r.fz;
      push = back;
    }
    s.x += nx * push;
    s.z += nz * push;
    this.bounce(s, nx, nz);
  }

  bounce(s, nx, nz) {
    const vn = s.vx * nx + s.vz * nz;
    if (vn >= 0) return;
    s.vx -= 1.4 * vn * nx;
    s.vz -= 1.4 * vn * nz;
    this.impact(-vn, s.x - nx * CAR_R, s.z - nz * CAR_R);
  }

  impact(v, x, z) {
    if (v < 4) return;
    this.shake = Math.min(1, this.shake + v / 22);
    for (let i = 0; i < Math.min(24, v * 1.5); i++) {
      this.emit(x, 0.8, z, (Math.random() - 0.5) * 10, Math.random() * 6, (Math.random() - 0.5) * 10, 1, 0.7, 0.3, 0.5, 14);
    }
    if (this.driving) {
      this.on.impact();
      if (v > 9) this.dropCombo();
    }
  }

  step(dt) {
    const s = this.s;
    const inp = this.input;
    const fx = Math.sin(s.heading);
    const fz = Math.cos(s.heading);
    const rx = fz;
    const rz = -fx;
    let vF = s.vx * fx + s.vz * fz;
    let vL = s.vx * rx + s.vz * rz;
    const infinite = this.god || !this.driving;
    const boosting = inp.boost && s.grounded && (infinite || s.boost > 0.01);

    if (s.grounded) {
      const top = boosting ? BOOST_SPEED : MAX_SPEED;
      if (inp.throttle) {
        if (vF < 0) vF += BRAKE * dt;
        else vF += (boosting ? BOOST_ACCEL : ACCEL) * dt * Math.max(0, 1 - vF / top);
      }
      if (inp.brake) {
        if (vF > 0.5) vF -= BRAKE * dt;
        else vF = Math.max(-REVERSE_SPEED, vF - ACCEL * 0.6 * dt);
      }
      if (!inp.throttle && !inp.brake) vF *= Math.exp(-0.9 * dt);
      if (vF > top) vF = damp(vF, top, 1.5, dt);

      const speed = Math.abs(vF);
      const maxSteer = lerp(0.55, 0.13, clamp(speed / 36, 0, 1));
      s.steer = damp(s.steer, inp.steer * maxSteer, 10, dt);
      let yaw = -(vF / WHEELBASE) * Math.tan(s.steer);
      if (inp.drift && speed > 6) {
        yaw *= 1.7;
        vF *= Math.exp(-0.3 * dt);
      }
      const grip = inp.drift ? 1.3 : speed > 26 ? 5 : 9;
      vL *= Math.exp(-grip * dt);
      // Velocity stays in world space while the car rotates: that difference is the slide
      s.vx = fx * vF + rx * vL;
      s.vz = fz * vF + rz * vL;
      s.heading += yaw * dt;
    }

    if (boosting && !infinite) s.boost = Math.max(0, s.boost - 0.3 * dt);
    else if (!inp.boost) s.boost = Math.min(1, s.boost + 0.09 * dt);
    s.boosting = boosting;
    s.vF = vF;
    s.vL = vL;

    s.x += s.vx * dt;
    s.z += s.vz * dt;

    // Vertical: snap to the ground (or ramp) while grounded, fall while airborne
    const gh = this.groundAt(s.x, s.z);
    if (s.y > gh + 0.02) {
      s.vy -= GRAVITY * dt;
      s.y += s.vy * dt;
      s.air += dt;
      s.grounded = false;
      if (s.y <= gh) this.land(gh);
    } else {
      s.vy = (gh - s.y) / dt;
      s.y = gh;
      s.grounded = true;
      s.onRamp = gh > 0;
    }

    this.rampWalls(s);

    for (let i = 0; i < this.obstacles.length; i++) {
      const o = this.obstacles[i];
      const dx = s.x - o.x;
      const dz = s.z - o.z;
      const min = o.r + CAR_R;
      const d2 = dx * dx + dz * dz;
      if (d2 < min * min && s.y < o.h) {
        const d = Math.sqrt(d2) || 0.001;
        const nx = dx / d;
        const nz = dz / d;
        s.x = o.x + nx * min;
        s.z = o.z + nz * min;
        this.bounce(s, nx, nz);
      }
    }

    const r = Math.hypot(s.x, s.z);
    if (r > WORLD_R) {
      const nx = -s.x / r;
      const nz = -s.z / r;
      s.x = -nx * WORLD_R;
      s.z = -nz * WORLD_R;
      this.bounce(s, nx, nz);
    }

    this.stepCones(dt);
    if (this.driving) this.stepDrift(dt);
  }

  land(gh) {
    const s = this.s;
    const air = s.air;
    s.y = gh;
    s.vy = 0;
    s.air = 0;
    s.grounded = true;
    if (air > 0.3) {
      this.shake = Math.min(1, this.shake + air * 0.8);
      for (let i = 0; i < 30; i++) {
        const a = Math.random() * TAU;
        this.emit(s.x, 0.3, s.z, Math.cos(a) * 8, Math.random() * 3, Math.sin(a) * 8, 0.6, 0.75, 1, 0.6, 4);
      }
      if (this.driving) this.on.impact();
    }
    if (air >= AIR_GOAL) this.complete("jump");
  }

  stepCones(dt) {
    const s = this.s;
    for (let i = 0; i < this.cones.length; i++) {
      const c = this.cones[i];
      const dx = c.x - s.x;
      const dz = c.z - s.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < (CAR_R + 0.5) ** 2 && s.y < 1.2) {
        const d = Math.sqrt(d2) || 0.001;
        const kick = Math.max(4, Math.hypot(s.vx, s.vz) * 1.15);
        c.x = s.x + (dx / d) * (CAR_R + 0.5);
        c.z = s.z + (dz / d) * (CAR_R + 0.5);
        this.knock(c, (dx / d) * kick * 0.6 + s.vx * 0.6, (dz / d) * kick * 0.6 + s.vz * 0.6);
      }
    }
    for (let i = 0; i < this.cones.length; i++) {
      const c = this.cones[i];
      if (!c.down || (c.tilt >= Math.PI / 2 && !c.vx && !c.vz)) continue;
      c.x += c.vx * dt;
      c.z += c.vz * dt;
      const f = Math.exp(-2.4 * dt);
      c.vx *= f;
      c.vz *= f;
      const speed = Math.abs(c.vx) + Math.abs(c.vz);
      if (speed < 0.05) {
        c.vx = 0;
        c.vz = 0;
      }
      c.tilt = Math.min(Math.PI / 2, c.tilt + 9 * dt);
      c.dirty = true;
      // Flying cones knock over standing ones, like bowling pins
      if (speed > 1.5) {
        for (let j = 0; j < this.cones.length; j++) {
          const o = this.cones[j];
          if (o.down || (o.x - c.x) ** 2 + (o.z - c.z) ** 2 > 0.85) continue;
          this.knock(o, c.vx * 0.75 + (Math.random() - 0.5) * 4, c.vz * 0.75 + (Math.random() - 0.5) * 4);
        }
      }
    }
  }

  knock(c, vx, vz) {
    c.vx = vx;
    c.vz = vz;
    if (c.down) return;
    c.down = true;
    const m = Math.hypot(vx, vz) || 1;
    // Tip over away from whatever hit it
    c.ax = vz / m;
    c.az = -vx / m;
    for (let k = 0; k < 10; k++) {
      this.emit(c.x, 0.6, c.z, vx * 0.3 + (Math.random() - 0.5) * 6, Math.random() * 6, vz * 0.3 + (Math.random() - 0.5) * 6, 1, 0.45, 0.1, 0.6, 12);
    }
    if (this.driving) {
      this.s.knocked += 1;
      this.on.impact();
      if (this.s.knocked >= CONE_GOAL) this.complete("cones");
    }
  }

  stepDrift(dt) {
    const s = this.s;
    const speed = Math.hypot(s.vx, s.vz);
    const slip = Math.abs(s.vL);
    s.drifting = s.grounded && speed > 8 && slip > 2.6;
    if (s.drifting) {
      s.driftTime += dt;
      s.idle = 0;
      s.mult = Math.min(5, 1 + Math.floor(s.driftTime / 1.2));
      s.combo += slip * speed * 3 * s.mult * dt;
    } else if (s.combo > 0) {
      s.idle += dt;
      if (s.idle > 1) this.bankCombo();
    }
  }

  bankCombo(silent) {
    const s = this.s;
    if (s.combo > 0) {
      s.score += Math.round(s.combo);
      if (!silent && this.on.bank) this.on.bank(Math.round(s.combo));
    }
    s.combo = 0;
    s.driftTime = 0;
    s.mult = 1;
    if (s.score >= DRIFT_GOAL) this.complete("drift");
  }

  dropCombo() {
    const s = this.s;
    if (s.combo > 0 && this.on.drop) this.on.drop();
    s.combo = 0;
    s.driftTime = 0;
    s.mult = 1;
  }

  complete(key) {
    if (!this.driving || this.done[key]) return;
    this.done[key] = true;
    const s = this.s;
    // Confetti burst around the car
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * TAU;
      const sp = 3 + Math.random() * 7;
      const pal = [[1, 0.35, 0.12], [1, 0.76, 0.35], [0.3, 0.85, 1], [0.27, 0.88, 0.55]][i % 4];
      this.emit(s.x, s.y + 1.5, s.z, Math.cos(a) * sp, 6 + Math.random() * 8, Math.sin(a) * sp, pal[0], pal[1], pal[2], 1.4, 12);
    }
    this.on.objective(key);
  }

  setZone(id) {
    if (id === this.zone) return;
    this.zone = id;
    this.on.zone(id);
  }

  setBoard(i) {
    if (i === this.board) return;
    this.board = i;
    this.on.board(i);
  }

  /* ---------- Per-frame ---------- */

  frame(now) {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.visible || document.hidden) return;
    this.time += dt;

    this.readInput();
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < 8) {
      this.step(STEP);
      this.acc -= STEP;
      steps += 1;
    }
    if (steps === 8) this.acc = 0;

    this.checkWorld(dt);
    this.updateCar(dt);
    this.updateEffects(dt);
    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
    this.measure(now);
    if (this.minimap && this.driving) this.drawMinimap();
    this.reportHud();
  }

  checkWorld(dt) {
    const s = this.s;
    const speed = Math.hypot(s.vx, s.vz);
    if (!this.driving) {
      // Unstick the demo car if it ever wedges against something
      s.stuck = speed < 2 ? s.stuck + dt : 0;
      if (s.stuck > 2.5) {
        this.placeOnRing(Math.atan2(s.x, s.z));
        s.stuck = 0;
      }
      return;
    }

    let zone = null;
    for (let i = 0; i < this.zones.length; i++) {
      const z = this.zones[i];
      if ((s.x - z.x) ** 2 + (s.z - z.z) ** 2 < ZONE_HIT * ZONE_HIT) zone = z.id;
    }
    this.setZone(zone);
    if (zone) this.complete("zone");

    let board = null;
    let best = 15;
    this.boards.forEach((b) => {
      const dx = s.x - b.x;
      const dz = s.z - b.z;
      const d = Math.hypot(dx, dz);
      if (d < best && dx * b.nx + dz * b.nz > -2) {
        best = d;
        board = b.index;
      }
    });
    this.setBoard(board);

    const inBay =
      Math.abs(s.x - PARK.x) < 0.75 &&
      Math.abs(s.z - PARK.z) < 1.3 &&
      Math.abs(Math.cos(s.heading)) > 0.96 &&
      speed < 0.8 &&
      s.grounded;
    s.parkT = inBay ? s.parkT + dt : 0;
    s.inBay = inBay;
    if (s.parkT > 0.6) this.complete("park");
  }

  updateCar(dt) {
    const s = this.s;
    const car = this.car;
    car.position.set(s.x, s.y, s.z);
    car.rotation.y = s.heading;

    let pitch = 0;
    if (s.onRamp && s.grounded) {
      const facing = Math.sin(s.heading) * this.ramp.fx + Math.cos(s.heading) * this.ramp.fz;
      pitch = -Math.atan2(RAMP.height, RAMP.length) * facing;
    } else if (!s.grounded) {
      pitch = clamp(-s.vy * 0.03, -0.4, 0.4);
    }
    s.pitch = damp(s.pitch, pitch, s.grounded ? 14 : 4, dt);
    const speed = Math.hypot(s.vx, s.vz);
    const roll = clamp(-s.steer * speed * 0.012 + s.vL * 0.012, -0.14, 0.14);
    s.roll = damp(s.roll, roll, 8, dt);
    this.body.rotation.set(s.pitch, 0, s.roll);

    const spin = (s.vF * dt) / 0.42;
    this.wheels.forEach((w) => {
      w.rotation.x += spin;
    });
    this.frontPivots.forEach((p) => {
      p.rotation.y = -s.steer * 1.4;
    });

    this.tail.color.set(this.input.brake && s.vF > 0.5 ? 0xff2040 : 0x7a0d18);

    const gh = this.groundAt(s.x, s.z);
    const lift = s.y - gh;
    this.decals.position.set(s.x, gh + 0.04, s.z);
    this.decals.rotation.y = s.heading;
    this.shadow.material.opacity = 0.8 * Math.max(0.15, 1 - lift / 6);
    this.underglow.material.opacity = 0.6 * Math.max(0, 1 - lift / 3);
    this.beamPool.material.opacity = 0.24 * Math.max(0, 1 - lift / 3);

    this.flames.forEach((f) => {
      f.visible = !!s.boosting;
      if (s.boosting) f.scale.set(1, 1, 0.8 + Math.random() * 0.9);
    });
    this.flameMat.color.set(this.god ? 0xffd27a : 0xff8a3d);

    if (this.god) {
      const t = this.time;
      const pulse = 1 + Math.sin(t * 18) * 0.06 + (s.boosting ? 0.25 : 0);
      this.aura.scale.set(pulse, 1 + Math.sin(t * 11) * 0.08, pulse);
      this.aura.material.opacity = 0.55 + Math.random() * 0.25;
      if (Math.random() < 0.6) {
        const a = Math.random() * TAU;
        this.emit(s.x + Math.cos(a) * 1.6, s.y + 0.3, s.z + Math.sin(a) * 1.6, 0, 4 + Math.random() * 4, 0, 1, 0.78, 0.35, 0.8, -2);
      }
    }
  }

  updateEffects(dt) {
    const s = this.s;
    const t = this.time;

    // Mission markers pulse; their labels bob. Beams fade out as the camera nears them so
    // driving through one doesn't wash the whole screen in color.
    const d = this.coneDummy;
    const cam = this.camera.position;
    const col = this.tmpColor || (this.tmpColor = new THREE.Color());
    this.zones.forEach((z, i) => {
      const near = Math.hypot(cam.x - z.x, cam.z - z.z);
      const fade = clamp((near - 3) / 9, 0.06, 1);
      this.zoneBeams.setColorAt(i, col.set(z.color).multiplyScalar(fade));
      const active = this.zone === z.id;
      const pulse = 1 + Math.sin(t * 2.4 + i) * 0.05 + (active ? 0.18 : 0);
      d.position.set(z.x, 0.04, z.z);
      d.quaternion.identity();
      d.scale.set(pulse, active ? 1.3 : 1, pulse);
      d.updateMatrix();
      this.zoneBeams.setMatrixAt(i, d.matrix);
      z.sprite.position.y = 9 + Math.sin(t * 1.8 + i) * 0.3;
    });
    d.scale.set(1, 1, 1);
    this.zoneBeams.instanceMatrix.needsUpdate = true;
    this.zoneBeams.instanceColor.needsUpdate = true;

    const inBay = this.driving && s.inBay;
    this.bay.material.opacity = inBay ? 1 : 0.45 + Math.sin(t * 4) * 0.25;
    this.bay.material.color.set(this.done.park ? COLORS.gold : COLORS.green);

    this.cones.forEach((c, i) => {
      if (c.dirty) {
        this.writeCone(c, i);
        c.dirty = false;
      }
    });

    // Drift trails from both rear wheels
    const speed = Math.hypot(s.vx, s.vz);
    const sliding = s.grounded && speed > 6 && (Math.abs(s.vL) > 2.6 || (this.input.drift && this.driving));
    const colors = this.trails.instanceColor.array;
    const fade = Math.exp(-dt * 0.35);
    for (let i = 0; i < this.trails.count * 3; i++) colors[i] *= fade;
    this.trails.instanceColor.needsUpdate = true;
    if (sliding) {
      this.trailDist += speed * dt;
      if (this.trailDist > 0.3) {
        this.trailDist = 0;
        const fx = Math.sin(s.heading);
        const fz = Math.cos(s.heading);
        [1, -1].forEach((side) => {
          const x = s.x - fx * 1.35 + fz * 0.95 * side;
          const z = s.z - fz * 1.35 - fx * 0.95 * side;
          this.addTrail(x, this.groundAt(x, z) + 0.03, z, s.heading);
          if (Math.random() < 0.5) {
            this.emit(x, 0.3, z, (Math.random() - 0.5) * 2, 1 + Math.random() * 2, (Math.random() - 0.5) * 2, 0.35, 0.36, 0.42, 0.9, -1);
          }
        });
      }
    }

    if (s.boosting) {
      const fx = Math.sin(s.heading);
      const fz = Math.cos(s.heading);
      const c = this.god ? [1, 0.8, 0.4] : [1, 0.45, 0.15];
      [0.5, -0.5].forEach((ox) => {
        this.emit(
          s.x - fx * 2.8 + fz * ox,
          s.y + 0.45,
          s.z - fz * 2.8 - fx * ox,
          -s.vx * 0.2 + (Math.random() - 0.5) * 2,
          Math.random() * 1.5,
          -s.vz * 0.2 + (Math.random() - 0.5) * 2,
          c[0],
          c[1],
          c[2],
          0.35,
          0
        );
      });
    }

    this.updateParticles(dt);
  }

  addTrail(x, y, z, heading) {
    const d = this.coneDummy;
    d.position.set(x, y, z);
    d.quaternion.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, heading);
    d.updateMatrix();
    const i = this.trailN % this.trailMax;
    this.trails.setMatrixAt(i, d.matrix);
    this.trails.setColorAt(i, this.trailColor);
    this.trailN += 1;
    this.trails.count = Math.min(this.trailN, this.trailMax);
    this.trails.instanceMatrix.needsUpdate = true;
  }

  emit(x, y, z, vx, vy, vz, r, g, b, life, gravity) {
    const i = this.pN % this.pMax;
    this.pN += 1;
    const k = i * 3;
    this.pPos[k] = x;
    this.pPos[k + 1] = y;
    this.pPos[k + 2] = z;
    this.pVel[k] = vx;
    this.pVel[k + 1] = vy;
    this.pVel[k + 2] = vz;
    this.pBase[k] = r;
    this.pBase[k + 1] = g;
    this.pBase[k + 2] = b;
    this.pLife[i] = life;
    this.pMaxLife[i] = life;
    this.pGrav[i] = gravity;
  }

  updateParticles(dt) {
    const drag = Math.exp(-1.8 * dt);
    for (let i = 0; i < this.pMax; i++) {
      if (this.pLife[i] <= 0) continue;
      const k = i * 3;
      this.pLife[i] -= dt;
      const life = Math.max(0, this.pLife[i] / this.pMaxLife[i]);
      this.pVel[k + 1] -= this.pGrav[i] * dt;
      this.pVel[k] *= drag;
      this.pVel[k + 2] *= drag;
      this.pPos[k] += this.pVel[k] * dt;
      this.pPos[k + 1] = Math.max(0.05, this.pPos[k + 1] + this.pVel[k + 1] * dt);
      this.pPos[k + 2] += this.pVel[k + 2] * dt;
      this.pCol[k] = this.pBase[k] * life;
      this.pCol[k + 1] = this.pBase[k + 1] * life;
      this.pCol[k + 2] = this.pBase[k + 2] * life;
    }
    const geo = this.particles.geometry;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  }

  snapCamera() {
    this.camYaw = this.s.heading;
    this.camPos = null;
  }

  updateCamera(dt) {
    const s = this.s;
    const cam = this.camera;
    const speed = Math.hypot(s.vx, s.vz);
    const t = this.time;
    let yaw;
    let dist;
    let height;
    if (this.driving) {
      this.camYaw = this.camYaw + wrapAngle(s.heading - this.camYaw) * (1 - Math.exp(-4.5 * dt));
      yaw = this.camYaw;
      dist = 8.5 + speed * 0.07;
      height = 3.4 + speed * 0.03;
    } else {
      // Slow cinematic sweep around the demo car
      this.camYaw = this.camYaw + wrapAngle(s.heading - this.camYaw) * (1 - Math.exp(-2 * dt));
      yaw = this.camYaw + Math.sin(t * 0.11) * 1.5;
      dist = 12 + Math.sin(t * 0.07) * 3;
      height = 4.5 + Math.sin(t * 0.09 + 1) * 2;
    }
    // Portrait screens see a narrow slice horizontally: pull back and widen the view
    const portrait = clamp((1 - (this.width || 1) / (this.height || 1)) / 0.55, 0, 1);
    dist *= 1 + portrait * 0.45;
    height *= 1 + portrait * 0.5;
    const tx = s.x - Math.sin(yaw) * dist;
    const tz = s.z - Math.cos(yaw) * dist;
    const ty = Math.max(1.2, s.y * 0.6 + height);
    if (!this.camPos) {
      this.camPos = new THREE.Vector3(tx, ty, tz);
      this.camLook = new THREE.Vector3(s.x, s.y + 1, s.z);
    }
    const k = 1 - Math.exp(-(this.driving ? 7 : 3) * dt);
    this.camPos.x += (tx - this.camPos.x) * k;
    this.camPos.y += (ty - this.camPos.y) * k;
    this.camPos.z += (tz - this.camPos.z) * k;
    const lk = 1 - Math.exp(-10 * dt);
    this.camLook.x += (s.x + Math.sin(s.heading) * 4 - this.camLook.x) * lk;
    this.camLook.y += (s.y * 0.7 + 1.2 - this.camLook.y) * lk;
    this.camLook.z += (s.z + Math.cos(s.heading) * 4 - this.camLook.z) * lk;

    this.shake = Math.max(0, this.shake - dt * 2.2);
    const sh = this.shake * this.shake * 0.6;
    cam.position.set(
      this.camPos.x + (Math.random() - 0.5) * sh,
      this.camPos.y + (Math.random() - 0.5) * sh,
      this.camPos.z + (Math.random() - 0.5) * sh
    );
    cam.lookAt(this.camLook);

    const fov = (this.driving ? 60 + speed * 0.38 + (s.boosting ? 6 : 0) : 50) + portrait * 16;
    cam.fov = damp(cam.fov, fov, 3, dt);

    // On the title screen, push the car to the right of the text (or below it on phones)
    const w = this.width || 1;
    const h = this.height || 1;
    const wide = w > 900;
    const vx = !this.driving && wide ? -w * 0.14 : 0;
    const vy = !this.driving && !wide ? -h * 0.16 : 0;
    this.viewX = damp(this.viewX, vx, 3, dt);
    this.viewY = damp(this.viewY, vy, 3, dt);
    cam.setViewOffset(w, h, this.viewX, this.viewY, w, h);
    cam.updateProjectionMatrix();
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // FPS, draw calls and dynamic resolution: drop pixel ratio if the frame rate sags
  measure(now) {
    const p = this.perf;
    const info = this.renderer.info.render;
    p.frames += 1;
    if (!p.since) p.since = now;
    const span = now - p.since;
    if (span < 500) return;
    const fps = Math.round((p.frames * 1000) / span);
    p.frames = 0;
    p.since = now;
    p.slow = fps < 45 ? p.slow + 1 : 0;
    p.fast = fps > 57 ? p.fast + 1 : 0;
    if (p.slow >= 3 && this.ratio > 0.75) {
      this.ratio = Math.max(0.75, this.ratio - 0.25);
      this.renderer.setPixelRatio(this.ratio);
      this.resize();
      p.slow = 0;
    } else if (p.fast >= 10 && this.ratio < this.maxRatio) {
      this.ratio = Math.min(this.maxRatio, this.ratio + 0.25);
      this.renderer.setPixelRatio(this.ratio);
      this.resize();
      p.fast = 0;
    }
    this.hud.perf = {
      fps,
      calls: info.calls,
      tris: info.triangles,
      res: Math.round((this.ratio / this.maxRatio) * 100),
    };
  }

  drawMinimap() {
    const mm = this.minimap;
    const g = mm.getContext("2d");
    const W = mm.width;
    const c = W / 2;
    const sc = this.mapScale;
    const s = this.s;
    g.clearRect(0, 0, W, W);
    g.drawImage(this.mapBase, 0, 0);
    g.fillStyle = "#ff6a1a";
    this.cones.forEach((cn) => {
      if (!cn.down) g.fillRect(c + cn.x * sc - 1, c + cn.z * sc - 1, 2, 2);
    });
    if (this.zone) {
      const z = this.zones.find((zz) => zz.id === this.zone);
      g.strokeStyle = z.color;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(c + z.x * sc, c + z.z * sc, 8, 0, TAU);
      g.stroke();
    }
    const fx = Math.sin(s.heading);
    const fz = Math.cos(s.heading);
    const x = c + s.x * sc;
    const y = c + s.z * sc;
    const u = W / 150;
    g.fillStyle = this.god ? "#ffc35a" : "#ffffff";
    g.shadowColor = "rgba(255,255,255,0.8)";
    g.shadowBlur = 6;
    g.beginPath();
    g.moveTo(x + fx * 7 * u, y + fz * 7 * u);
    g.lineTo(x - fx * 4 * u + fz * 4.5 * u, y - fz * 4 * u - fx * 4.5 * u);
    g.lineTo(x - fx * 4 * u - fz * 4.5 * u, y - fz * 4 * u + fx * 4.5 * u);
    g.closePath();
    g.fill();
    g.shadowBlur = 0;
  }

  reportHud() {
    const s = this.s;
    const h = this.hud;
    h.speed = Math.hypot(s.vx, s.vz);
    h.boost = this.god ? 1 : s.boost;
    h.combo = s.combo;
    h.mult = s.mult;
    h.score = s.score;
    h.air = !s.grounded && s.air > 0.15;
    h.inBay = !!s.inBay;
    h.boosting = !!s.boosting;
    h.god = this.god;
    this.on.frame(h);
    h.perf = null;
  }
}
