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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
    root.classList.add("reveal-ready");

    return () => observer.disconnect();
  }, []);
}
