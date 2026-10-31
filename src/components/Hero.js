import { Fragment } from "react";
import { parseInstalls, installTier } from "../lib/installs";
import useLocalTime from "../hooks/useLocalTime";
import useFrameStats from "../hooks/useFrameStats";
import Icon from "./Icon";
import Meter from "./Meter";
import "./Hero.css";

const LEAD = "I make mobile games, and then I make them".split(" ");
const PAYOFF = "run well on cheap phones.".split(" ");

// Each word rises out of its own mask, one after another
function Words({ words, offset = 0 }) {
  return words.map((word, i) => (
    <Fragment key={`${word}-${i}`}>
      <span className="hero__word">
        <span style={{ "--i": offset + i }}>{word}</span>
      </span>
      {i < words.length - 1 && " "}
    </Fragment>
  ));
}

// Each shipped game's share of the combined installs, from its Play Store tier
function InstallSplit({ games }) {
  const shipped = games
    .map((g) => ({ ...g, installs: parseInstalls(g.badge) }))
    .filter((g) => g.installs)
    .sort((a, b) => b.installs - a.installs);

  return (
    <figure className="split">
      <div className="split__bar" aria-hidden="true">
        {shipped.map((g, i) => (
          <span
            key={g.title}
            className="split__segment"
            style={{ flexGrow: g.installs, "--i": i }}
            title={`${g.title}: ${installTier(g.badge)}`}
          />
        ))}
      </div>
      <figcaption className="split__caption">
        {shipped.length} shipped games, sized by Google Play install tier
      </figcaption>
      <ul className="visually-hidden">
        {shipped.map((g) => (
          <li key={g.title}>
            {g.title}: {installTier(g.badge)} installs
          </li>
        ))}
      </ul>
    </figure>
  );
}

const number = new Intl.NumberFormat("en-US");

// What the WebGL scene behind this section is doing on the visitor's device, right now.
// Every value is measured by the renderer (src/gl/terrain.js); nothing here is a figure of speech.
function FrameReadout() {
  const stats = useFrameStats();
  if (!stats) return null;

  const rows = [
    ["fps", stats.fps == null ? "—" : stats.fps],
    ["frame", stats.frameMs == null ? "—" : `${stats.frameMs.toFixed(1)} ms`],
    ["draw calls", stats.drawCalls],
    ["vertices", number.format(stats.vertices)],
    ["render", `${stats.width}×${stats.height}`],
    ["res scale", `${Math.round(stats.scale * 100)}%`],
  ];

  return (
    <div className="frame" aria-hidden="true">
      <p className="frame__title">
        <span className="frame__dot" />
        Live render · your device
      </p>
      <dl className="frame__grid">
        {rows.map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="frame__note">
        {stats.fps == null
          ? "One still frame, since you prefer reduced motion."
          : "Resolution drops on its own if your device can't hold the frame rate. Move the pointer to move the light."}
      </p>
    </div>
  );
}

export default function Hero({ profile, stats, games, resume, resumeName }) {
  const time = useLocalTime(profile.timeZone);
  const [downloads, anr, drawCalls] = stats;

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container hero__stage">
        <div className="hero__meta">
          <p className="label">
            {profile.role} <span aria-hidden="true">/</span> {profile.location}
          </p>
          <p className="hero__status label">
            <span className="hero__dot" aria-hidden="true" />
            {profile.status}
            {time && (
              <span className="hero__time">
                {" "}· {time} there ({profile.utcOffset})
              </span>
            )}
          </p>
        </div>

        <h1 id="hero-title" className="hero__title">
          <Words words={LEAD} /> <em><Words words={PAYOFF} offset={LEAD.length} /></em>
        </h1>

        <div className="hero__hud">
          <a className="hero__cue label" href="#brief">
            <span className="hero__cue-line" aria-hidden="true" />
            Scroll
          </a>
          <FrameReadout />
        </div>
      </div>

      <div className="hero__brief" id="brief">
        <div className="container hero__grid">
          <div className="hero__body" data-reveal>
            <p className="hero__lede">
              Hi, I'm Shadman. I've spent the last five years building games in Unity and C#,
              mostly racing, parking and action titles for Android and iOS. Together the games
              I've worked on have been downloaded more than 325 million times on Google Play.
            </p>
            <p>
              Most of my day goes into the less glamorous part: profiling, cutting draw calls,
              getting memory down so a game survives on a 2&nbsp;GB phone, and porting Android
              builds to iOS. I'm currently a senior game developer at Terafort, working remotely.
            </p>

            <div className="hero__actions">
              <a className="button button--solid" href={`mailto:${profile.email}`}>
                Email me
                <Icon name="arrow" />
              </a>
              <a className="button" href={resume} download={resumeName}>
                Resume (PDF)
                <Icon name="down" />
              </a>
            </div>
            <p className="hero__links">
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="#work">See the games</a>
            </p>
          </div>

          <aside className="readouts" aria-label="Key numbers" data-reveal style={{ "--reveal-delay": "120ms" }}>
            <div className="readout readout--wide">
              <p className="readout__name label">Downloads</p>
              <p className="readout__value">{downloads.value}</p>
              <p className="readout__label">{downloads.label}</p>
              <InstallSplit games={games} />
            </div>
            {[anr, drawCalls].map((s) => (
              <div className="readout" key={s.name}>
                <p className="readout__name label">{s.name}</p>
                <p className="readout__value">{s.value}</p>
                <p className="readout__label">{s.label}</p>
                <Meter name={s.name} before={s.before} after={s.after} unit={s.unit} />
                {s.note && <p className="readout__note">{s.note}</p>}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
