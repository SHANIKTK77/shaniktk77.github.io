import { parseInstalls, installTier } from "../lib/installs";
import useLocalTime from "../hooks/useLocalTime";
import Icon from "./Icon";
import Meter from "./Meter";
import "./Hero.css";

// Each shipped game's share of the combined installs, from its Play Store tier
function InstallSplit({ games }) {
  const shipped = games
    .map((g) => ({ ...g, installs: parseInstalls(g.badge) }))
    .filter((g) => g.installs)
    .sort((a, b) => b.installs - a.installs);

  return (
    <figure className="split">
      <div className="split__bar" aria-hidden="true">
        {shipped.map((g) => (
          <span
            key={g.title}
            className="split__segment"
            style={{ flexGrow: g.installs }}
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

export default function Hero({ profile, stats, games, resume, resumeName }) {
  const time = useLocalTime(profile.timeZone);
  const [downloads, anr, drawCalls] = stats;

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero__meta" data-reveal>
          <p className="label">
            {profile.role} <span aria-hidden="true">/</span> {profile.location}
          </p>
          <p className="hero__status label">
            <span className="hero__dot" aria-hidden="true" />
            Available for remote and contract work
            {time && (
              <span className="hero__time">
                {" "}· {time} there ({profile.utcOffset})
              </span>
            )}
          </p>
        </div>

        <h1 id="hero-title" className="hero__title" data-reveal style={{ "--reveal-delay": "80ms" }}>
          I make mobile games, and then I make them <em>run well on cheap phones.</em>
        </h1>

        <div className="hero__grid">
          <div className="hero__body" data-reveal style={{ "--reveal-delay": "160ms" }}>
            <p>
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

          <aside
            className="readouts"
            aria-label="Key numbers"
            data-reveal
            style={{ "--reveal-delay": "240ms" }}
          >
            <div className="readout">
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
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
