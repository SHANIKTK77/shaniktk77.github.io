import { useEffect, useState } from "react";

// Returns the id of the section currently crossing the middle of the viewport,
// so the header can mark where the visitor is.
export default function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    key.split(",").forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    // The intro sits above every section; clear the marker when back at the top
    const top = document.getElementById("top");
    if (top) observer.observe(top);

    return () => observer.disconnect();
  }, [key]);

  return active;
}
