import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedinIn, FaGooglePlay, FaApple, FaAndroid, FaTrophy } from "react-icons/fa";
import {
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
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
} from "react-icons/fi";
import resume from "./Assets/Resume.pdf";
import { profile, stats, featuredTitle, games, experience, education, skills } from "./data";
import MiniGame from "./MiniGame";
import "./App.css";

const featured = games.find((g) => g.title === featuredTitle) || games[0];
// Featured game leads the hero slideshow, followed by the rest
const slides = [featured, ...games.filter((g) => g !== featured)];

// Icons for the experience highlight cards, in the order they appear in data.js
const HIGHLIGHT_ICONS = [FiZap, FiCpu, FiShield, FiSmartphone, FiUsers, FiTerminal];
// Icon and rarity for each stat, in the order they appear in data.js
const STAT_META = [
  { icon: FiClock, rarity: "Veteran" },
  { icon: FiDownload, rarity: "Legendary" },
  { icon: FiActivity, rarity: "Epic" },
  { icon: FiLayers, rarity: "Rare" },
];
// Icons for the skill groups, in the order they appear in data.js
const SKILL_ICONS = [FiCode, FiTarget, FiDollarSign, FiMonitor, FiTool, FiCpu];

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
  { id: "games", label: "Games" },
  { id: "experience", label: "Career" },
  { id: "skills", label: "Loadout" },
  { id: "play", label: "Arcade" },
  { id: "contact", label: "Contact" },
];
const NAV_IDS = NAV.map((n) => n.id);

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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
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

const BOOT_MS = 2600;
const BOOT_LINES = ["Loading shaders", "Streaming assets", "Syncing save data", "Ready"];

// Short, skippable loading screen shown once per browser session
function Boot({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / BOOT_MS);
      setProgress(t);
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
    const id = setTimeout(onDone, 450);
    return () => clearTimeout(id);
  }, [leaving, onDone]);

  const line =
    BOOT_LINES[Math.min(BOOT_LINES.length - 1, Math.floor(progress * BOOT_LINES.length))];

  return (
    <div className={`boot${leaving ? " is-leaving" : ""}`} onClick={finish} aria-hidden="true">
      <div className="boot-inner">
        <span className="boot-logo">SK</span>
        <p className="boot-name">{profile.name}</p>
        <p className="mono boot-role">Game Developer · Unity / Unreal</p>
        <div className="boot-bar">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <p className="mono boot-status">
          <span>{line}…</span>
          <span>{Math.round(progress * 100)}%</span>
        </p>
      </div>
      <p className="mono boot-skip">Press any key to skip</p>
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

function Nav() {
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(NAV_IDS);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
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
  }, []);

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

  return (
    <>
      <header className="nav">
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
            <a
              href={resume}
              download={RESUME_NAME}
              className="btn btn-small btn-primary nav-resume"
            >
              <FiDownload /> Resume
            </a>
            <button
              type="button"
              className="menu-btn"
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
          <span className="mono">{"// Paused"}</span>
          <button
            type="button"
            className="menu-btn"
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
        <a
          href={resume}
          download={RESUME_NAME}
          className="btn btn-primary"
          tabIndex={menuOpen ? 0 : -1}
        >
          <FiDownload /> Download resume
        </a>
      </div>
    </>
  );
}

const SLIDE_MS = 5000;

function Hero() {
  const [index, setIndex] = useState(0);
  const game = slides[index];

  return (
    <section className="hero-wrap" id="top">
      <div className="hero-bg" aria-hidden="true">
        <img key={game.title} src={game.image} alt="" className="hero-backdrop" />
        <div className="hero-shade" />
        <div className="hero-grid" />
      </div>

      <div className="hero container">
        <div className="hero-text">
          <p className="hero-tag mono">
            <span className="live-dot" /> Player 01 · {profile.role} @ Terafort
          </p>
          <h1>
            I make games that run <span className="accent">smooth on every platform.</span>
          </h1>
          <p className="lead">
            I'm {profile.name}, a game developer with 4+ years shipping games in Unity, plus
            hands-on Unreal Engine experience. I build for Android, iOS, tvOS and Android TV, and
            specialize in performance optimization, cross-platform porting and multiplayer.
          </p>
          <div className="hero-actions">
            <a href="#games" className="btn btn-primary btn-lg">
              <FiPlay /> View my games
            </a>
            <a href={resume} download={RESUME_NAME} className="btn btn-ghost btn-lg">
              <FiDownload /> Download resume
            </a>
          </div>
          <dl className="hero-meta">
            <div>
              <dt className="mono">Class</dt>
              <dd>Senior Game Dev</dd>
            </div>
            <div>
              <dt className="mono">Engines</dt>
              <dd>Unity · Unreal</dd>
            </div>
            <div>
              <dt className="mono">Specialty</dt>
              <dd>{profile.focus[0]}</dd>
            </div>
          </dl>
        </div>

        <Slideshow index={index} setIndex={setIndex} />
      </div>
    </section>
  );
}

