import "./SectionHead.css";

// The numbered heading every section opens with: "01 — Work" above the title.
export default function SectionHead({ index, label, title, id, children }) {
  return (
    <div className="section-head" data-reveal>
      <p className="section-head__index label">
        <span>{index}</span>
        <span className="section-head__rule" aria-hidden="true" />
        <span>{label}</span>
      </p>
      <h2 id={id}>{title}</h2>
      {children && <div className="section-head__intro">{children}</div>}
    </div>
  );
}
