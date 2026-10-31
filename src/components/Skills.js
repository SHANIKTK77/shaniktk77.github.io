import { section } from "../sections";
import SectionHead from "./SectionHead";
import "./Skills.css";

const { index, label } = section("skills");

export default function Skills({ skills }) {
  return (
    <section className="section skills" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHead index={index} label={label} id="skills-title" title="Skills and tools" />
        <dl className="spec">
          {skills.map((group) => (
            <div className="spec__row" key={group.group} data-reveal>
              <dt className="label">{group.group}</dt>
              <dd>
                <ul className="spec__items">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