function Slideshow({ index, setIndex }) {
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = slides.length;
  const animate = !paused && !prefersReducedMotion();

  const go = useCallback((i) => setIndex((i + count) % count), [count, setIndex]);

  useEffect(() => {
    if (!animate) return undefined;
    const id = setTimeout(() => go(index + 1), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, animate, go]);

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  return (
    <div
      className="showcase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="showcase-bar mono">
        <span>
          <span className="rec" /> {index === 0 ? "Featured title" : "Now showing"}
        </span>
        <span>
          {pad(index + 1)} / {pad(count)}
        </span>
      </div>
      <div
        className="featured"
        role="region"
        aria-roledescription="carousel"
        aria-label="Games I've worked on"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((game, i) => (
          <a
            key={game.title}
            href={game.playStore}
            target="_blank"
            rel="noreferrer"
            className={`slide${i === index ? " is-active" : ""}`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
          >
            <img
              src={game.image}
              alt={`${game.title} gameplay`}
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="featured-overlay">
              <div className="featured-tags">
                <span className="tag tag-accent">
                  {game === featured ? "Featured" : game.genre}
                </span>
                {game.badge && <span className="tag">{game.badge}</span>}
              </div>
              <div>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <span className="featured-foot">
                  <span className="store-link">
                    <FaGooglePlay /> Google Play <FiArrowUpRight />
                  </span>
                  <Platforms game={game} />
                </span>
              </div>
            </div>
          </a>
        ))}

        <button
          type="button"
          className="slide-arrow slide-prev"
          onClick={() => go(index - 1)}
          aria-label="Previous game"
        >
          <FiChevronLeft />
        </button>
        <button
          type="button"
          className="slide-arrow slide-next"
          onClick={() => go(index + 1)}
          aria-label="Next game"
        >
          <FiChevronRight />
        </button>
      </div>

      <div className="slide-steps">
        {slides.map((game, i) => (
          <button
            type="button"
            key={game.title}
            className={`${i === index ? "is-active" : ""}${i < index ? " is-done" : ""}`}
            onClick={() => go(i)}
            aria-label={`Show ${game.title}`}
            aria-current={i === index}
          >
            <span
              key={i === index ? `run-${index}` : "idle"}
              className={i === index && animate ? "is-running" : ""}
            />
          </button>
        ))}
      </div>
    </div>
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
        const t = Math.min(1, (now - start) / 1400);
        const eased = 1 - Math.pow(1 - t, 3);
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

function Stats() {
  return (
    <section className="container stats-wrap" id="achievements" aria-label="Career stats">
      <p className="kicker mono stats-title">
        <FaTrophy /> Achievements unlocked
        <span className="stats-count">
          {stats.length}/{stats.length}
        </span>
      </p>
      <div className="stats">
        {stats.map((s, i) => {
          const meta = STAT_META[i % STAT_META.length];
          const Icon = meta.icon;
          return (
            <div
              className={`stat panel rarity-${meta.rarity.toLowerCase()}`}
              key={s.label}
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="stat-top">
                <span className="stat-icon">
                  <Icon />
                </span>
                <span className="mono stat-rarity">{meta.rarity}</span>
              </div>
              <div className="stat-value">
                <CountUp value={s.value} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          );
        })}
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
    el.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
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

function GameCard({ game, number }) {
  const tilt = useTilt();
  return (
    <article className="game-card panel" {...tilt}>
      <a href={game.playStore} target="_blank" rel="noreferrer" className="game-thumb">
        <img src={game.image} alt={`${game.title} screenshot`} loading="lazy" />
        <span className="tag">{game.genre}</span>
        {game.badge && <span className="tag tag-accent tag-badge">{game.badge}</span>}
        <span className="play-overlay" aria-hidden="true">
          <span>
            <FiPlay /> View on store
          </span>
        </span>
      </a>
      <div className="game-body">
        <div className="game-head">
          <h3>{game.title}</h3>
          <span className="mono game-num">#{pad(number)}</span>
        </div>
        <Platforms game={game} />
        <p>{game.description}</p>
        <StoreLinks game={game} />
      </div>
      <span className="glare" aria-hidden="true" />
    </article>
  );
}

const ALL = "All";
const genres = [ALL, ...new Set(games.map((g) => g.genre))];

function Games() {
  const [genre, setGenre] = useState(ALL);
  const shown = genre === ALL ? games : games.filter((g) => g.genre === genre);

  return (
    <section className="container section" id="games">
      <SectionHead index={1} kicker="Game library" title="Games I've worked on">
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
      <div className="game-grid">
        {shown.map((g) => (
          <GameCard game={g} number={games.indexOf(g) + 1} key={g.title} />
        ))}
      </div>
    </section>
  );
}

function Experience() {
  const levels = experience.length + 1;
  return (
    <section className="container section" id="experience">
      <SectionHead index={2} kicker="Career mode" title="Where I've worked" />
      <div className="timeline">
        {experience.map((job, i) => (
          <div className="job-row" key={job.company} data-reveal>
            <span className="job-node" aria-hidden="true" />
            <div className="job panel">
              <div className="job-meta">
                <span className="level mono">Lvl {levels - i}</span>
                <h3>{job.role}</h3>
                <p>
                  {job.company} · {job.period}
                </p>
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
              <div>
                <p className="job-summary">{job.summary}</p>
                {job.highlights && (
                  <>
                    <p className="objectives-title mono">
                      Objectives completed · {job.highlights.length}
                    </p>
                    <div className="highlights">
                      {job.highlights.map((h, j) => {
                        const Icon = HIGHLIGHT_ICONS[j % HIGHLIGHT_ICONS.length];
                        return (
                          <div className="highlight" key={h.title}>
                            <span className="highlight-icon">
                              <Icon />
                            </span>
                            <div>
                              <h4>{h.title}</h4>
                              <p>{h.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="job-row" data-reveal>
          <span className="job-node" aria-hidden="true" />
          <div className="job panel">
            <div className="job-meta">
              <span className="level mono">Lvl 1 · Tutorial</span>
              <h3>{education.degree}</h3>
              <p>
                {education.school} · {education.period}
              </p>
              <span className="status-tag is-done mono">
                <FiCheck /> Complete
              </span>
            </div>
            <p className="job-summary">
              Where I learned the fundamentals before getting into games.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="container section" id="skills">
      <SectionHead index={3} kicker="Loadout" title="What I work with" />
      <div className="skill-grid">
        {skills.map((s, i) => {
          const Icon = SKILL_ICONS[i % SKILL_ICONS.length];
          return (
            <div
              className="skill-group panel"
              key={s.group}
              data-reveal
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <div className="skill-head">
                <span className="skill-icon">
                  <Icon />
                </span>
                <span className="mono slot-key">Slot {i + 1}</span>
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
      <SectionHead index={4} kicker="Bonus stage" title="Take a quick break">
        <p className="lead">
          A tiny lane-dodger I built for this page. Dodge the traffic, grab the coins and see how
          far you get.
        </p>
      </SectionHead>
      <div data-reveal>
        <MiniGame />
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="container section" id="contact">
      <div className="contact panel" data-reveal>
        <div className="contact-text">
          <p className="kicker mono">
            <span className="live-dot" /> Lobby open · Looking for party
          </p>
          <h2>
            Ready for <span className="accent">player two?</span>
          </h2>
          <p className="lead">
            Open to game development roles and collaborations. Email, call or reach out on LinkedIn.
          </p>
        </div>
        <div className="contact-links">
          <a href={`mailto:${profile.email}`} className="contact-link is-primary">
            <FiMail />
            <span>
              <small className="mono">Email</small>
              {profile.email}
            </span>
            <FiArrowUpRight />
          </a>
          <a href={`tel:${profile.phone.replace(/-/g, "")}`} className="contact-link">
            <FiPhone />
            <span>
              <small className="mono">Phone</small>
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

function Toast({ show, retro }) {
  return (
    <div className={`toast${show ? " is-shown" : ""}`} role="status" aria-live="polite">
      {show && (
        <>
          <span className="toast-icon">
            <FaTrophy />
          </span>
          <span>
            <strong>Achievement unlocked</strong>
            <br />
            Cheat code accepted. Retro mode {retro ? "on" : "off"}.
          </span>
        </>
      )}
    </div>
  );
}

function App() {
  const [booting, setBooting] = useState(shouldBoot);
  const [retro, setRetro] = useState(false);
  const [toast, setToast] = useState(false);

  useReveal();

  const unlock = useCallback(() => {
    setRetro((r) => !r);
    setToast(true);
  }, []);
  useKonami(unlock);

  const endBoot = useCallback(() => setBooting(false), []);

  useEffect(() => {
    document.body.classList.toggle("retro", retro);
  }, [retro]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(false), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <>
      {booting && <Boot onDone={endBoot} />}
      <div className="bg-fx" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Stats />
        <Games />
        <Experience />
        <Skills />
        <Play />
        <Contact />
      </main>
      <footer className="footer container">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="cheat mono" title="Try it">
          ↑ ↑ ↓ ↓ ← → ← → B A
        </span>
        <span className="mono">{profile.location} · Thanks for playing</span>
      </footer>
      <Toast show={toast} retro={retro} />
    </>
  );
}

export default App;
