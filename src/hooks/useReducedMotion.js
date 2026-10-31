import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// True when the visitor has asked for less motion. Follows the setting if it changes.
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(() => !!window.matchMedia?.(QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia?.(QUERY);
    if (!query) return undefined;
    const onChange = () => setReduced(query.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}
