import { useEffect, useRef, useState } from "react";
import { createTerrain } from "../gl/terrain";
import { publishStats } from "../gl/stats";
import useReducedMotion from "../hooks/useReducedMotion";
import "./Scene.css";

// Sections the scene shows through. It only renders while one of them is on screen.
const WINDOWS = ["top", "contact"];

function readColors() {
  const css = getComputedStyle(document.documentElement);
  const get = (name) => css.getPropertyValue(name).trim();
  return {
    line: get("--scene-line"),
    glow: get("--scene-light"),
    strength: parseFloat(get("--scene-strength")) || 0.6,
  };
}

// The fixed WebGL backdrop. Decorative, so it's hidden from assistive tech; without WebGL
// the CSS gradient underneath stays and nothing else changes.
export default function Scene() {
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const small = window.innerWidth < 700;
    let scene = null;
    try {
      scene = createTerrain(canvas, { animate: !reduced, small, onStats: publishStats });
    } catch {
      scene = null;
    }
    if (!scene) return undefined;

    const root = document.documentElement;
    const applyColors = () => {
      scene.setColors(readColors());
      scene.render();
    };
    applyColors();
    setReady(true);

    // Theme switch (data-theme) or a system change
    const themeObserver = new MutationObserver(applyColors);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    const scheme = window.matchMedia?.("(prefers-color-scheme: dark)");
    scheme?.addEventListener?.("change", applyColors);

    const onPointer = (e) => {
      if (e.pointerType === "touch") return;
      scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, e.clientY / window.innerHeight);
    };
    const onLeave = () => scene.releasePointer();
    const onScroll = () => {
      const max = root.scrollHeight - window.innerHeight;
      scene.setScroll(max > 0 ? window.scrollY / max : 0);
    };
    const onResize = () => scene.resize();
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", onResize);
    onScroll();

    // Only spend GPU time while the scene can actually be seen
    const visible = new Set();
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) =>
              entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id)
            );
            if (visible.size) {
              onScroll();
              scene.start();
            } else {
              scene.stop();
            }
          })
        : null;
    WINDOWS.forEach((id) => {
      const el = document.getElementById(id);
      if (el && io) io.observe(el);
    });
    if (!io) scene.start();

    return () => {
      io?.disconnect();
      themeObserver.disconnect();
      scheme?.removeEventListener?.("change", applyColors);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      scene.destroy();
      publishStats(null);
      setReady(false);
    };
  }, [reduced]);

  return (
    <div className={`scene${ready ? " is-ready" : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} key={String(reduced)} className="scene__canvas" />
      <div className="scene__horizon" />
    </div>
  );
}
