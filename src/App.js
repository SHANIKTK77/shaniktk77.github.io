import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedinIn, FaGooglePlay, FaApple, FaAndroid, FaTrophy } from "react-icons/fa";
import {
  FiArrowUpRight,
  FiArrowUp,
  FiDownload,
  FiMail,
  FiPhone,
  FiZap,
  FiCpu,
  FiShield,
  FiSmartphone,
  FiUsers,
  FiTerminal,
  FiPlay,
  FiClock,
  FiActivity,
  FiLayers,
  FiCode,
  FiTarget,
  FiDollarSign,
  FiMonitor,
  FiTool,
  FiMenu,
  FiX,
  FiCheck,
  FiVolume2,
  FiVolumeX,
  FiMapPin,
} from "react-icons/fi";
import resume from "./Assets/Resume.pdf";
import {
  profile,
  stats,
  attributes,
  tips,
  featuredTitle,
  games,
  experience,
  education,
  skills,
} from "./data";
import MiniGame from "./MiniGame";
import HeroFX from "./HeroFX";
import { play, savedSound, setSound, unlockAudio } from "./sfx";
import "./App.css";

const featured = games.find((g) => g.title === featuredTitle) || games[0];
// Featured game leads the hero reel, followed by the rest
const slides = [featured, ...games.filter((g) => g !== featured)];

// Icons for the experience objectives, in the order they appear in data.js
const HIGHLIGHT_ICONS = [FiZap, FiCpu, FiShield, FiSmartphone, FiUsers, FiTerminal];
// Icon and rarity for each stat, in the order they appear in data.js
const STAT_META = [
  { icon: FiClock, rarity: "Veteran" },
  { icon: FiDownload, rarity: "Legendary" },
  { icon: FiActivity, rarity: "Epic" },
  { icon: FiLayers, rarity: "Rare" },
];
// Icon and loadout slot name for each skill group, in the order they appear in data.js
const SKILL_META = [
  { icon: FiCode, slot: "Primary" },
  { icon: FiTarget, slot: "Specialty" },
  { icon: FiDollarSign, slot: "Economy" },
  { icon: FiMonitor, slot: "Deployment" },
  { icon: FiTool, slot: "Utility" },
  { icon: FiCpu, slot: "Ultimate" },
];

const TICKER = [
  "Unity",
  "Unreal Engine",
  "C#",
  "C++",
  "Photon PUN",
  "PlayFab",
  "Firebase",
  "Android",
  "iOS",
  "tvOS",
  "Android TV",
  "Performance",
  "Porting",
  "Multiplayer",
];

const NAV = [
  { id: "profile", label: "Profile" },
  { id: "games", label: "Library" },
  { id: "experience", label: "Campaign" },
  { id: "skills", label: "Loadout" },
  { id: "play", label: "Arcade" },
  { id: "contact", label: "Lobby" },
];
const NAV_IDS = NAV.map((n) => n.id);

// The title-screen menu in the hero
const MENU = [
  { href: "#games", label: "Continue", hint: "Game library" },
  { href: "#experience", label: "Campaign", hint: "Career" },
  { href: "#skills", label: "Loadout", hint: "Skills and tools" },
  { href: "#play", label: "Arcade", hint: "Play Lane Dodger" },
  { href: "#contact", label: "Multiplayer", hint: "Get in touch" },
];

const RESUME_NAME = "Shadman-Khan-Khattak-Resume.pdf";
const BOOT_KEY = "sk-booted";

const pad = (n) => String(n).padStart(2, "0");

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fades elements marked with data-reveal in as they scroll into view
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// Tracks which section is in the middle of the viewport
function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

// Calls fn on scroll and resize, at most once per frame
function useScrollFrame(fn) {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      fn();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [fn]);
}

// Plays hover and click blips on every link and button
function useUISounds() {
  useEffect(() => {
    let last = null;
    const onOver = (e) => {
      if (e.pointerType !== "mouse") return;
      const el = e.target.closest && e.target.closest("a, button");
      if (el && el !== last) play("hover");
      last = el;
    };
    const onClick = (e) => {
      unlockAudio();
      if (e.target.closest && e.target.closest("a, button")) play("click");
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick);
    };
  }, []);
}

// ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

function useKonami(onUnlock) {
  useEffect(() => {
    let pos = 0;
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        onUnlock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onUnlock]);
}

