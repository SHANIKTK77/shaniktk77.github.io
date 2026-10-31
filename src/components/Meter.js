import "./Meter.css";

// A before/after reading, drawn as two bars against the same scale.
// The numbers are always printed too; the bars only make the change easy to see.
export default function Meter({ name, before, after, unit }) {
  const scale = Math.max(before, after);
  const format = (n) => `${n}${unit}`;

  return (
    <div className="meter">
      <div className="meter__row">
        <span className="meter__key">Before</span>
        <span className="meter__track" aria-hidden="true">
          <span className="meter__fill meter__fill--before" style={{ "--fill": before / scale }} />
        </span>
        <span className="meter__value">{format(before)}</span>
      </div>
      <div className="meter__row">
        <span className="meter__key">After</span>
        <span className="meter__track" aria-hidden="true">
          <span className="meter__fill meter__fill--after" style={{ "--fill": after / scale }} />
        </span>
        <span className="meter__value meter__value--after">{format(after)}</span>
      </div>
      <span className="visually-hidden">
        {name} went from {format(before)} to {format(after)}.
      </span>
    </div>
  );
}
