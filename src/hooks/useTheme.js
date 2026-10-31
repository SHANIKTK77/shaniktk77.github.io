import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function systemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function storedTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

// Light or dark. Follows the system setting until the visitor picks one, then remembers it.
// public/index.html applies the stored choice before first paint so there's no flash.
export default function useTheme() {
  const [theme, setTheme] = useState(() => storedTheme() || systemTheme());

  // Keep following the system while the visitor hasn't chosen
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!storedTheme()) setTheme(query.matches ? "dark" : "light");
    };
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private mode or blocked storage: the switch still works for this visit
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}
