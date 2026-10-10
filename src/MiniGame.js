import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiPlay, FiRotateCcw } from "react-icons/fi";

const LANES = 3;
const CAR_W = 0.5; // car width as a fraction of lane width
const CAR_H = 70;
const BEST_KEY = "sk-lane-dodger-best";
const COLORS = {
  road: "#0f141d",
  edge: "#ff5a1f",
  dash: "rgba(236, 238, 244, 0.35)",
  player: "#4fd8ff",
  enemy: ["#ff5a1f", "#b07cff", "#ffc35a", "#ff2d55"],
  coin: "#ffc35a",
};

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch (e) {
    return 0;
  }
}

function saveBest(score) {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch (e) {
    // Storage can be unavailable (private mode); the best score just won't persist
  }
}

function newWorld() {
  return {
    lane: 1,
    x: 1, // smoothed lane position used for drawing
    speed: 260,
    distance: 0,
    coins: 0,
    spawnIn: 0.6,
    dashOffset: 0,
    things: [],
    sparks: [],
  };
}

function drawCar(ctx, cx, y, w, color, isPlayer) {
  const h = CAR_H;
  const x = cx - w / 2;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 10);
  else ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.restore();

  // Windshield and rear window
  ctx.fillStyle = "rgba(10, 11, 16, 0.75)";
  const glassY = isPlayer ? y + 14 : y + h - 30;
  ctx.fillRect(x + 6, glassY, w - 12, 14);
  ctx.fillRect(x + 8, isPlayer ? y + h - 18 : y + 6, w - 16, 9);

  // Lights
  ctx.fillStyle = isPlayer ? "#fff7cc" : "#ff2d55";
  const lightY = isPlayer ? y + 2 : y + h - 6;
  ctx.fillRect(x + 4, lightY, 8, 4);
  ctx.fillRect(x + w - 12, lightY, 8, 4);
}