function shouldBoot() {
  if (prefersReducedMotion()) return false;
  try {
    return !sessionStorage.getItem(BOOT_KEY);
  } catch (e) {
    return false;
  }
}

const BOOT_MS = 2800;
const BOOT_LINES = [
  "Compiling shaders",
  "Streaming textures",
  "Baking lightmaps",
  "Syncing save data",
  "Ready",
];

// Studio-style splash and loading screen, shown once per browser session
function Boot({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  const finish = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / BOOT_MS);
      // Ease out with a stall near the end, like a real loader
      setProgress(t < 0.7 ? t * 1.15 : 0.805 + (t - 0.7) * 0.65);
      if (t < 1) raf = requestAnimationFrame(tick);
      else finish();
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("keydown", finish);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", finish);
    };
  }, [finish]);

  useEffect(() => {
    if (!leaving) return undefined;
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch (e) {
      // Without storage the boot screen just shows again next visit
    }
    const id = setTimeout(onDone, 700);
    return () => clearTimeout(id);
  }, [leaving, onDone]);

  const shown = leaving ? 1 : Math.min(1, progress);
  const line = BOOT_LINES[Math.min(BOOT_LINES.length - 1, Math.floor(shown * BOOT_LINES.length))];

  return (
    <div className={`boot${leaving ? " is-leaving" : ""}`} onClick={finish} aria-hidden="true">
      <div className="boot-inner">
        <Emblem className="boot-emblem" />
        <p className="boot-presents mono">A Shadman Khan Khattak production</p>
        <div className="boot-bar">
          <span style={{ transform: `scaleX(${shown})` }} />
        </div>
        <p className="mono boot-status">
          <span>{line}…</span>
          <span>{Math.round(shown * 100)}%</span>
        </p>
      </div>
      <p className="boot-tip">
        <span className="mono">Tip</span>
        {tip}
      </p>
      <p className="mono boot-skip">Press any key to skip</p>
    </div>
  );
}

// Hexagonal SK crest used on the splash screen and the profile card
function Emblem({ className }) {
  return (
    <svg className={`emblem ${className || ""}`} viewBox="0 0 120 120" aria-hidden="true">
      <polygon className="emblem-ring" points="60,4 108,32 108,88 60,116 12,88 12,32" />
      <polygon className="emblem-inner" points="60,16 98,38 98,82 60,104 22,82 22,38" />
      <text x="60" y="73" textAnchor="middle" className="emblem-text">
        SK
      </text>
    </svg>
  );
}

// Trailing crosshair that follows the mouse and locks on to links and buttons
function Reticle() {
  const ref = useRef(null);
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches &&
      !prefersReducedMotion(),
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let raf = 0;
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      el.classList.add("is-on");
      const target = e.target.closest && e.target.closest("a, button, canvas");
      el.classList.toggle("is-lock", !!target);
    };
    const onLeave = () => el.classList.remove("is-on");
    const onDown = () => el.classList.add("is-down");
    const onUp = () => el.classList.remove("is-down");
    const tick = () => {
      cx += (x - cx) * 0.25;
      cy += (y - cy) * 0.25;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="reticle" ref={ref} aria-hidden="true">
      <span className="reticle-ring" />
      <span className="reticle-dot" />
    </div>
  );
}

function Platforms({ game }) {
  return (
    <span className="platforms">
      {game.platforms.includes("Android") && (
        <span title="Android">
          <FaAndroid /> Android
        </span>
      )}
      {game.platforms.includes("iOS") && (
        <span title="iOS">
          <FaApple /> iOS
        </span>
      )}
    </span>
  );
}

function StoreLinks({ game }) {
  return (
    <div className="store-links">
      <a href={game.playStore} target="_blank" rel="noreferrer" className="store-link">
        <FaGooglePlay /> Google Play <FiArrowUpRight />
      </a>
      {game.appStore && (
        <a href={game.appStore} target="_blank" rel="noreferrer" className="store-link">
          <FaApple /> App Store <FiArrowUpRight />
        </a>
      )}
    </div>
  );
}

