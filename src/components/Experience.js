import { section } from "../sections";
import SectionHead from "./SectionHead";
import "./Experience.css";

const { index, label } = section("experience");

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
  return (
    <li className="entry" data-reveal>
      <p className="entry__when label">{period}</p>
      <div className="entry__body">
        <h3>{title}</h3>
        <p className="entry__where">{place}</p>
        {children}
      </div>
    </li>
  );
}

export default function Experience({ experience, education }) {
  return (
    <section className="section experience" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionHead index={index} label={label} id="experience-title" title="Experience">
          <p>Five years in games, after a year running IoT systems.</p>
        </SectionHead>

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
