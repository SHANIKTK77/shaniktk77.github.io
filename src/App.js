import React from "react";
import { FaGithub, FaLinkedinIn, FaGooglePlay } from "react-icons/fa";
import { FiArrowUpRight, FiDownload } from "react-icons/fi";
import resume from "./Assets/Resume.pdf";
import { profile, stats, games, experience, skills } from "./data";
import "./App.css";

const featured = games[0];

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
          <span className="live-dot" /> {profile.role} · Unity · Android
        </p>
        <h1>
          I build and ship <span className="accent">mobile games</span> people
          actually play.
        </h1>
        <p className="lead">
          I'm {profile.name}, a game developer at Terafort. I prototype
          mechanics, ship racing, shooter and simulation titles to Google Play,
          and keep them fast and stable in production.
        </p>
        <div className="hero-actions">
          <a href="#games" className="btn btn-primary">
            See my games
          </a>
          <a href={resume} download="Shadman-Khan-Khattak-Resume.pdf" className="btn">
            <FiDownload /> Download resume
          </a>
        </div>
      </div>

      <a
        href={featured.link}
        target="_blank"
        rel="noreferrer"
        className="featured"
      >
        <img src={featured.image} alt={`${featured.title} gameplay`} />
        <div className="featured-overlay">
          <span className="tag tag-accent">Featured</span>
          <div>
            <h3>{featured.title}</h3>
            <p>{featured.description}</p>
            <span className="store-link">
              <FaGooglePlay /> Google Play <FiArrowUpRight />
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
    <a href={game.link} target="_blank" rel="noreferrer" className="game-card">
      <div className="game-thumb">
        <img src={game.image} alt={`${game.title} screenshot`} loading="lazy" />
        <span className="tag">{game.genre}</span>
      </div>
      <div className="game-body">
        <h3>{game.title}</h3>
        <p>{game.description}</p>
        <span className="store-link">
          <FaGooglePlay /> Google Play <FiArrowUpRight />
        </span>
      </div>
    </a>
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
        Open to game development roles and collaborations. The fastest way to
        reach me is LinkedIn.
      </p>
      <div className="hero-actions">
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn btn-primary">
          <FaLinkedinIn /> Message on LinkedIn
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
