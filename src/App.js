import React from "react";
import resume from "./Assets/Resume.pdf";
import { profile, stats, games, experience, education, skills } from "./data";
import "./App.css";

const RESUME_NAME = "Shadman-Khan-Khattak-Resume.pdf";

const team = games.filter((g) => !g.personal);
const own = games.find((g) => g.personal);

// The three numbers I lead with; the "years" stat is already in the intro
const highlights = stats.slice(0, 3);

function Header() {
  return (
    <header className="header">
      <div className="wrap header-inner">
        <a href="#top" className="wordmark">
          Shadman Khan Khattak
        </a>
        <nav className="header-nav" aria-label="Sections">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}

function Intro() {
  return (
    <section className="wrap intro" id="top">
      <p className="eyebrow">{profile.role} · {profile.location}</p>
      <h1>
        I make mobile games, and then I make them run well on cheap phones.
      </h1>
      <div className="intro-text">
        <p>
          Hi, I'm Shadman. I've spent the last five years building games in Unity and C#, mostly
          racing, parking and action titles for Android and iOS. Together the games I've worked on
          have been downloaded more than 325 million times on Google Play.
        </p>
        <p>
          Most of my day goes into the less glamorous part: profiling, cutting draw calls, getting
          memory down so a game survives on a 2&nbsp;GB phone, and porting Android builds to iOS.
          I'm currently a senior game developer at Terafort, working remotely.
        </p>
      </div>
      <p className="intro-links">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href={resume} download={RESUME_NAME}>
          Resume (PDF)
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href={profile.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </p>

      <dl className="numbers">
        {highlights.map((s) => (
          <div key={s.label}>
            <dt>{s.value}</dt>
            <dd>{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function GameCard({ game }) {
  return (
    <li className="game">
      <a href={game.playStore} target="_blank" rel="noreferrer" className="game-thumb">
        <img src={game.image} alt={`Screenshot of ${game.title}`} loading="lazy" />
      </a>
      <h3>
        <a href={game.playStore} target="_blank" rel="noreferrer">
          {game.title}
        </a>
      </h3>
      <p className="game-meta">
        {game.genre} · {game.badge}
        {game.platforms.includes("iOS") ? " · Android & iOS" : " · Android"}
      </p>
      {game.description && <p className="game-note">{game.description}</p>}
      {game.appStore && (
        <a href={game.appStore} target="_blank" rel="noreferrer" className="game-extra">
          App Store
        </a>
      )}
    </li>
  );
}

function Work() {
  return (
    <section className="wrap section" id="work">
      <div className="section-head">
        <h2>Games I've worked on</h2>
        <p>
          These shipped while I was on the Unity team. Where a part was mine, I've noted it.
          Each one links to its Google Play page.
        </p>
      </div>
      <ul className="games">
        {team.map((g) => (
          <GameCard game={g} key={g.title} />
        ))}
      </ul>

      {own && (
        <article className="own">
          <a href={own.playStore} target="_blank" rel="noreferrer" className="own-thumb">
            <img src={own.image} alt={`Screenshot of ${own.title}`} loading="lazy" />
          </a>
          <div>
            <p className="eyebrow">On my own time</p>
            <h3>{own.title}</h3>
            <p>{own.description}</p>
            <a href={own.playStore} target="_blank" rel="noreferrer">
              See it on Google Play
            </a>
          </div>
        </article>
      )}
    </section>
  );
}

function Experience() {
  return (
    <section className="wrap section" id="experience">
      <div className="section-head">
        <h2>Experience</h2>
      </div>
      <ol className="jobs">
        {experience.map((job) => (
          <li className="job" key={job.company}>
            <p className="job-when">{job.period}</p>
            <div>
              <h3>{job.role}</h3>
              <p className="job-where">{job.company}</p>
              {job.track && <p className="job-track">{job.track.join(" → ")}</p>}
              <p>{job.summary}</p>
              {job.highlights && (
                <ul className="job-points">
                  {job.highlights.map((h) => (
                    <li key={h.title}>
                      <strong>{h.title}.</strong> {h.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
        <li className="job">
          <p className="job-when">{education.period}</p>
          <div>
            <h3>{education.degree}</h3>
            <p className="job-where">{education.school}</p>
          </div>
        </li>
      </ol>
    </section>
  );
}

function Skills() {
  return (
    <section className="wrap section" id="skills">
      <div className="section-head">
        <h2>Skills and tools</h2>
      </div>
      <dl className="skills">
        {skills.map((s) => (
          <div key={s.group}>
            <dt>{s.group}</dt>
            <dd>{s.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Contact() {
  return (
    <section className="wrap section contact" id="contact">
      <h2>Get in touch</h2>
      <p>{profile.availability} Email is the quickest way to reach me.</p>
      <a href={`mailto:${profile.email}`} className="contact-email">
        {profile.email}
      </a>
      <ul className="contact-list">
        <li>
          Phone: <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</a>
        </li>
        <li>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </li>
        <li>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a href={resume} download={RESUME_NAME}>
            Download my resume
          </a>
        </li>
      </ul>
    </section>
  );
}

function Footer() {
  return (
    <footer className="wrap footer">
      <p>© {new Date().getFullYear()} {profile.name}</p>
      <a href="/privacy-policy">Privacy policy</a>
    </footer>
  );
}

function App() {
  return (
    <>
      <Header />
      <main>
        <Intro />
        <Work />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
