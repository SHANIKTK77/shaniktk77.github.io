import { section } from "../sections";
import { parsePeriod, formatSpan } from "../lib/period";
import SectionHead from "./SectionHead";
import "./Experience.css";

const { index, label } = section("experience");

// The career drawn like a profiler capture: one track per role on a shared time axis,
// each bar as long as the role lasted. Built entirely from the period strings in data.js.
function Profiler({ items }) {
  const tracks = items
    .map((item) => ({ ...item, span: parsePeriod(item.period) }))
    .filter((item) => item.span)
    .sort((a, b) => a.span.start - b.span.start);
  if (!tracks.length) return null;

  const from = Math.floor(Math.min(...tracks.map((t) => t.span.start)));
  const to = Math.ceil(Math.max(...tracks.map((t) => t.span.end)) + 0.01);
  const x = (year) => ((year - from) / (to - from)) * 100;
  const years = Array.from({ length: to - from + 1 }, (_, i) => from + i);

  return (
    <figure className="profiler" data-reveal>
      <div className="profiler__head label" aria-hidden="true">
        <span>Capture · {from}–now</span>
        <span>{tracks.length} tracks</span>
      </div>
      <div className="profiler__body" aria-hidden="true" style={{ "--years": to - from }}>
        <div className="profiler__row profiler__row--axis">
          <span />
          <div className="profiler__lane">
            {years.map((year) => (
              <span key={year} className="profiler__tick" style={{ left: `${x(year)}%` }}>
                <span>{year}</span>
              </span>
            ))}
          </div>
        </div>
        {tracks.map((t, i) => (
          <div className="profiler__row" key={t.title}>
            <span className="profiler__name">{t.place.split(" · ")[0]}</span>
            <div className="profiler__lane">
              <span
                className={`profiler__bar${t.span.current ? " is-current" : ""}`}
                style={{
                  left: `${x(t.span.start)}%`,
                  width: `${x(t.span.end) - x(t.span.start)}%`,
                  "--i": i,
                }}
              />
              <span
                className={`profiler__span${x(t.span.end) > 80 ? " is-inside" : ""}`}
                style={{ left: `${x(t.span.end)}%` }}
              >
                {formatSpan(t.span.end - t.span.start)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="profiler__caption">
        Each bar is one role or course on a shared time axis, as long as it lasted.
      </figcaption>
      <ul className="visually-hidden">
        {tracks.map((t) => (
          <li key={t.title}>
            {t.title}, {t.place}: {t.period}
          </li>
        ))}
      </ul>
    </figure>
  );
}

// Intern → Trainee → … drawn as steps on a line
function Track({ steps }) {
  return (
    <ol className="track" aria-label="Progression">
      {steps.map((step, i) => (
        <li key={step} className={i === steps.length - 1 ? "is-current" : undefined}>
          {step}
        </li>
      ))}
    </ol>
  );
}

function Entry({ period, title, place, children }) {
  const span = parsePeriod(period);

  return (
    <li className="entry" data-reveal>
      <div className="entry__when">
        <p className="label">{period}</p>
        {span && <p className="entry__span">{formatSpan(span.end - span.start)}</p>}
      </div>
      <div className="entry__body">
        <h3>{title}</h3>
        <p className="entry__where">{place}</p>
        {children}
      </div>
    </li>
  );
}

export default function Experience({ experience, education, intro }) {
  const items = [
    ...experience.map((job) => ({ title: job.role, place: job.company, period: job.period })),
    { title: education.degree, place: education.school, period: education.period },
  ];

  return (
    <section className="section experience" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionHead index={index} label={label} id="experience-title" title="Experience">
          <p>{intro}</p>
        </SectionHead>

        <Profiler items={items} />

        <ol className="timeline">
          {experience.map((job) => (
            <Entry key={job.company} period={job.period} title={job.role} place={job.company}>
              {job.track && <Track steps={job.track} />}
              <p className="entry__summary">{job.summary}</p>
              {job.highlights && (
                <ol className="points">
                  {job.highlights.map((h, i) => (
                    <li key={h.title} className="point">
                      <span className="point__index" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h4>{h.title}</h4>
                      <p>{h.text}</p>
                    </li>
                  ))}
                </ol>
              )}
            </Entry>
          ))}
          <Entry period={education.period} title={education.degree} place={education.school} />
        </ol>
      </div>
    </section>
  );
}
