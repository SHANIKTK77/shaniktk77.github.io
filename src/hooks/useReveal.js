import { useEffect } from "react";

// Fades in every [data-reveal] element the first time it scrolls into view.
// Without IntersectionObserver (old browsers, tests) everything is shown straight away.
export default function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const targets = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return undefined;
    }

    // A "wipe" element starts fully clipped, and Chrome counts the target's own clip-path,
    // so it would never intersect. Watch its parent instead and reveal it from there.
    const watched = new Map();
    targets.forEach((el) => {
      const anchor = el.dataset.reveal === "wipe" && el.parentElement ? el.parentElement : el;
      if (!watched.has(anchor)) watched.set(anchor, []);
      watched.get(anchor).push(el);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            watched.get(entry.target).forEach((el) => el.classList.add("is-visible"));
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    watched.forEach((_, anchor) => observer.observe(anchor));
    root.classList.add("reveal-ready");

    return () => observer.disconnect();
  }, []);
}
