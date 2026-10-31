import { useState } from "react";
import "./Shot.css";

// A game screenshot that sharpens in once loaded. If it fails it shows the title on a
// missing-texture checkerboard.
// Width and height reserve the 16:9 box up front so nothing shifts while images load.
export default function Shot({ src, title, eager = false }) {
  const [state, setState] = useState("loading");

  return (
    <div className={`shot shot--${state}`}>
      {state === "error" ? (
        <span className="shot__fallback">
          <span>{title}</span>
        </span>
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
