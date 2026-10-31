import { parseInstalls, installTier, installScale } from "../lib/installs";
import { section } from "../sections";
import SectionHead from "./SectionHead";
import Shot from "./Shot";
import Icon from "./Icon";
import "./Work.css";

const { index, label } = section("work");

const platformText = (platforms) => platforms.join(" + ");

function GameRow({ game, number }) {
  const tier = installTier(game.badge);
  const scale = installScale(parseInstalls(game.badge));

  return (
    <li className="game" data-reveal>
      <span className="game__index" aria-hidden="true">
        {String(number).padStart(2, "0")}
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
        <p className="game__meta-inline">
          {game.genre} · {platformText(game.platforms)}
        </p>
        {game.description && <p className="game__note">{game.description}</p>}
        {game.appStore && (
          <a className="game__extra" href={game.appStore} target="_blank" rel="noreferrer">
            Also on the App Store
          </a>
        )}
      </div>
      <p className="game__col game__genre">
        <span className="visually-hidden">Genre: </span>
        {game.genre}
      </p>
      <p className="game__col game__platforms">
        <span className="visually-hidden">Platforms: </span>
        {platformText(game.platforms)}
      </p>
      <div className="game__installs">
        <span className="game__tier">
          {tier}
          <span className="visually-hidden"> installs on Google Play</span>
        </span>
        <span className="game__track" aria-hidden="true">
          <span className="game__fill" style={{ "--fill": scale }} />
        </span>
      </div>
      <span className="game__arrow" aria-hidden="true">
        <Icon name="arrow" />
      </span>
    </li>
  );
}

function SoloProject({ game }) {
  return (
    <article className="solo" data-reveal aria-labelledby="solo-title">
      <div className="solo__media">
        <Shot src={game.image} title={game.title} />
      </div>
      <div className="solo__body">
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
          <div className="ledger__head label" aria-hidden="true">
            <span>No.</span>
            <span />
            <span>Title</span>
            <span>Genre</span>
            <span>Platforms</span>
            <span>Play installs</span>
            <span />
          </div>
          <ol className="ledger__rows">
            {team.map((g, i) => (
              <GameRow game={g} number={i + 1} key={g.title} />
            ))}
          </ol>
        </div>

        {own && <SoloProject game={own} />}
      </div>
    </section>
  );
}
