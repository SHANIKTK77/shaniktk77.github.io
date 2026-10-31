import { useEffect, useRef, useState } from "react";
import { parseInstalls, installTier, installScale } from "../lib/installs";
import { section } from "../sections";
import SectionHead from "./SectionHead";
import Shot from "./Shot";
import Icon from "./Icon";
import "./Work.css";

const { index, label } = section("work");

const platformText = (platforms) => platforms.join(" + ");
const pad = (n) => String(n).padStart(2, "0");

function InstallBar({ badge }) {
  return (
    <span className="installs__track" aria-hidden="true">
      <span className="installs__fill" style={{ "--fill": installScale(parseInstalls(badge)) }} />
    </span>
  );
}

function GameRow({ game, number, active, onActivate }) {
  const ref = useRef(null);

  // The row crossing the middle of the screen becomes the one shown in the game view
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && onActivate(),
      { rootMargin: "-48% 0px -48% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onActivate]);

  return (
    <li
      ref={ref}
      className={`game${active ? " is-active" : ""}`}
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <span className="game__index" aria-hidden="true">
        {pad(number)}
      </span>
      <div className="game__thumb">
        <Shot src={game.image} title={game.title} />
      </div>
      <div className="game__main">
        <h3 className="game__title">
          <a className="game__link" href={game.playStore} target="_blank" rel="noreferrer">
            {game.title}
            <span className="visually-hidden"> on Google Play (opens in a new tab)</span>
          </a>
        </h3>
        <p className="game__meta">
          <span className="visually-hidden">Genre and platforms: </span>
          {game.genre} · {platformText(game.platforms)}
        </p>
        {game.description && <p className="game__note">{game.description}</p>}
        {game.appStore && (
          <a className="game__extra" href={game.appStore} target="_blank" rel="noreferrer">
            Also on the App Store
          </a>
        )}
      </div>
      <div className="game__installs">
        <span className="game__tier">
          {installTier(game.badge)}
          <span className="visually-hidden"> installs on Google Play</span>
        </span>
        <InstallBar badge={game.badge} />
      </div>
      <span className="game__arrow" aria-hidden="true">
        <Icon name="arrow" />
      </span>
    </li>
  );
}

// The sticky "game view" beside the list on wide screens. It repeats what the active row
// already says, so it's hidden from assistive tech.
function GameView({ games, active }) {
  const game = games[active];

  return (
    <div className="viewport" aria-hidden="true">
      <div className="viewport__bar label">
        <span>
          <span className="viewport__live" /> Game view
        </span>
        <span>1280×720 · 16:9</span>
      </div>
      <div className="viewport__stage ticks">
        {games.map((g, i) => (
          <div key={g.title} className={`viewport__shot${i === active ? " is-active" : ""}`}>
            <Shot src={g.image} title={g.title} />
          </div>
        ))}
        <span className="viewport__count">
          {pad(active + 1)} / {pad(games.length)}
        </span>
      </div>
      <div className="viewport__info" key={game.title}>
        <p className="viewport__title">{game.title}</p>
        <div className="viewport__installs">
          <span className="viewport__tier">{installTier(game.badge)}</span>
          <span className="label">Google Play installs</span>
          <InstallBar badge={game.badge} />
        </div>
        <p className="viewport__meta label">
          {game.genre} · {platformText(game.platforms)}
        </p>
        {game.description && <p className="viewport__note">{game.description}</p>}
      </div>
    </div>
  );
}

function SoloProject({ game }) {
  return (
    <article className="solo" aria-labelledby="solo-title">
      <div className="solo__media" data-reveal="wipe">
        <Shot src={game.image} title={game.title} />
      </div>
      <div className="solo__body" data-reveal>
        <p className="label solo__label">Solo project · Built on my own time</p>
        <h3 id="solo-title">{game.title}</h3>
        <p className="solo__text">{game.description}</p>
        <dl className="solo__facts">
          <div>
            <dt className="label">Genre</dt>
            <dd>{game.genre}</dd>
          </div>
          <div>
            <dt className="label">Platforms</dt>
            <dd>{platformText(game.platforms)}</dd>
          </div>
        </dl>
        <a className="button button--inverse" href={game.playStore} target="_blank" rel="noreferrer">
          See it on Google Play
          <Icon name="arrow" />
        </a>
      </div>
    </article>
  );
}

export default function Work({ games }) {
  const team = games.filter((g) => !g.personal);
  const own = games.find((g) => g.personal);
  const [active, setActive] = useState(0);
  // Stable callbacks per row so their observers aren't recreated on every render
  const activators = useRef([]);
  const activate = (i) => (activators.current[i] ||= () => setActive(i));

  return (
    <section className="section work" id="work" aria-labelledby="work-title">
      <div className="container">
        <SectionHead index={index} label={label} id="work-title" title="Games I've worked on">
          <p>
            These shipped while I was on the Unity team. Where a part was mine, I've noted it.
            Each one links to its Google Play page.
          </p>
        </SectionHead>

        <div className="ledger">
          <GameView games={team} active={active} />
          <ol className="ledger__rows">
            {team.map((g, i) => (
              <GameRow
                game={g}
                number={i + 1}
                key={g.title}
                active={i === active}
                onActivate={activate(i)}
              />
            ))}
          </ol>
        </div>

        {own && <SoloProject game={own} />}
      </div>
    </section>
  );
}