function SectionHead({ index, kicker, title, children }) {
  return (
    <div className="section-head" data-reveal>
      <span className="section-index" aria-hidden="true">
        {pad(index)}
      </span>
      <p className="kicker mono">
        <span className="kicker-num">{pad(index)}</span>
        <span className="kicker-line" />
        {kicker}
      </p>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function Nav({ sound, onToggleSound }) {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(NAV_IDS);

  const update = useCallback(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    setScrolled(window.scrollY > 40);
  }, []);
  useScrollFrame(update);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);
  const SoundIcon = sound ? FiVolume2 : FiVolumeX;

  return (
    <>
      <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="container nav-inner">
          <a href="#top" className="nav-logo" aria-label="Back to top">
            <span className="logo-mark">SK</span>
            <span className="logo-text">
              <strong>Shadman Khan</strong>
              <span className="mono">Game Developer</span>
            </span>
          </a>
          <nav className="nav-links" aria-label="Sections">
            {NAV.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? "is-active" : ""}
                aria-current={active === item.id ? "true" : undefined}
              >
                <span className="mono">{pad(i + 1)}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              type="button"
              className={`icon-btn${sound ? " is-on" : ""}`}
              onClick={onToggleSound}
              aria-label={sound ? "Turn sound off" : "Turn sound on"}
              aria-pressed={sound}
              title={sound ? "Sound on" : "Sound off"}
            >
              <SoundIcon />
            </button>
            <a href={resume} download={RESUME_NAME} className="btn btn-small btn-primary nav-resume">
              <FiDownload /> Resume
            </a>
            <button
              type="button"
              className="icon-btn menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <FiMenu />
            </button>
          </div>
        </div>
        <div className="xp" aria-hidden="true">
          <div className="xp-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </header>

      <div className={`pause${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="pause-head">
          <span className="mono">{"// Game paused"}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={close}
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
          >
            <FiX />
          </button>
        </div>
        <nav className="pause-links" aria-label="Menu">
          <a href="#top" onClick={close} tabIndex={menuOpen ? 0 : -1}>
            <span className="mono">00</span> Resume game
          </a>
          {NAV.map((item, i) => (
            <a key={item.id} href={`#${item.id}`} onClick={close} tabIndex={menuOpen ? 0 : -1}>
              <span className="mono">{pad(i + 1)}</span> {item.label}
            </a>
          ))}
        </nav>
        <a href={resume} download={RESUME_NAME} className="btn btn-primary" tabIndex={menuOpen ? 0 : -1}>
          <FiDownload /> Download resume
        </a>
      </div>
    </>
  );
}

const SLIDE_MS = 6000;

