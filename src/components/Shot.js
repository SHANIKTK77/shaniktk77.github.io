import { useState } from "react";
import "./Shot.css";

// A game screenshot that fades in once loaded and falls back to the title if it fails.
// Width and height reserve the 16:9 box up front so nothing shifts while images load.
export default function Shot({ src, title, eager = false }) {
  const [state, setState] = useState("loading");

  return (
    <div className={`shot shot--${state}`}>
      {state === "error" ? (
        <span className="shot__fallback">{title}</span>
      ) : (
        <img
          src={src}
          alt={`Screenshot of ${title}`}
          width="1280"
          height="720"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      )}
    </div>
  );
}
