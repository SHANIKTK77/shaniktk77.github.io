import { SECTIONS } from "../sections";
import "./SectionHead.css";

// The numbered heading every section opens with: "01 / 04 — Work" above an oversized title
// that wipes in from the left.
export default function SectionHead({ index, label, title, id, children }) {
  return (
    <div className="section-head">
      <p className="section-head__index label" data-reveal>
        <span className="section-head__number">{index}</span>
        <span aria-hidden="true">/ {String(SECTIONS.length).padStart(2, "0")}</span>
        <span className="section-head__rule" aria-hidden="true" />
        <span>{label}</span>
      </p>
      <h2 id={id} data-reveal="wipe">
        {title}
      </h2>
      {children && (
        <div className="section-head__intro" data-reveal style={{ "--reveal-delay": "150ms" }}>
          {children}
        </div>
      )}
    </div>
  );
}