function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroRef = useRef(null);
  const game = slides[index];
  const count = slides.length;
  const animate = !paused && !prefersReducedMotion();

  const go = useCallback((i) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (!animate) return undefined;
    const id = setTimeout(() => go(index + 1), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, animate, go]);

  // Mouse parallax: layers read --mx / --my (-1 to 1) from the hero
  const onPointerMove = (e) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = heroRef.current;
    el.style.setProperty("--mx", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
    el.style.setProperty("--my", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
  };

  return (
    <section className="hero" id="top" ref={heroRef} onPointerMove={onPointerMove}>
      <div className="hero-art" aria-hidden="true">
        {slides.map((g, i) => (
          <img
            key={g.title}
            src={g.image}
            alt=""
            className={i === index ? "is-active" : ""}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      <HeroFX className="hero-fx" />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-hud" aria-hidden="true">
        <span className="hud-corner tl" />
        <span className="hud-corner tr" />
        <span className="hud-corner bl" />
        <span className="hud-corner br" />
        <span className="hud-readout mono">
          REC <i /> {pad(index + 1)}/{pad(count)}
        </span>
        <span className="hud-build mono">Build 4.0 · {profile.location}</span>
      </div>

      <div className="container hero-inner">
        <div className="hero-main">
          <p className="hero-tag mono">
            <span className="live-dot" /> Player 01 · Senior {profile.role} @ Terafort
          </p>
          <h1 className="hero-title">
            <span className="hero-first" data-text="Shadman">
              Shadman
            </span>
            <span className="hero-last">Khan Khattak</span>
          </h1>
          <p className="hero-sub">
            I make games that run <em>smooth on every platform.</em>
          </p>
          <p className="lead">
            Game developer with 4+ years shipping titles in Unity, plus hands-on Unreal Engine. I
            build for Android, iOS, tvOS and Android TV, and specialize in performance optimization,
            cross-platform porting and multiplayer.
          </p>
          <div className="hero-actions">
            <a href="#games" className="btn btn-primary btn-lg">
              <FiPlay /> View my games
            </a>
            <a href={resume} download={RESUME_NAME} className="btn btn-ghost btn-lg">
              <FiDownload /> Download resume
            </a>
          </div>
        </div>

        <nav className="title-menu" aria-label="Main menu">
          <p className="mono title-menu-head">Main menu</p>
          {MENU.map((m, i) => (
            <a href={m.href} key={m.href}>
              <span className="tm-key mono">{pad(i + 1)}</span>
              <span className="tm-label">{m.label}</span>
              <span className="tm-hint mono">{m.hint}</span>
            </a>
          ))}
        </nav>
      </div>

      <div
        className="container hero-dock"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <a
          key={game.title}
          href={game.playStore}
          target="_blank"
          rel="noreferrer"
          className="now-showing"
        >
          <span className="mono now-label">
            <span className="rec" /> {game === featured ? "Featured title" : "Now showing"}
          </span>
          <strong>{game.title}</strong>
          <span className="now-meta">
            <span className="tag tag-accent">{game.genre}</span>
            {game.badge && <span className="tag">{game.badge}</span>}
            <span className="now-store">
              <FaGooglePlay /> Google Play <FiArrowUpRight />
            </span>
          </span>
        </a>
        <div className="reel" role="group" aria-label="Choose a game to show">
          {slides.map((g, i) => (
            <button
              type="button"
              key={g.title}
              className={`reel-item${i === index ? " is-active" : ""}`}
              onClick={() => go(i)}
              aria-label={`Show ${g.title}`}
              aria-pressed={i === index}
            >
              <img src={g.image} alt="" loading="lazy" />
              <span className="reel-bar">
                <span
                  key={i === index ? `run-${index}` : "idle"}
                  className={i === index && animate ? "is-running" : i === index ? "is-full" : ""}
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      <a href="#profile" className="scroll-cue mono" aria-label="Scroll to profile">
        <span>Scroll</span>
        <i />
      </a>
    </section>
  );
}

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {items.map((t, i) => (
          <span key={i}>
            {t}
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}

// Splits "50M+" into { prefix: "", number: 50, suffix: "M+" } so it can count up
function parseStat(value) {
  const m = /^([^\d]*)([\d.]+)(.*)$/.exec(value);
  if (!m) return null;
  const decimals = (m[2].split(".")[1] || "").length;
  return { prefix: m[1], number: parseFloat(m[2]), suffix: m[3], decimals };
}

function CountUp({ value }) {
  const ref = useRef(null);
  const parsed = parseStat(value);
  const [shown, setShown] = useState(parsed && !prefersReducedMotion() ? 0 : null);

  useEffect(() => {
    if (!parsed || shown === null) return undefined;
    const el = ref.current;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 1600);
        const eased = 1 - Math.pow(1 - t, 4);
        setShown(parsed.number * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // Run once on mount; the value never changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span ref={ref}>
      {shown === null || !parsed
        ? value
        : `${parsed.prefix}${shown.toFixed(parsed.decimals)}${parsed.suffix}`}
    </span>
  );
}

const RADAR = { size: 340, r: 112 };

// Hexagonal radar chart of the attributes in data.js
function Radar() {
  const c = RADAR.size / 2;
  const n = attributes.length;
  const point = (i, scale) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(a) * RADAR.r * scale, c + Math.sin(a) * RADAR.r * scale];
  };
  const ring = (scale) =>
    attributes.map((_, i) => point(i, scale).map((v) => v.toFixed(1)).join(",")).join(" ");
  const shape = attributes
    .map((a, i) => point(i, a.value / 100).map((v) => v.toFixed(1)).join(","))
    .join(" ");

  return (
    <svg
      className="radar"
      viewBox={`0 0 ${RADAR.size} ${RADAR.size}`}
      role="img"
      aria-label={`Attributes: ${attributes.map((a) => `${a.label} ${a.value}`).join(", ")}`}
    >
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon key={s} points={ring(s)} className="radar-ring" />
      ))}
      {attributes.map((a, i) => {
        const [x, y] = point(i, 1);
        return <line key={a.label} x1={c} y1={c} x2={x} y2={y} className="radar-axis" />;
      })}
      <g className="radar-shape">
        <polygon points={shape} />
        {attributes.map((a, i) => {
          const [x, y] = point(i, a.value / 100);
          return <circle key={a.label} cx={x} cy={y} r="3.5" />;
        })}
      </g>
      {attributes.map((a, i) => {
        const [x, y] = point(i, 1.2);
        return (
          <text key={a.label} x={x} y={y} className="radar-label" textAnchor="middle">
            <tspan x={x} dy="-0.2em">
              {a.label}
            </tspan>
            <tspan x={x} dy="1.25em" className="radar-value">
              {a.value}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

function Profile() {
  return (
    <section className="container section" id="profile">
      <SectionHead index={1} kicker="Player profile" title="Character select" />
      <div className="profile">
        <div className="char-card panel" data-reveal>
          <div className="char-top">
            <div className="char-emblem">
              <Emblem />
              <span className="char-orbit" />
            </div>
            <div className="char-id">
              <span className="mono char-handle">Player 01 · @shaniktk77</span>
              <h3>{profile.name}</h3>
              <p>Senior {profile.role} · Terafort</p>
            </div>
          </div>
          <dl className="char-meta">
            <div>
              <dt className="mono">Class</dt>
              <dd>Game Developer</dd>
            </div>
            <div>
              <dt className="mono">Engines</dt>
              <dd>Unity · Unreal</dd>
            </div>
            <div>
              <dt className="mono">Platforms</dt>
              <dd>Android · iOS · tvOS · TV</dd>
            </div>
            <div>
              <dt className="mono">Base</dt>
              <dd>
                <FiMapPin /> {profile.location}
              </dd>
            </div>
          </dl>
          <div className="char-perks">
            <p className="mono">Signature perks</p>
            <ul>
              {profile.focus.map((f) => (
                <li key={f}>
                  <FiZap /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="char-rank">
            <div className="mono">
              <span>Rank · Senior</span>
              <span>4+ yrs XP</span>
            </div>
            <span className="rank-bar">
              <i />
            </span>
          </div>
        </div>

        <div className="char-stats panel" data-reveal style={{ transitionDelay: "100ms" }}>
          <p className="mono panel-label">Attributes</p>
          <Radar />
          <ul className="attr-list">
            {attributes.map((a) => (
              <li key={a.label}>
                <span>{a.label}</span>
                <span className="attr-bar">
                  <i style={{ "--v": a.value / 100 }} />
                </span>
                <span className="mono">{a.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="stats-wrap" id="achievements" aria-label="Career stats">
        <p className="kicker mono stats-title">
          <FaTrophy /> Achievements unlocked
          <span className="stats-count">
            {stats.length}/{stats.length} · 100%
          </span>
        </p>
        <div className="stats">
          {stats.map((s, i) => {
            const meta = STAT_META[i % STAT_META.length];
            const Icon = meta.icon;
            return (
              <div
                className={`stat rarity-${meta.rarity.toLowerCase()}`}
                key={s.label}
                data-reveal
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="stat-icon">
                  <Icon />
                </span>
                <div className="stat-body">
                  <span className="mono stat-rarity">{meta.rarity}</span>
                  <div className="stat-value">
                    <CountUp value={s.value} />
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Tilts a card toward the pointer and moves a glare highlight with it
function useTilt() {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 7}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  return { ref, onPointerMove: onMove, onPointerLeave: onLeave };
}

function GameCard({ game, number, size }) {
  const tilt = useTilt();
  return (
    <article className={`game-card${size ? ` is-${size}` : ""}`} {...tilt}>
      <img src={game.image} alt={`${game.title} screenshot`} loading="lazy" />
      <span className="game-shade" aria-hidden="true" />
      <div className="game-tags">
        <span className="tag">{game.genre}</span>
        {game.badge && <span className="tag tag-accent">{game.badge}</span>}
      </div>
      <span className="mono game-num">#{pad(number)}</span>
      <div className="game-body">
        <h3>{game.title}</h3>
        <Platforms game={game} />
        <p>{game.description}</p>
        <StoreLinks game={game} />
      </div>
      <a
        href={game.playStore}
        target="_blank"
        rel="noreferrer"
        className="game-hit"
      >
        <span className="sr-only">{game.title} on Google Play</span>
      </a>
      <span className="glare" aria-hidden="true" />
    </article>
  );
}

const ALL = "All";
const genres = [ALL, ...new Set(games.map((g) => g.genre))];

function Games() {
  const [genre, setGenre] = useState(ALL);
  const all = genre === ALL;
  const shown = all ? games : games.filter((g) => g.genre === genre);

  // In the full library the featured game gets a big tile and other badged games a wide one
  const sizeOf = (g) => {
    if (!all) return null;
    if (g === featured) return "spot";
    return g.badge ? "wide" : null;
  };

  return (
    <section className="container section" id="games">
      <SectionHead index={2} kicker="Game library" title="Games I've shipped">
        <div className="mode-select" role="group" aria-label="Filter by genre">
          {genres.map((g) => (
            <button
              type="button"
              key={g}
              className={g === genre ? "is-active" : ""}
              aria-pressed={g === genre}
              onClick={() => setGenre(g)}
            >
              {g}
              <span className="mono">
                {g === ALL ? games.length : games.filter((x) => x.genre === g).length}
              </span>
            </button>
          ))}
        </div>
      </SectionHead>
      <div className={`game-grid${all ? " is-all" : ""}`}>
        {shown.map((g) => (
          <GameCard game={g} number={games.indexOf(g) + 1} size={sizeOf(g)} key={g.title} />
        ))}
      </div>
    </section>
  );
}

function Objectives({ items }) {
  return (
    <div className="objectives">
      {items.map((h, j) => {
        const Icon = HIGHLIGHT_ICONS[j % HIGHLIGHT_ICONS.length];
        return (
          <div className="objective" key={h.title}>
            <span className="objective-icon">
              <Icon />
            </span>
            <div>
              <h4>
                {h.title}
                <FiCheck className="objective-check" />
              </h4>
              <p>{h.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Experience() {
  const ref = useRef(null);
  const chapters = experience.length + 1;

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = (window.innerHeight * 0.6 - r.top) / r.height;
    el.style.setProperty("--fill", Math.min(1, Math.max(0, p)).toFixed(3));
  }, []);
  useScrollFrame(update);

  return (
    <section className="container section" id="experience">
      <SectionHead index={3} kicker="Campaign" title="Career mode" />
      <div className="campaign" ref={ref}>
        <span className="campaign-line" aria-hidden="true" />
        {experience.map((job, i) => (
          <article className="chapter" key={job.company} data-reveal>
            <span className={`chapter-node${i === 0 ? " is-live" : ""}`} aria-hidden="true" />
            <div className="chapter-side">
              <span className="mono chapter-num">Chapter {pad(chapters - i)}</span>
              <span className="chapter-period">{job.period}</span>
              {i === 0 ? (
                <span className="status-tag mono">
                  <span className="live-dot" /> Active mission
                </span>
              ) : (
                <span className="status-tag is-done mono">
                  <FiCheck /> Mission complete
                </span>
              )}
            </div>
            <div className="chapter-main panel">
              <h3>{job.role}</h3>
              <p className="chapter-co mono">{job.company}</p>
              <p className="chapter-summary">{job.summary}</p>
              {job.highlights && (
                <>
                  <p className="objectives-title mono">
                    <span>Objectives complete</span>
                    <span>
                      {job.highlights.length}/{job.highlights.length}
                    </span>
                  </p>
                  <Objectives items={job.highlights} />
                </>
              )}
            </div>
          </article>
        ))}
        <article className="chapter" data-reveal>
          <span className="chapter-node" aria-hidden="true" />
          <div className="chapter-side">
            <span className="mono chapter-num">Chapter 01 · Prologue</span>
            <span className="chapter-period">{education.period}</span>
            <span className="status-tag is-done mono">
              <FiCheck /> Tutorial complete
            </span>
          </div>
          <div className="chapter-main panel">
            <h3>{education.degree}</h3>
            <p className="chapter-co mono">{education.school}</p>
            <p className="chapter-summary">
              Where I learned the fundamentals before getting into games.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="container section" id="skills">
      <SectionHead index={4} kicker="Loadout" title="What I bring to the fight" />
      <div className="loadout">
        {skills.map((s, i) => {
          const meta = SKILL_META[i % SKILL_META.length];
          const Icon = meta.icon;
          return (
            <div
              className="slot"
              key={s.group}
              data-reveal
              style={{ transitionDelay: `${(i % 3) * 90}ms` }}
            >
              <span className="slot-num" aria-hidden="true">
                {pad(i + 1)}
              </span>
              <div className="slot-head">
                <span className="slot-icon">
                  <Icon />
                </span>
                <span className="mono slot-name">{meta.slot}</span>
              </div>
              <h3>{s.group}</h3>
              <div className="chips">
                {s.items.map((item) => (
                  <span className="chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Play() {
  return (
    <section className="container section" id="play">
      <SectionHead index={5} kicker="Bonus stage" title="Take a quick break">
        <p className="lead">
          A tiny lane-dodger I built for this page. Dodge the traffic, grab the coins and see how
          far you get.
        </p>
      </SectionHead>
      <div className="cabinet" data-reveal>
        <MiniGame />
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="container section" id="contact">
      <div className="lobby" data-reveal>
        <div className="lobby-text">
          <p className="kicker mono">
            <span className="live-dot" /> Lobby open · Looking for party
          </p>
          <h2>
            Ready for <span className="accent">player two?</span>
          </h2>
          <p className="lead">
            Open to game development roles and collaborations. Email, call or reach out on
            LinkedIn.
          </p>
          <div className="party" aria-hidden="true">
            <div className="party-slot is-ready">
              <span className="party-avatar">SK</span>
              <span>
                <strong>Shadman</strong>
                <small className="mono">Ready</small>
              </span>
            </div>
            <div className="party-slot is-waiting">
              <span className="party-avatar">P2</span>
              <span>
                <strong>You?</strong>
                <small className="mono">Waiting for player…</small>
              </span>
            </div>
          </div>
        </div>
        <div className="contact-links">
          <a href={`mailto:${profile.email}`} className="contact-link is-primary">
            <FiMail />
            <span>
              <small className="mono">Email · Send invite</small>
              {profile.email}
            </span>
            <FiArrowUpRight />
          </a>
          <a href={`tel:${profile.phone.replace(/-/g, "")}`} className="contact-link">
            <FiPhone />
            <span>
              <small className="mono">Phone · Voice chat</small>
              {profile.phone}
            </span>
            <FiArrowUpRight />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="contact-link">
            <FaLinkedinIn />
            <span>
              <small className="mono">LinkedIn</small>
              Shadman Khan Khattak
            </span>
            <FiArrowUpRight />
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="contact-link">
            <FaGithub />
            <span>
              <small className="mono">GitHub</small>
              @shaniktk77
            </span>
            <FiArrowUpRight />
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="credits">
          <p className="mono">Directed, designed and developed by</p>
          <strong>{profile.name}</strong>
        </div>
        <span className="cheat mono" title="Try it">
          ↑ ↑ ↓ ↓ ← → ← → B A
        </span>
        <div className="footer-end">
          <span className="mono">
            © {new Date().getFullYear()} · {profile.location} · Thanks for playing
          </span>
          <a href="#top" className="icon-btn" aria-label="Back to top">
            <FiArrowUp />
          </a>
        </div>
      </div>
    </footer>
  );
}

function Toast({ toast }) {
  return (
    <div className={`toast${toast ? " is-shown" : ""}`} role="status" aria-live="polite">
      {toast && (
        <>
          <span className="toast-icon">
            <FaTrophy />
          </span>
          <span>
            <strong>{toast.title}</strong>
            <br />
            {toast.text}
          </span>
        </>
      )}
    </div>
  );
}

function App() {
  const [booting, setBooting] = useState(shouldBoot);
  const [retro, setRetro] = useState(false);
  const [sound, setSoundState] = useState(savedSound);
  const [toast, setToast] = useState(null);

  useReveal();
  useUISounds();

  useEffect(() => {
    setSound(sound);
  }, [sound]);

  const toggleSound = useCallback(() => {
    const next = !sound;
    setSound(next);
    if (next) {
      unlockAudio();
      play("power");
    }
    setSoundState(next);
  }, [sound]);

  const unlock = useCallback(() => {
    play("power");
    setRetro(!retro);
    setToast({
      title: "Achievement unlocked",
      text: `Cheat code accepted. Retro mode ${retro ? "off" : "on"}.`,
    });
  }, [retro]);
  useKonami(unlock);

  const endBoot = useCallback(() => setBooting(false), []);

  useEffect(() => {
    document.body.classList.toggle("retro", retro);
  }, [retro]);

  useEffect(() => {
    document.body.classList.toggle("is-booting", booting);
  }, [booting]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <>
      {booting && <Boot onDone={endBoot} />}
      <div className="grain" aria-hidden="true" />
      <Reticle />
      <Nav sound={sound} onToggleSound={toggleSound} />
      <main>
        <Hero />
        <Ticker />
        <Profile />
        <Games />
        <Experience />
        <Skills />
        <Play />
        <Contact />
      </main>
      <Footer />
      <Toast toast={toast} />
    </>
  );
}

export default App;
