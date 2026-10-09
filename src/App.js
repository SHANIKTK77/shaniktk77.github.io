import React from "react";
import {
  FaGithub,
  FaLinkedinIn,
  FaGooglePlay,
  FaApple,
  FaAndroid,
} from "react-icons/fa";
import { FiArrowUpRight, FiDownload, FiMail } from "react-icons/fi";
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
import "./App.css";

const featured = games.find((g) => g.title === featuredTitle) || games[0];

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

function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" className="nav-logo">
          SK<span>.</span>
        </a>
        <nav className="nav-links">
          <a href="#games">Games</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href={resume} download="Shadman-Khan-Khattak-Resume.pdf" className="btn btn-small">
          <FiDownload /> Resume
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero container" id="top">
      <div className="hero-text">
        <p className="eyebrow">
          <span className="live-dot" /> {profile.role} · Android · iOS
        </p>
        <h1>
          I build and ship <span className="accent">mobile games</span> people
          actually play.
        </h1>
        <p className="lead">
          I'm {profile.name}, a Unity developer at Terafort with 4+ years
          shipping mobile games. I specialize in performance optimization,
          end-to-end iOS porting and multiplayer systems.
        </p>
        <div className="hero-actions">
          <a href="#games" className="btn btn-primary">
            See my games
          </a>
          <a href={resume} download="Shadman-Khan-Khattak-Resume.pdf" className="btn">
            <FiDownload /> Download resume
          </a>
        </div>
        <div className="focus">
          {profile.focus.map((f) => (
            <span className="chip" key={f}>
              {f}
            </span>
          ))}
        </div>
      </div>

      <a
        href={featured.playStore}
        target="_blank"
        rel="noreferrer"
        className="featured"
      >
        <img src={featured.image} alt={`${featured.title} gameplay`} />
        <div className="featured-overlay">
          <span className="tag tag-accent">
            Featured{featured.badge && ` · ${featured.badge}`}
          </span>
          <div>
            <h3>{featured.title}</h3>
            <p>{featured.description}</p>
            <span className="featured-foot">
              <span className="store-link">
                <FaGooglePlay /> Google Play <FiArrowUpRight />
              </span>
              <Platforms game={featured} />
            </span>
          </div>
        </div>
      </a>
    </section>
  );
}

function Stats() {
  return (
    <section className="container stats">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </section>
  );
}

function GameCard({ game }) {
  return (
    <article className="game-card">
      <a href={game.playStore} target="_blank" rel="noreferrer" className="game-thumb">
        <img src={game.image} alt={`${game.title} screenshot`} loading="lazy" />
        <span className="tag">{game.genre}</span>
        {game.badge && <span className="tag tag-accent tag-badge">{game.badge}</span>}
      </a>
      <div className="game-body">
        <h3>{game.title}</h3>
        <Platforms game={game} />
        <p>{game.description}</p>
        <StoreLinks game={game} />
      </div>
    </article>
  );
}

function Games() {
  return (
    <section className="container section" id="games">
      <div className="section-head">
        <p className="eyebrow">Shipped titles</p>
        <h2>Games I've worked on</h2>
      </div>
      <div className="game-grid">
        {games.map((g) => (
          <GameCard game={g} key={g.title} />
        ))}
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section className="container section" id="experience">
      <div className="section-head">
        <p className="eyebrow">Career</p>
        <h2>Experience</h2>
      </div>
      <div className="timeline">
        {experience.map((job) => (
          <div className="job" key={job.company}>
            <div className="job-meta">
              <h3>{job.role}</h3>
              <p>
                {job.company} · {job.period}
              </p>
            </div>
            <ul>
              {job.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="job">
          <div className="job-meta">
            <h3>{education.degree}</h3>
            <p>
              {education.school} · {education.period}
            </p>
          </div>
          <p className="job-note">Education</p>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="container section" id="skills">
      <div className="section-head">
        <p className="eyebrow">Toolkit</p>
        <h2>Skills and SDKs</h2>
      </div>
      <div className="skill-grid">
        {skills.map((s) => (
          <div className="skill-group" key={s.group}>
            <h3>{s.group}</h3>
            <div className="chips">
              {s.items.map((i) => (
                <span className="chip" key={i}>
                  {i}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="container section contact" id="contact">
      <h2>Let's build your next game.</h2>
      <p className="lead">
        Open to Unity game development roles and collaborations. Email me or
        reach out on LinkedIn.
      </p>
      <div className="hero-actions">
        <a href={`mailto:${profile.email}`} className="btn btn-primary">
          <FiMail /> {profile.email}
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

function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Games />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <footer className="footer container">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>{profile.location}</span>
      </footer>
    </>
  );
}

export default App;
