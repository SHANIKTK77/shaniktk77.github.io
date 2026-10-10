import React, { useEffect, useRef, useState } from "react";
import {
  FiArrowUpRight,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsUp,
  FiChevronDown,
  FiChevronUp,
  FiRotateCcw,
  FiX,
} from "react-icons/fi";
import { FaGooglePlay } from "react-icons/fa";
import DriveEngine from "./driveEngine";
import { chime, play, setEngine } from "./sfx";

// Free-roam objectives, in the order they're listed in the HUD
const OBJECTIVES = [
  {
    key: "zone",
    label: "Drive into a mission marker",
    title: "Mission marker found",
    text: "Press E (or tap Enter) to jump to that section.",
  },
  {
    key: "cones",
    label: "Knock down 10 cones",
    title: "Strike!",
    text: "10 cones down. The pins never stood a chance.",
  },
  {
    key: "jump",
    label: "Catch big air off the ramp",
    title: "Stunt driver",
    text: "Big air. I built GT Car Stunt, so I approve.",
  },
  {
    key: "park",
    label: "Park in the glowing bay",
    title: "Parking pro",
    text: "Clean park. Prado Car Parking has 50M+ downloads; I know parking.",
  },
  {
    key: "drift",
    label: "Drift past 9,000 points",
    title: "It's over 9000!",
    text: "Drift score over 9,000. Absolute legend.",
  },
];

const IS_TOUCH =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

