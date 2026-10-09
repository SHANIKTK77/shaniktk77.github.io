import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaGithub,
  FaLinkedinIn,
  FaGooglePlay,
  FaApple,
  FaAndroid,
  FaTrophy,
} from "react-icons/fa";
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
} from "react-icons/fi";
import resume from "./Assets/Resume.pdf";
import {
  profile,
  stats,
  featuredTitle,
  games,
  experience,
  education,
  skills,
} from "./data";
import MiniGame from "./MiniGame";
import "./App.css";

const featured = games.find((g) => g.title === featuredTitle) || games[0];
// Featured game leads the hero slideshow, followed by the rest
const slides = [featured, ...games.filter((g) => g !== featured)];

// Icons for the experience highlight cards, in the order they appear in data.js
const HIGHLIGHT_ICONS = [FiZap, FiCpu, FiShield, FiSmartphone, FiUsers, FiTerminal];

const pad = (n) => String(n).padStart(2, "0");

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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

function SectionHead({ stage, eyebrow, title, children }) {
  return (
    <div className="section-head" data-reveal>
      <p className="stage">
        <span className="stage-num">STAGE {pad(stage)}</span>
        <span className="stage-line" />
        <span className="stage-name">{eyebrow}</span>
      </p>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function Nav() {
  const [progress, setProgress] = useState(0);

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

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" className="nav-logo" aria-label="Back to top">
          <span className="logo-box">SK</span>
          <span className="logo-p1">P1</span>
        </a>
        <nav className="nav-links">
          <a href="#games">Games</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#play">Play</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href={resume} download="Shadman-Khan-Khattak-Resume.pdf" className="btn btn-small">
          <FiDownload /> Resume
        </a>
      </div>
      <div className="xp" aria-hidden="true">
        <div className="xp-fill" style={{ transform: `scaleX(${progress})` }} />
        <span className="xp-label">XP {Math.round(progress * 100)}%</span>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-wrap" id="top">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-sun" />
        <div className="hero-grid" />
        <div className="hero-stars" />
      </div>

      <div className="hero container">
        <div className="hero-text">
          <p className="eyebrow hud-label">
            <span className="live-dot" /> PLAYER 1 · {profile.role.toUpperCase()}
          </p>
          <h1>
            I make games that run{" "}
            <span className="accent glitch" data-text="smooth on every platform.">
              smooth on every platform.
            </span>
          </h1>
          <p className="lead">
            I'm {profile.name}, a game developer at Terafort with 4+ years
            shipping games in Unity, plus hands-on Unreal Engine experience. I
            build for Android, iOS, tvOS and Android TV, and specialize in
            performance optimization, cross-platform porting and multiplayer.
          </p>
          <div className="hero-actions">
            <a href="#games" className="btn btn-primary btn-start">
              <FiPlay /> Press start
            </a>
            <a href={resume} download="Shadman-Khan-Khattak-Resume.pdf" className="btn">
              <FiDownload /> Download resume
            </a>
          </div>
          <div className="focus">
            {profile.focus.map((f) => (
              <span className="chip chip-perk" key={f}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <Slideshow />
      </div>

      <a href="#achievements" className="scroll-hint" aria-label="Scroll down">
        <span>SCROLL</span>
        <i />
      </a>
    </section>
  );
}

const SLIDE_MS = 5000;

function Slideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = slides.length;

  const go = useCallback((i) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return undefined;
    const id = setTimeout(() => go(index + 1), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, paused, go]);

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
    <div className="hud-frame">
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div className="hud-bar">
        <span>
          <span className="rec" /> NOW PLAYING
        </span>
        <span>
          {pad(index + 1)}/{pad(count)}
        </span>
      </div>
      <div
        className="featured"
        role="region"
        aria-roledescription="carousel"
        aria-label="Games I've worked on"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
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
              <span className="tag tag-accent">
                {game === featured ? "Featured" : game.genre}
                {game.badge && ` · ${game.badge}`}
              </span>
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
        <div className="scanlines" aria-hidden="true" />
        {!paused && !prefersReducedMotion() && (
          <div className="slide-timer" key={index} aria-hidden="true" />
        )}

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

        <div className="slide-dots">
          {slides.map((game, i) => (
            <button
              type="button"
              key={game.title}
              className={i === index ? "is-active" : ""}
              onClick={() => go(i)}
              aria-label={`Show ${game.title}`}
              aria-current={i === index}
            />
          ))}
        </div>
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
    <section className="container stats-wrap" id="achievements">
      <p className="hud-label stats-title">
        <FaTrophy /> ACHIEVEMENTS UNLOCKED · {stats.length}/{stats.length}
      </p>
      <div className="stats">
        {stats.map((s, i) => (
          <div
            className="stat"
            key={s.label}
            data-reveal
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="stat-value">
              <CountUp value={s.value} />
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-bar">
              <span />
            </div>
          </div>
        ))}
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
    el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
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
    <article className="game-card" {...tilt}>
      <a href={game.playStore} target="_blank" rel="noreferrer" className="game-thumb">
        <img src={game.image} alt={`${game.title} screenshot`} loading="lazy" />
        <span className="tag">{game.genre}</span>
        {game.badge && <span className="tag tag-accent tag-badge">{game.badge}</span>}
        <span className="play-overlay" aria-hidden="true">
          <span>
            <FiPlay /> PLAY
          </span>
        </span>
      </a>
      <div className="game-body">
        <span className="game-num">#{pad(number)}</span>
        <h3>{game.title}</h3>
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
      <SectionHead stage={1} eyebrow="Shipped titles" title="Games I've worked on">
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
      <SectionHead stage={2} eyebrow="Quest log" title="Where I've worked" />
      <div className="timeline">
        {experience.map((job, i) => (
          <div className="job" key={job.company} data-reveal>
            <span className="job-node" aria-hidden="true" />
            <div className="job-meta">
              <span className="level">LVL {levels - i}</span>
              <h3>{job.role}</h3>
              <p>
                {job.company} · {job.period}
              </p>
              {i === 0 && <span className="status-tag">● IN PROGRESS</span>}
            </div>
            <div>
              <p className="job-summary">{job.summary}</p>
              {job.highlights && (
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
              )}
            </div>
          </div>
        ))}
        <div className="job" data-reveal>
          <span className="job-node" aria-hidden="true" />
          <div className="job-meta">
            <span className="level">LVL 1 · TUTORIAL</span>
            <h3>{education.degree}</h3>
            <p>
              {education.school} · {education.period}
            </p>
          </div>
          <p className="job-summary">Where I learned the fundamentals before getting into games.</p>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="container section" id="skills">
      <SectionHead stage={3} eyebrow="Loadout" title="What I work with" />
      <div className="skill-grid">
        {skills.map((s, i) => (
          <div
            className="skill-group"
            key={s.group}
            data-reveal
            style={{ transitionDelay: `${(i % 3) * 80}ms` }}
          >
            <h3>
              <span className="slot-key">{i + 1}</span>
              {s.group}
            </h3>
            <div className="chips">
              {s.items.map((item) => (
                <span className="chip chip-slot" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Play() {
  return (
    <section className="container section" id="play">
      <SectionHead stage={4} eyebrow="Bonus stage" title="Take a quick break.">
        <p className="lead">
          A tiny lane-dodger I built for this page. Dodge the traffic, grab the
          coins and see how far you get.
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
    <section className="container section contact" id="contact">
      <p className="hud-label continue">
        CONTINUE? <span className="blink">▮</span>
      </p>
      <h2>
        Ready for <span className="accent">player two?</span>
      </h2>
      <p className="lead">
        Open to game development roles and collaborations. Email, call or
        reach out on LinkedIn.
      </p>
      <div className="hero-actions">
        <a href={`mailto:${profile.email}`} className="btn btn-primary">
          <FiMail /> {profile.email}
        </a>
        <a href={`tel:${profile.phone.replace(/-/g, "")}`} className="btn">
          <FiPhone /> {profile.phone}
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn">
          <FaLinkedinIn /> LinkedIn
        </a>
        <a href={profile.github} target="_blank" rel="noreferrer" className="btn">
          <FaGithub /> GitHub
        </a>
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
  const [retro, setRetro] = useState(false);
  const [toast, setToast] = useState(false);

  useReveal();

  const unlock = useCallback(() => {
    setRetro((r) => !r);
    setToast(true);
  }, []);
  useKonami(unlock);

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
      <div className="noise" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Games />
        <Experience />
        <Skills />
        <Play />
        <Contact />
      </main>
      <footer className="footer container">
        <span>
          © {new Date().getFullYear()} {profile.name} · Thanks for playing
        </span>
        <span className="cheat" title="Try it">
          ↑ ↑ ↓ ↓ ← → ← → B A
        </span>
        <span>{profile.location}</span>
      </footer>
      <Toast show={toast} retro={retro} />
    </>
  );
}

export default App;