export default function MiniGame() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const world = useRef(newWorld());
  const size = useRef({ w: 640, h: 360, dpr: 1 });
  const [status, setStatus] = useState("idle"); // idle | playing | over
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);

  const geometry = () => {
    const { w } = size.current;
    const roadW = Math.min(w - 32, 360);
    const roadX = (w - roadW) / 2;
    const laneW = roadW / LANES;
    return { roadW, roadX, laneW, laneX: (l) => roadX + laneW * (l + 0.5) };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { w, h, dpr } = size.current;
    const s = world.current;
    const { roadW, roadX, laneW, laneX } = geometry();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Off-road grid that scrolls with the road
    ctx.strokeStyle = "rgba(255, 90, 31, 0.06)";
    ctx.lineWidth = 1;
    const cell = 32;
    const off = s.dashOffset % cell;
    ctx.beginPath();
    for (let gy = off - cell; gy < h; gy += cell) {
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
    }
    for (let gx = 0; gx < w; gx += cell) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
    }
    ctx.stroke();

    // Road
    ctx.fillStyle = COLORS.road;
    ctx.fillRect(roadX, 0, roadW, h);
    ctx.save();
    ctx.shadowColor = COLORS.edge;
    ctx.shadowBlur = 12;
    ctx.fillStyle = COLORS.edge;
    ctx.fillRect(roadX - 3, 0, 3, h);
    ctx.fillRect(roadX + roadW, 0, 3, h);
    ctx.restore();

    // Lane dashes
    ctx.fillStyle = COLORS.dash;
    const dash = 28;
    const gap = 26;
    for (let l = 1; l < LANES; l += 1) {
      const lx = roadX + laneW * l - 1.5;
      for (let dy = (s.dashOffset % (dash + gap)) - dash; dy < h; dy += dash + gap) {
        ctx.fillRect(lx, dy, 3, dash);
      }
    }

    const carW = laneW * CAR_W;

    // Traffic and coins
    s.things.forEach((t) => {
      const cx = laneX(t.lane);
      if (t.type === "coin") {
        ctx.save();
        ctx.shadowColor = COLORS.coin;
        ctx.shadowBlur = 14;
        ctx.fillStyle = COLORS.coin;
        ctx.beginPath();
        ctx.arc(cx, t.y + 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "rgba(10, 11, 16, 0.5)";
        ctx.fillRect(cx - 2, t.y + 6, 4, 12);
      } else {
        drawCar(ctx, cx, t.y, carW, t.color, false);
      }
    });

    // Player
    const px = roadX + laneW * (s.x + 0.5);
    drawCar(ctx, px, h - CAR_H - 18, carW, COLORS.player, true);

    // Coin sparks
    s.sparks.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = COLORS.coin;
      ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1;
    // Only depends on refs, so it never needs to change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the canvas sharp and sized to its container
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const resize = () => {
      const w = wrap.clientWidth;
      const h = w < 520 ? 420 : 360;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.current = { w, h, dpr };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.height = `${h}px`;
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  const steer = useCallback((dir) => {
    const s = world.current;
    s.lane = Math.max(0, Math.min(LANES - 1, s.lane + dir));
  }, []);

  const start = () => {
    world.current = newWorld();
    setScore(0);
    setStatus("playing");
    canvasRef.current.focus({ preventScroll: true });
  };

  // Game loop
  useEffect(() => {
    if (status !== "playing") return undefined;
    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = world.current;
      const { h } = size.current;
      const { laneW, laneX } = geometry();
      const carW = laneW * CAR_W;

      s.speed = Math.min(720, s.speed + dt * 14);
      s.distance += s.speed * dt;
      s.dashOffset += s.speed * dt;
      s.x += (s.lane - s.x) * Math.min(1, dt * 14);

      // Spawn traffic, always leaving at least one lane open
      s.spawnIn -= dt;
      if (s.spawnIn <= 0) {
        const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
        const cars = Math.random() < Math.min(0.55, s.speed / 1100) ? 2 : 1;
        lanes.slice(0, cars).forEach((lane) =>
          s.things.push({
            type: "car",
            lane,
            y: -CAR_H,
            color: COLORS.enemy[Math.floor(Math.random() * COLORS.enemy.length)],
          })
        );
        if (Math.random() < 0.45) {
          s.things.push({ type: "coin", lane: lanes[2], y: -CAR_H - 60 });
        }
        s.spawnIn = Math.max(0.42, 1.1 - s.speed / 900) + Math.random() * 0.3;
      }

      const playerY = h - CAR_H - 18;
      const px = laneX(0) + laneW * s.x;
      let crashed = false;

      s.things = s.things.filter((t) => {
        // Oncoming traffic moves a bit slower than the road
        t.y += s.speed * dt * (t.type === "car" ? 0.75 : 1);
        const tx = laneX(t.lane);
        const overlapX = Math.abs(tx - px) < carW * 0.85;
        if (t.type === "coin") {
          if (overlapX && t.y + 24 > playerY && t.y < playerY + CAR_H) {
            s.coins += 1;
            for (let i = 0; i < 10; i += 1) {
              s.sparks.push({
                x: tx,
                y: t.y + 12,
                vx: (Math.random() - 0.5) * 240,
                vy: (Math.random() - 0.8) * 240,
                life: 1,
              });
            }
            return false;
          }
        } else if (overlapX && t.y + CAR_H - 8 > playerY && t.y + 8 < playerY + CAR_H) {
          crashed = true;
        }
        return t.y < h + 20;
      });

      s.sparks = s.sparks.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 2;
        return p.life > 0;
      });

      const current = Math.floor(s.distance / 10) + s.coins * 50;
      setScore(current);
      draw();

      if (crashed) {
        setStatus("over");
        setBest((b) => {
          if (current > b) {
            saveBest(current);
            return current;
          }
          return b;
        });
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // geometry only reads refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, draw]);

  const onKeyDown = (e) => {
    if (status !== "playing") {
      if ((e.key === "Enter" || e.key === " ") && e.target === canvasRef.current) {
        e.preventDefault();
        start();
      }
      return;
    }
    if (["ArrowLeft", "a", "A"].includes(e.key)) {
      e.preventDefault();
      steer(-1);
    } else if (["ArrowRight", "d", "D"].includes(e.key)) {
      e.preventDefault();
      steer(1);
    }
  };

  const onPointerDown = (e) => {
    if (status !== "playing") return;
    const r = canvasRef.current.getBoundingClientRect();
    steer(e.clientX - r.left < r.width / 2 ? -1 : 1);
  };

  return (
    // Listens on the wrapper so arrows keep working after tapping the on-screen pad
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="arcade" onKeyDown={onKeyDown}>
      <div className="arcade-hud">
        <span>
          SCORE <strong>{String(score).padStart(6, "0")}</strong>
        </span>
        <span className="arcade-title">LANE DODGER</span>
        <span>
          BEST <strong>{String(best).padStart(6, "0")}</strong>
        </span>
      </div>
      <div className="arcade-screen" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Lane Dodger mini-game. Use left and right arrow keys to change lanes."
          onPointerDown={onPointerDown}
        />
        {status !== "playing" && (
          <div className="arcade-overlay">
            {status === "over" ? (
              <>
                <p className="arcade-big">GAME OVER</p>
                <p className="arcade-small">
                  Score {score}
                  {score >= best && score > 0 ? " · New best!" : ""}
                </p>
                <button type="button" className="btn btn-primary" onClick={start}>
                  <FiRotateCcw /> Try again
                </button>
              </>
            ) : (
              <>
                <p className="arcade-big">INSERT COIN</p>
                <p className="arcade-small">← → or A / D to switch lanes · tap left / right on touch</p>
                <button type="button" className="btn btn-primary" onClick={start}>
                  <FiPlay /> Press start
                </button>
              </>
            )}
          </div>
        )}
        <div className="scanlines" aria-hidden="true" />
      </div>
      <div className="arcade-pad">
        <button
          type="button"
          aria-label="Steer left"
          onPointerDown={(e) => {
            e.preventDefault();
            steer(-1);
          }}
          disabled={status !== "playing"}
        >
          <FiChevronLeft />
        </button>
        <button
          type="button"
          aria-label="Steer right"
          onPointerDown={(e) => {
            e.preventDefault();
            steer(1);
          }}
          disabled={status !== "playing"}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