// A held-down touch control that feeds a key into the engine
function Pad({ engine, name, label, className, children }) {
  const set = (down) => (e) => {
    e.preventDefault();
    if (engine.current) engine.current.setKey(name, down);
  };
  return (
    <button
      type="button"
      className={`pad ${className || ""}`}
      aria-label={label}
      onPointerDown={(e) => {
        if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
        set(true)(e);
      }}
      onPointerUp={set(false)}
      onPointerCancel={set(false)}
      onLostPointerCapture={set(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

export default function DriveWorld({ games, zones, driving, god, onExit, onEnterZone, onToast, onFail }) {
  const holder = useRef(null);
  const mapRef = useRef(null);
  const engine = useRef(null);
  const els = useRef({});
  const last = useRef({});
  const [zone, setZone] = useState(null);
  const [board, setBoard] = useState(null);
  const [done, setDone] = useState({});
  const doneRef = useRef({});
  const [mapOpen, setMapOpen] = useState(!IS_TOUCH);

  // Latest callbacks, so the engine (created once) always calls the current ones
  const cb = useRef({});
  cb.current = { onExit, onEnterZone, onToast, onFail, driving };

  useEffect(() => {
    const ref = (name) => els.current[name];
    const write = (name, value) => {
      if (last.current[name] === value) return;
      last.current[name] = value;
      const el = ref(name);
      if (el) el.textContent = value;
    };

    // Called every frame: write straight to the DOM instead of re-rendering React
    const frame = (h) => {
      write("speed", String(Math.round(h.speed * 3.6)));
      write("score", Math.round(h.score).toLocaleString());
      const boost = ref("boost");
      if (boost) boost.style.transform = `scaleX(${h.boost.toFixed(3)})`;
      const combo = ref("combo");
      if (combo) {
        const on = h.combo > 0;
        combo.classList.toggle("is-on", on);
        if (on) {
          write("comboPts", `+${Math.round(h.combo).toLocaleString()}`);
          write("comboMult", `x${h.mult}`);
        }
      }
      const air = ref("air");
      if (air) air.classList.toggle("is-on", h.air);
      if (h.perf) {
        const p = h.perf;
        write(
          "perf",
          `${p.fps} FPS · ${p.calls} draw calls · ${(p.tris / 1000).toFixed(1)}k tris · res ${p.res}%`
        );
      }
      if (cb.current.driving) setEngine(Math.min(1, h.speed / 44), h.boosting);
    };

    // A fresh canvas per engine: a canvas whose WebGL context was released can't be reused
    const canvas = document.createElement("canvas");
    holder.current.appendChild(canvas);
    let instance;
    try {
      instance = new DriveEngine(canvas, {
        games,
        zones,
        minimap: mapRef.current,
        on: {
          frame,
          zone: setZone,
          board: setBoard,
          exit: () => cb.current.onExit(),
          enter: (id) => cb.current.onEnterZone(id),
          impact: () => play("hit"),
          drop: () => {
            const el = ref("combo");
            if (!el) return;
            el.classList.remove("is-dropped");
            // Restart the shake animation
            void el.offsetWidth;
            el.classList.add("is-dropped");
          },
          objective: (key) => {
            const o = OBJECTIVES.find((x) => x.key === key);
            doneRef.current = { ...doneRef.current, [key]: true };
            setDone(doneRef.current);
            const all = OBJECTIVES.every((x) => doneRef.current[x.key]);
            chime();
            cb.current.onToast(
              all
                ? {
                    title: "100% complete",
                    text: "Every objective done. Thanks for test-driving my portfolio!",
                  }
                : { title: o.title, text: o.text }
            );
          },
        },
      });
    } catch (e) {
      canvas.remove();
      cb.current.onFail();
      return undefined;
    }
    engine.current = instance;
    instance.start();
    return () => {
      instance.dispose();
      canvas.remove();
      engine.current = null;
      setEngine(null);
    };
    // The engine is built once; games and zones never change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (engine.current) engine.current.setDriving(driving);
    if (!driving) {
      setEngine(null);
      setZone(null);
      setBoard(null);
    }
  }, [driving]);

  useEffect(() => {
    if (engine.current) engine.current.setGod(god);
  }, [god]);

  const el = (name) => (node) => {
    els.current[name] = node;
  };
  const activeZone = zones.find((z) => z.id === zone);
  const game = board === null ? null : games[board];
  const count = OBJECTIVES.filter((o) => done[o.key]).length;
  const tab = driving ? 0 : -1;

  return (
    <div className="world">
      <div ref={holder} className="world-canvas" aria-hidden="true" />
      <p className="world-perf mono" aria-hidden="true">
        <span className="live-dot" />
        <span ref={el("perf")}>Real-time 3D</span>
      </p>

      <div className="world-hud" aria-hidden={!driving}>
        <div className="hud-objectives">
          <p className="mono hud-label">
            <span>Objectives</span>
            <span>
              {count}/{OBJECTIVES.length}
            </span>
          </p>
          <ul>
            {OBJECTIVES.map((o) => (
              <li key={o.key} className={done[o.key] ? "is-done" : ""}>
                <span className="hud-check">{done[o.key] && <FiCheck />}</span>
                {o.label}
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="hud-exit mono" onClick={onExit} tabIndex={tab}>
          <FiX /> <span>Exit</span> <kbd>Esc</kbd>
        </button>

        <div className={`hud-map${mapOpen ? "" : " is-closed"}`}>
          <canvas ref={mapRef} width="300" height="300" aria-hidden="true" />
          {IS_TOUCH && (
            <button
              type="button"
              className="hud-map-toggle"
              onClick={() => setMapOpen((o) => !o)}
              aria-label={mapOpen ? "Hide map" : "Show map"}
              tabIndex={tab}
            >
              {mapOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          )}
        </div>

        {game && (
          <div className="board-card" key={game.title}>
            <img src={game.image} alt="" />
            <div>
              <p className="mono board-kicker">Now passing · #{String(board + 1).padStart(2, "0")}</p>
              <strong>{game.title}</strong>
              <p className="board-meta mono">
                {game.genre}
                {game.badge ? ` · ${game.badge}` : ""}
              </p>
              <a href={game.playStore} target="_blank" rel="noreferrer" tabIndex={tab}>
                <FaGooglePlay /> Google Play <FiArrowUpRight />
              </a>
            </div>
          </div>
        )}

        {activeZone && (
          <button
            type="button"
            className="zone-prompt"
            style={{ "--zone": activeZone.color }}
            onClick={() => onEnterZone(activeZone.id)}
            tabIndex={tab}
          >
            <kbd>E</kbd>
            <span>
              <small className="mono">Enter</small>
              {activeZone.label}
            </span>
          </button>
        )}

        <div className="hud-dash">
          <div className="hud-combo" ref={el("combo")}>
            <span className="mono" ref={el("comboMult")}>
              x1
            </span>
            <strong ref={el("comboPts")}>+0</strong>
            <small className="mono">Drift</small>
          </div>
          <p className="hud-air mono" ref={el("air")}>
            Airtime!
          </p>
          <div className="hud-speed">
            <strong ref={el("speed")}>0</strong>
            <span className="mono">km/h</span>
          </div>
          <div className="hud-boost">
            <span className="mono">{god ? "Nitro · infinite" : "Nitro"}</span>
            <i>
              <b ref={el("boost")} />
            </i>
          </div>
          <p className="hud-score mono">
            Drift score <strong ref={el("score")}>0</strong>
          </p>
        </div>

        {IS_TOUCH ? (
          <div className="touch-pads">
            <div className="touch-steer">
              <Pad engine={engine} name="left" label="Steer left">
                <FiChevronLeft />
              </Pad>
              <Pad engine={engine} name="right" label="Steer right">
                <FiChevronRight />
              </Pad>
            </div>
            <div className="touch-drive">
              <Pad engine={engine} name="boost" label="Nitro" className="is-nitro">
                <FiChevronsUp />
                <small>Nitro</small>
              </Pad>
              <Pad engine={engine} name="up" label="Accelerate" className="is-gas">
                <small>Gas</small>
              </Pad>
              <Pad engine={engine} name="drift" label="Handbrake drift" className="is-drift">
                <FiRotateCcw />
                <small>Drift</small>
              </Pad>
              <Pad engine={engine} name="down" label="Brake and reverse" className="is-brake">
                <small>Brake</small>
              </Pad>
            </div>
          </div>
        ) : (
          <ul className="hud-keys mono">
            <li>
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd> Drive
            </li>
            <li>
              <kbd>Space</kbd> Drift
            </li>
            <li>
              <kbd>Shift</kbd> Nitro
            </li>
            <li>
              <kbd>R</kbd> Reset
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
